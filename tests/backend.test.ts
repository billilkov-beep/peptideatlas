import test,{before,after} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import type {FastifyInstance} from 'fastify';
import {buildApp} from '../server/app.js';
import {createUser} from '../server/auth.js';

let app:FastifyInstance;
type Session={cookie:string;csrf:string};
let admin:Session,editor:Session;
const password='Test-only-password-42!';
before(async()=>{
  app=await buildApp({dataDir:':memory:',publicUrl:'http://localhost:3000'});
  await createUser(app.atlasDb,{email:'admin@example.test',name:'Test Admin',password,role:'admin'});
  await createUser(app.atlasDb,{email:'editor@example.test',name:'Test Editor',password,role:'editor'});
  admin=await login('admin@example.test');editor=await login('editor@example.test');
});
after(async()=>{await app?.close();});

async function login(email:string):Promise<Session>{
  const result=await app.inject({method:'POST',url:'/api/auth/login',payload:{email,password}});
  assert.equal(result.statusCode,200,result.body);
  return {cookie:String(result.headers['set-cookie']).split(';')[0],csrf:result.json().csrfToken};
}
async function api(method:any,url:string,payload?:unknown,session=admin){return app.inject({method,url,payload:payload as any,headers:{cookie:session.cookie,'x-csrf-token':session.csrf}});}
function entry(overrides:Record<string,unknown>={}){
  return {slug:`test-${randomUUID().slice(0,8)}`,name:'Test peptide',aliases:['Test alias'],categories:['skin'],summary:'A test-only record for validating the publishing workflow.',description:'This paragraph is used to test the reference entry workflow. It is not clinical information.',mechanism:'Test mechanism',evidenceLevel:'limited',regulatoryStatus:'unspecified',jurisdiction:'Test',references:[{title:'FDA reference',url:'https://www.fda.gov/'}],reviewer:'Test reviewer',reviewedAt:'2026-10-27',reviewStatus:'reviewed',...overrides};
}
async function create(overrides:Record<string,unknown>={}){const result=await api('POST','/api/admin/peptides',entry(overrides));assert.equal(result.statusCode,201,result.body);return result.json();}
async function publish(record:any){const result=await api('POST',`/api/admin/peptides/${record.id}/publish`,{expectedRevision:record.revision});assert.equal(result.statusCode,200,result.body);return result.json();}

test('staff authentication, CSRF, same-origin requests and roles are enforced',async()=>{
  assert.equal((await app.inject('/api/admin/peptides')).statusCode,401);
  const badLogin=await app.inject({method:'POST',url:'/api/auth/login',payload:{email:'admin@example.test',password:'bad'}});assert.equal(badLogin.statusCode,401);
  const noCsrf=await app.inject({method:'POST',url:'/api/admin/peptides',payload:entry(),headers:{cookie:admin.cookie}});assert.equal(noCsrf.statusCode,403);
  const foreign=await app.inject({method:'POST',url:'/api/admin/peptides',payload:entry(),headers:{cookie:admin.cookie,'x-csrf-token':admin.csrf,origin:'https://other.example'}});assert.equal(foreign.statusCode,403);
  const draft=await api('POST','/api/admin/peptides',entry(),editor);assert.equal(draft.statusCode,201);
  assert.equal((await api('POST',`/api/admin/peptides/${draft.json().id}/publish`,{expectedRevision:1},editor)).statusCode,403);
  assert.equal((await api('GET','/api/admin/nodes',undefined,editor)).statusCode,403);
  assert.equal((await api('GET','/api/admin/export',undefined,editor)).statusCode,403);
});

test('drafts remain private; publishing validates review and snapshots isolate later edits',async()=>{
  const pending=await create({reviewStatus:'unreviewed',reviewer:'',reviewedAt:null});
  assert.equal((await api('POST',`/api/admin/peptides/${pending.id}/publish`,{expectedRevision:1})).statusCode,422);
  const sourceChecked=await publish(await create({reviewStatus:'source_checked',reviewer:'Peptide Atlas — AI source review'}));
  assert.equal((await app.inject(`/api/v1/peptides/${sourceChecked.slug}`)).json().reviewStatus,'source_checked');
  const draft=await create();
  assert.equal((await app.inject(`/api/v1/peptides/${draft.slug}`)).statusCode,404);
  assert.ok(!(await app.inject('/api/v1/catalog')).json().items.some((p:any)=>p.id===draft.id));
  const published=await publish(draft);
  const saved=await api('PUT',`/api/admin/peptides/${draft.id}`,{...published,summary:'New draft summary only',expectedRevision:published.revision});
  assert.equal(saved.statusCode,200,saved.body);
  assert.equal((await app.inject(`/api/v1/peptides/${draft.slug}`)).json().summary,draft.summary);
  const stale=await api('PUT',`/api/admin/peptides/${draft.id}`,{...published,expectedRevision:published.revision});assert.equal(stale.statusCode,409);
  const next=await publish(saved.json());assert.equal((await app.inject(`/api/v1/peptides/${draft.slug}`)).json().summary,'New draft summary only');
  const withdrawn=await api('POST',`/api/admin/peptides/${draft.id}/withdraw`,{expectedRevision:next.revision});assert.equal(withdrawn.statusCode,200);
  assert.equal((await app.inject(`/api/v1/peptides/${draft.slug}`)).statusCode,404);
});

test('restore creates a draft revision without silently changing the published article',async()=>{
  const draft=await create({summary:'Original summary'});const original=await publish(draft);
  const edited=(await api('PUT',`/api/admin/peptides/${draft.id}`,{...original,summary:'New published summary',expectedRevision:original.revision})).json();
  const current=await publish(edited);
  const history=(await api('GET',`/api/admin/peptides/${draft.id}/revisions`)).json().items;
  const first=history.find((r:any)=>r.revision===1);
  const restored=await api('POST',`/api/admin/peptides/${draft.id}/restore`,{revisionId:first.id,expectedRevision:current.revision});
  assert.equal(restored.statusCode,200,restored.body);assert.equal(restored.json().summary,'Original summary');
  assert.equal((await app.inject(`/api/v1/peptides/${draft.slug}`)).json().summary,'New published summary');
});

test('node snapshots are scoped, key rotation revokes old keys, disabling revokes access',async()=>{
  const skin=await publish(await create({categories:['skin']}));const brain=await publish(await create({categories:['brain']}));
  const result=await api('POST','/api/admin/nodes',{name:'Test WordPress',domain:'https://site.example',type:'wordpress',categories:['skin'],theme:{accent:'#225544',background:'#ffffff',font:'Arial, sans-serif'}});
  assert.equal(result.statusCode,201,result.body);const {node,apiKey}=result.json();
  const getSnapshot=(key:string,extra:Record<string,string>={})=>app.inject({url:'/api/v1/node/snapshot',headers:{authorization:`Bearer ${key}`,...extra}});
  const snapshot=await getSnapshot(apiKey);assert.equal(snapshot.statusCode,200);
  const {normalizeSnapshot}=await import(new URL('../examples/brand-site/lib/snapshot-cache.mjs',import.meta.url).href);
  const accepted=normalizeSnapshot(snapshot.json());assert.equal(accepted.items.length,snapshot.json().items.length);
  assert.equal(accepted.items.find((p:any)=>p.id===skin.id).references.length,skin.references.length);
  assert.ok(snapshot.json().items.some((p:any)=>p.id===skin.id));assert.ok(!snapshot.json().items.some((p:any)=>p.id===brain.id));
  assert.equal((await getSnapshot(apiKey,{'if-none-match':snapshot.headers.etag!})).statusCode,304);
  const listed=(await api('GET','/api/admin/nodes')).body;assert.ok(!listed.includes(apiKey));assert.ok(!listed.includes('key_hash'));assert.ok(!listed.includes('password_hash'));
  const rotated=await api('POST',`/api/admin/nodes/${node.id}/rotate-key`,{});assert.equal(rotated.statusCode,200);
  assert.equal((await getSnapshot(apiKey)).statusCode,401);assert.equal((await getSnapshot(rotated.json().apiKey)).statusCode,200);
  await api('PATCH',`/api/admin/nodes/${node.id}`,{enabled:false});assert.equal((await getSnapshot(rotated.json().apiKey)).statusCode,401);
});

test('public HTML escapes injected markup and preserves crawlable content and links',async()=>{
  const record=await publish(await create({name:'Example <script>alert(1)</script>',description:'A safe paragraph.\n\n<script>alert("bad")</script>'}));
  const response=await app.inject(`/peptides/${record.slug}`);assert.equal(response.statusCode,200);
  assert.ok(response.body.includes('&lt;script&gt;'));assert.ok(!response.body.includes('<script>alert'));
  assert.ok(response.body.includes('rel="canonical"'));assert.ok(response.body.includes('https://www.fda.gov/'));
  const renamed=(await api('PUT',`/api/admin/peptides/${record.id}`,{...record,slug:record.slug+'-renamed',expectedRevision:record.revision})).json();
  const stableLink=await app.inject('/p/'+record.id);assert.equal(stableLink.statusCode,302);assert.equal(stableLink.headers.location,'/peptides/'+record.slug);
  await publish(renamed);assert.equal((await app.inject('/p/'+record.id)).headers.location,'/peptides/'+renamed.slug);
  assert.equal((await api('POST','/api/admin/peptides',entry({references:[{title:'Unsafe',url:'javascript:alert(1)'}]}))).statusCode,400);
  assert.ok((await app.inject('/sitemap.xml')).body.includes(`/peptides/${renamed.slug}`));
});

test('portable export excludes secrets; import preserves IDs and rejects conflicts atomically',async()=>{
  const bundleResponse=await api('GET','/api/admin/export');assert.equal(bundleResponse.statusCode,200);
  const bundle=bundleResponse.json();assert.equal(bundle.schemaVersion,1);
  assert.ok(!bundleResponse.body.includes('password_hash'));assert.ok(!bundleResponse.body.includes('key_hash'));assert.ok(!bundleResponse.body.includes('token_hash'));assert.ok(!bundleResponse.body.includes(admin.csrf));
  const destination=await buildApp({dataDir:':memory:'});
  try{
    const {importBundle,exportBundle}=await import('../server/portable.js');
    const imported=await importBundle(destination.atlasDb,bundle);assert.equal(imported.inserted,bundle.records.length);
    const roundtrip=await exportBundle(destination.atlasDb);assert.deepEqual(roundtrip.records.map(r=>r.id).sort(),bundle.records.map((r:any)=>r.id).sort());
    assert.ok(roundtrip.nodes.every(n=>n.enabled===false));
    const repeated=await importBundle(destination.atlasDb,bundle);assert.equal(repeated.inserted,0);assert.equal(repeated.unchanged,bundle.records.length);
    const conflict=structuredClone(bundle);const copy=structuredClone(conflict.records[0]);const newId=randomUUID();
    copy.id=newId;copy.slug=`fresh-${randomUUID().slice(0,8)}`;copy.draft.id=newId;copy.draft.slug=copy.slug;if(copy.published){copy.published.id=newId;copy.published.slug=copy.slug;}copy.revisions=[];
    conflict.records[0].draft.summary='Conflicting imported summary';conflict.records.unshift(copy);
    await assert.rejects(()=>importBundle(destination.atlasDb,conflict),/conflict/i);
    const count=await destination.atlasDb.query('SELECT id FROM atlas_peptides WHERE id=$1',[newId]);assert.equal(count.rows.length,0);
  }finally{await destination.close();}
});

test('staff creation works and password reset invalidates every existing session',async()=>{
  const created=await api('POST','/api/admin/users',{email:'second@example.test',name:'Second editor',role:'editor',password});assert.equal(created.statusCode,201);
  const session=await login('second@example.test');assert.equal((await api('GET','/api/auth/me',undefined,session)).statusCode,200);
  assert.equal((await api('POST',`/api/admin/users/${created.json().id}/password`,{password:'Changed-test-password-42!'})).statusCode,200);
  assert.equal((await api('GET','/api/auth/me',undefined,session)).statusCode,401);
});
