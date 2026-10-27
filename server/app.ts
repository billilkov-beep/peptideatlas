import Fastify, {type FastifyInstance,type FastifyRequest} from 'fastify';
import cookie from '@fastify/cookie';
import staticPlugin from '@fastify/static';
import {z,ZodError} from 'zod';
import {randomUUID,timingSafeEqual} from 'node:crypto';
import {access,readFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {openDatabase,type Database} from './db.js';
import {createUser,digest,randomToken,verifyPassword,hashPassword} from './auth.js';
import {categories,contentSchema,displayStatusSchema,nodeSchema,toPeptide,toNode,type User,type Peptide,iso} from './types.js';
import {installCatalog,readCatalog,readInventory,coverageFor} from './catalog.js';
import {exportBundle,importBundle} from './portable.js';
import {renderPeptide,escapeHtml} from './html.js';
import {LoginRateLimiter} from './login-rate-limit.js';

declare module 'fastify' {
  interface FastifyInstance {atlasDb:Database;}
  interface FastifyRequest {atlasUser?:User;atlasCsrf?:string;atlasSessionHash?:string;}
}
class Fault extends Error{constructor(public statusCode:number,message:string){super(message);}}
const uuid=z.string().uuid();
const versionBody=z.object({expectedRevision:z.number().int().positive()});
const objectBody=(request:FastifyRequest)=>request.body&&typeof request.body==='object'?request.body as Record<string,unknown>:{};
const idParam=(request:FastifyRequest)=>uuid.parse((request.params as any).id);
const safeEqual=(a:string,b:string)=>{const aa=Buffer.from(a),bb=Buffer.from(b);return aa.length===bb.length&&timingSafeEqual(aa,bb);};
const publicUser=(row:any):User=>({id:row.id,email:row.email,name:row.name,role:row.role});

export interface AppOptions {dataDir?:string;databaseUrl?:string;seedDemo?:boolean;loadCatalog?:boolean;publicUrl?:string;secureCookies?:boolean;logger?:boolean;staticDir?:string;}

export async function buildApp(options:AppOptions={}):Promise<FastifyInstance>{
  const db=await openDatabase(options);
  if(options.loadCatalog||options.seedDemo)await installCatalog(db);
  const app=Fastify({logger:options.logger??false,bodyLimit:10*1024*1024,trustProxy:false});
  const publicUrl=(options.publicUrl??'http://localhost:3000').replace(/\/$/,'');
  const secureCookies=options.secureCookies??publicUrl.startsWith('https://');
  const staticDir=resolve(options.staticDir??'dist/web');
  app.decorate('atlasDb',db);
  app.addHook('onClose',async()=>db.close());
  await app.register(cookie);
  app.addHook('onSend',async(request,reply,payload)=>{
    reply.header('X-Content-Type-Options','nosniff');
    reply.header('Referrer-Policy','strict-origin-when-cross-origin');
    reply.header('X-Frame-Options','DENY');
    reply.header('Permissions-Policy','camera=(), microphone=(), geolocation=()');
    const route=request.routeOptions.url??'';
    if(route.startsWith('/api/admin')||route.startsWith('/api/auth'))reply.header('Cache-Control','no-store');
    if(secureCookies)reply.header('Strict-Transport-Security','max-age=31536000');
    return payload;
  });
  app.setErrorHandler((error,request,reply)=>{
    if(error instanceof ZodError)return reply.code(400).send({error:'validation_error',message:error.issues.map(i=>`${i.path.join('.')||'Input'}: ${i.message}`).join('; ')});
    if((error as any).code==='23505')return reply.code(409).send({error:'conflict',message:'That record, slug, or account already exists.'});
    if((error as any).code==='22P02')return reply.code(400).send({error:'invalid_identifier',message:'Invalid identifier or value.'});
    const status=(error as any).statusCode??500;
    if(status>=500)request.log.error(error);
    return reply.code(status).send({error:status===401?'unauthorized':status===403?'forbidden':status===404?'not_found':status===409?'conflict':status===429?'rate_limited':'request_failed',message:status>=500?'The request could not be completed.':error instanceof Error?error.message:'The request was not valid.'});
  });
  app.addHook('preHandler',async request=>{
    // Match the router's canonical route: encoded static characters in the raw
    // URL must not bypass authentication or the CSRF guard.
    const path=request.routeOptions.url??'';
    if(path.startsWith('/api/admin')||path==='/api/auth/me'||path==='/api/auth/logout'){
      const token=request.cookies.atlas_session;
      if(!token)throw new Fault(401,'Sign in to continue.');
      const tokenHash=digest(token);
      const found=await db.query('SELECT u.id,u.email,u.name,u.role,s.csrf_token FROM atlas_sessions s JOIN atlas_users u ON u.id=s.user_id WHERE s.token_hash=$1 AND s.expires_at>now()',[tokenHash]);
      if(!found.rows.length)throw new Fault(401,'Your session has expired. Please sign in.');
      request.atlasUser=publicUser(found.rows[0]);request.atlasCsrf=found.rows[0].csrf_token;request.atlasSessionHash=tokenHash;
      if(!['GET','HEAD','OPTIONS'].includes(request.method)){
        const csrf=request.headers['x-csrf-token'];
        if(typeof csrf!=='string'||!safeEqual(csrf,request.atlasCsrf!))throw new Fault(403,'The session security token is missing or invalid. Refresh and try again.');
        checkOrigin(request,publicUrl);
      }
    }
  });
  const admin=(request:FastifyRequest)=>{if(request.atlasUser?.role!=='admin')throw new Fault(403,'Administrator access is required.');};
  const audit=async(tx:Database,request:FastifyRequest,action:string,label:string)=>tx.query('INSERT INTO atlas_audit(id,action,label,actor) VALUES($1,$2,$3,$4)',[randomUUID(),action,label,request.atlasUser?.email??'System']);
  const rowFor=async(tx:Database,id:string,lock=false)=>{
    const result=await tx.query(`SELECT * FROM atlas_peptides WHERE id=$1${lock?' FOR UPDATE':''}`,[id]);
    if(!result.rows.length)throw new Fault(404,'Peptide entry not found.');return result.rows[0];
  };
  const checkRevision=(row:any,expected:number)=>{if(row.revision!==expected)throw new Fault(409,'This entry changed in another session. Reload it before saving.');};
  const saveRevision=async(tx:Database,content:Peptide,action:string)=>tx.query('INSERT INTO atlas_revisions(id,peptide_id,revision,action,content,created_at) VALUES($1,$2,$3,$4,$5,$6)',[randomUUID(),content.id,content.revision,action,JSON.stringify(content),content.updatedAt]);
  const catalog=async(tx:Database=db)=>{
    const rows=await tx.query('SELECT published FROM atlas_peptides WHERE published IS NOT NULL AND state=\'published\' ORDER BY published->>\'name\'');
    const items=rows.rows.map(r=>r.published as Peptide);
    const version=digest(JSON.stringify(items)).slice(0,24);
    return {items,version};
  };

  app.get('/api/health',async()=>{await db.query('SELECT 1');return {status:'ok',version:'1.2.0',database:db.kind};});
  app.get('/api/auth/status',async()=>({requiresSetup:!(await db.query('SELECT id FROM atlas_users LIMIT 1')).rows.length}));
  const loginAttempts=new LoginRateLimiter();
  const dummyPasswordHash=await hashPassword(randomToken());
  app.post('/api/auth/login',{bodyLimit:4096},async(request,reply)=>{
    checkOrigin(request,publicUrl);
    const input=z.object({email:z.string().email().max(254),password:z.string().min(1).max(256)}).parse(request.body);
    const email=input.email.toLowerCase();
    const allowance=loginAttempts.consume(request.ip,email);
    if(!allowance.allowed){reply.header('Retry-After',String(allowance.retryAfterSeconds));throw new Fault(429,'Too many sign-in attempts. Please try again later.');}
    const found=await db.query('SELECT * FROM atlas_users WHERE email=$1',[email]);
    const user=found.rows[0];
    const passwordValid=await verifyPassword(input.password,user?.password_hash??dummyPasswordHash);
    if(!user||!passwordValid)throw new Fault(401,'Email or password is incorrect.');
    loginAttempts.successfulLogin(request.ip,email);
    const token=randomToken(),csrf=randomToken();
    await db.transaction(async tx=>{
      await tx.query('DELETE FROM atlas_sessions WHERE expires_at<=now()');
      await tx.query('INSERT INTO atlas_sessions(token_hash,user_id,csrf_token,expires_at) VALUES($1,$2,$3,$4)',[digest(token),user.id,csrf,new Date(Date.now()+8*3600*1000).toISOString()]);
    });
    reply.setCookie('atlas_session',token,{path:'/',httpOnly:true,secure:secureCookies,sameSite:'lax',maxAge:8*3600});
    return {user:publicUser(user),csrfToken:csrf};
  });
  app.get('/api/auth/me',async request=>({user:request.atlasUser,csrfToken:request.atlasCsrf}));
  app.post('/api/auth/logout',async(request,reply)=>{await db.query('DELETE FROM atlas_sessions WHERE token_hash=$1',[request.atlasSessionHash]);reply.clearCookie('atlas_session',{path:'/'});return {ok:true};});

  app.get('/api/v1/catalog',async(request,reply)=>{
    const input=z.object({q:z.string().max(200).optional(),category:z.string().max(50).optional(),evidence:z.string().max(50).optional(),status:z.string().max(50).optional(),displayStatus:displayStatusSchema.optional()}).parse(request.query);
    const full=await catalog();let items=full.items;
    if(input.q){const q=input.q.toLowerCase();items=items.filter(p=>`${p.name} ${p.aliases.join(' ')} ${(p.referenceNames??[]).join(' ')} ${p.summary}`.toLowerCase().includes(q));}
    if(input.category)items=items.filter(p=>p.categories.some(c=>c===input.category));
    if(input.evidence)items=items.filter(p=>p.evidenceLevel===input.evidence);
    if(input.status)items=items.filter(p=>p.regulatoryStatus===input.status);
    if(input.displayStatus)items=items.filter(p=>p.displayStatus===input.displayStatus);
    const referenceNames=new Set(full.items.flatMap(p=>p.referenceNames??[]));
    const release=(await db.query("SELECT value FROM atlas_meta WHERE key='catalogRelease'")).rows[0]?.value??null;
    const starter=(await db.query('SELECT value FROM atlas_meta WHERE key=\'starterContent\'')).rows[0]?.value===true;
    reply.header('Cache-Control','public, max-age=30');
    return {items,total:items.length,categories,version:full.version,generatedAt:new Date().toISOString(),starterContent:starter,catalogRelease:release,referenceCoverage:{covered:referenceNames.size,total:152}};
  });
  app.get('/api/v1/peptides/:slug',async request=>{
    const slug=z.string().max(120).parse((request.params as any).slug);
    const found=await db.query('SELECT published FROM atlas_peptides WHERE published->>\'slug\'=$1 AND state=\'published\'',[slug]);
    if(!found.rows.length){const alias=(await catalog()).items.find(p=>p.referenceNames?.some(name=>name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')===slug));if(alias)return alias;throw new Fault(404,'Published peptide entry not found.');}return found.rows[0].published;
  });
  app.get('/api/admin/catalog-coverage',async()=>{
    const rows=await db.query('SELECT * FROM atlas_peptides ORDER BY slug');
    const items=coverageFor(rows.rows.map(toPeptide),await readInventory());
    const published=await catalog();const publicNames=new Set(published.items.flatMap(p=>p.referenceNames??[]));
    const release=await readCatalog();
    return {release:release.release,sourceCheckedAt:release.sourceCheckedAt,total:items.length,covered:items.filter(i=>i.covered).length,published:publicNames.size,canonicalProfiles:rows.rows.length,items:items.map(i=>({...i,published:publicNames.has(i.referenceName)}))};
  });
  app.get('/api/admin/overview',async()=>{
    const counts=(await db.query("SELECT count(*)::int AS total,count(*) FILTER(WHERE published IS NOT NULL)::int AS published,count(*) FILTER(WHERE published IS NULL OR draft IS DISTINCT FROM published)::int AS drafts FROM atlas_peptides")).rows[0];
    const nodes=await db.query('SELECT * FROM atlas_nodes ORDER BY created_at DESC');
    const activities=await db.query('SELECT * FROM atlas_audit ORDER BY created_at DESC LIMIT 8');
    return {counts:{...counts,nodes:nodes.rows.length},recentActivity:activities.rows.map(r=>({id:r.id,action:r.action,label:r.label,actor:r.actor,createdAt:iso(r.created_at)})),nodes:nodes.rows.map(toNode)};
  });
  app.get('/api/admin/peptides',async()=>{const result=await db.query('SELECT * FROM atlas_peptides ORDER BY updated_at DESC');return {items:result.rows.map(toPeptide),total:result.rows.length};});
  app.get('/api/admin/peptides/:id',async request=>toPeptide(await rowFor(db,idParam(request))));
  app.post('/api/admin/peptides',async(request,reply)=>{
    const parsed=contentSchema.parse(request.body);const id=randomUUID(),updatedAt=new Date().toISOString();
    const content:Peptide={...parsed,id,revision:1,publicationState:'draft',updatedAt};
    await db.transaction(async tx=>{
      await tx.query('INSERT INTO atlas_peptides(id,slug,draft,revision,updated_at) VALUES($1,$2,$3,1,$4)',[id,content.slug,JSON.stringify(content),updatedAt]);
      await saveRevision(tx,content,'create');await audit(tx,request,'create',`Created ${content.name}`);
    });
    return reply.code(201).send(content);
  });
  app.put('/api/admin/peptides/:id',async request=>{
    const id=idParam(request),input=objectBody(request),parsed=contentSchema.parse(input),{expectedRevision}=versionBody.parse(input);
    return db.transaction(async tx=>{
      const row=await rowFor(tx,id,true);checkRevision(row,expectedRevision);
      const content:Peptide={...parsed,id,revision:row.revision+1,publicationState:row.state,updatedAt:new Date().toISOString()};
      await tx.query('UPDATE atlas_peptides SET slug=$2,draft=$3,revision=$4,updated_at=$5 WHERE id=$1',[id,content.slug,JSON.stringify(content),content.revision,content.updatedAt]);
      await saveRevision(tx,content,'edit');await audit(tx,request,'edit',`Saved draft for ${content.name}`);return content;
    });
  });
  app.post('/api/admin/peptides/:id/publish',async request=>{
    admin(request);const id=idParam(request),{expectedRevision}=versionBody.parse(request.body);
    return db.transaction(async tx=>{
      const row=await rowFor(tx,id,true);checkRevision(row,expectedRevision);const parsed=contentSchema.parse(row.draft);
      if(parsed.reviewStatus==='unreviewed'||!parsed.description||!parsed.references.length)throw new Fault(422,'Complete the description, source references, reviewer, and review date before publishing.');
      const content:Peptide={...parsed,id,revision:row.revision+1,publicationState:'published',updatedAt:new Date().toISOString()};
      await tx.query('UPDATE atlas_peptides SET draft=$2,published=$2,revision=$3,state=\'published\',updated_at=$4 WHERE id=$1',[id,JSON.stringify(content),content.revision,content.updatedAt]);
      await saveRevision(tx,content,'publish');await audit(tx,request,'publish',`Published ${content.name}`);return content;
    });
  });
  app.post('/api/admin/peptides/:id/withdraw',async request=>{
    admin(request);const id=idParam(request),{expectedRevision}=versionBody.parse(request.body);
    return db.transaction(async tx=>{
      const row=await rowFor(tx,id,true);checkRevision(row,expectedRevision);
      const content:Peptide={...contentSchema.parse(row.draft),id,revision:row.revision+1,publicationState:'withdrawn',updatedAt:new Date().toISOString()};
      await tx.query('UPDATE atlas_peptides SET draft=$2,published=NULL,revision=$3,state=\'withdrawn\',updated_at=$4 WHERE id=$1',[id,JSON.stringify(content),content.revision,content.updatedAt]);
      await saveRevision(tx,content,'withdraw');await audit(tx,request,'withdraw',`Withdrew ${content.name}`);return content;
    });
  });
  app.get('/api/admin/peptides/:id/revisions',async request=>{
    const id=idParam(request);await rowFor(db,id);const result=await db.query('SELECT * FROM atlas_revisions WHERE peptide_id=$1 ORDER BY revision DESC',[id]);
    return {items:result.rows.map(r=>({id:r.id,revision:r.revision,action:r.action,createdAt:iso(r.created_at),content:r.content}))};
  });
  app.post('/api/admin/peptides/:id/restore',async request=>{
    const id=idParam(request),input=versionBody.extend({revisionId:uuid}).parse(request.body);
    return db.transaction(async tx=>{
      const row=await rowFor(tx,id,true);checkRevision(row,input.expectedRevision);
      const old=await tx.query('SELECT content FROM atlas_revisions WHERE id=$1 AND peptide_id=$2',[input.revisionId,id]);
      if(!old.rows.length)throw new Fault(404,'Revision not found.');
      const content:Peptide={...contentSchema.parse(old.rows[0].content),id,revision:row.revision+1,publicationState:row.state,updatedAt:new Date().toISOString()};
      await tx.query('UPDATE atlas_peptides SET slug=$2,draft=$3,revision=$4,updated_at=$5 WHERE id=$1',[id,content.slug,JSON.stringify(content),content.revision,content.updatedAt]);
      await saveRevision(tx,content,'restore');await audit(tx,request,'restore',`Restored an earlier draft for ${content.name}`);return content;
    });
  });

  app.get('/api/admin/nodes',async request=>{admin(request);const found=await db.query('SELECT * FROM atlas_nodes ORDER BY created_at DESC');return {items:found.rows.map(toNode),total:found.rows.length};});
  app.post('/api/admin/nodes',async(request,reply)=>{
    admin(request);const node=nodeSchema.parse(request.body),id=randomUUID(),apiKey=`pa_${randomToken()}`;
    const row=await db.transaction(async tx=>{
      const result=await tx.query('INSERT INTO atlas_nodes(id,name,domain,type,categories,theme,key_hash) VALUES($1,$2,$3,$4,$5,$6,$7) RETURNING *',[id,node.name,node.domain,node.type,JSON.stringify(node.categories),JSON.stringify(node.theme),digest(apiKey)]);
      await audit(tx,request,'node_create',`Connected ${node.name}`);return result.rows[0];
    });
    return reply.code(201).send({node:toNode(row),apiKey});
  });
  app.patch('/api/admin/nodes/:id',async request=>{
    admin(request);const id=idParam(request),input=objectBody(request);
    return db.transaction(async tx=>{
      const existing=await tx.query('SELECT * FROM atlas_nodes WHERE id=$1 FOR UPDATE',[id]);if(!existing.rows.length)throw new Fault(404,'Website connection not found.');
      const prior=existing.rows[0],node=nodeSchema.parse({...toNode(prior),...input});
      const enabled=input.enabled===undefined?prior.enabled:z.boolean().parse(input.enabled);
      if(enabled&&!prior.key_hash)throw new Fault(422,'Generate a new connection key before enabling this imported website.');
      const result=await tx.query('UPDATE atlas_nodes SET name=$2,domain=$3,type=$4,categories=$5,theme=$6,enabled=$7 WHERE id=$1 RETURNING *',[id,node.name,node.domain,node.type,JSON.stringify(node.categories),JSON.stringify(node.theme),enabled]);
      await audit(tx,request,'node_update',`Updated ${node.name}`);return toNode(result.rows[0]);
    });
  });
  app.post('/api/admin/nodes/:id/rotate-key',async request=>{
    admin(request);const id=idParam(request),apiKey=`pa_${randomToken()}`;
    const node=await db.transaction(async tx=>{
      const result=await tx.query('UPDATE atlas_nodes SET key_hash=$2 WHERE id=$1 RETURNING *',[id,digest(apiKey)]);if(!result.rows.length)throw new Fault(404,'Website connection not found.');
      await audit(tx,request,'node_key_rotate',`Rotated key for ${result.rows[0].name}`);return toNode(result.rows[0]);
    });return {node,apiKey};
  });
  app.get('/api/v1/node/snapshot',async(request,reply)=>{
    const authorization=request.headers.authorization;
    if(!authorization?.startsWith('Bearer ')||authorization.length>500)throw new Fault(401,'A valid website connection key is required.');
    const result=await db.query('SELECT * FROM atlas_nodes WHERE key_hash=$1 AND enabled=true',[digest(authorization.slice(7))]);
    if(!result.rows.length)throw new Fault(401,'The website connection key is invalid or disabled.');
    const node=result.rows[0],full=await catalog();
    const items=node.categories.length?full.items.filter(p=>p.categories.some(c=>node.categories.includes(c))):full.items;
    const version=digest(JSON.stringify({items,node:toNode({...node,last_sync_at:null,last_version:null})})).slice(0,24);
    await db.query('UPDATE atlas_nodes SET last_sync_at=now(),last_version=$2 WHERE id=$1',[node.id,version]);
    reply.header('Cache-Control','private, no-store');reply.header('ETag',`"${version}"`);
    if(request.headers['if-none-match']===`"${version}"`)return reply.code(304).send();
    return {schemaVersion:1,version,node:{id:node.id,name:node.name,domain:node.domain,theme:node.theme,categories:node.categories},items,generatedAt:new Date().toISOString(),viewerVersion:'1.2.0',maxAgeSeconds:86400};
  });
  app.get('/api/admin/audit',async request=>{admin(request);const found=await db.query('SELECT * FROM atlas_audit ORDER BY created_at DESC LIMIT 500');return {items:found.rows.map(r=>({id:r.id,action:r.action,label:r.label,actor:r.actor,createdAt:iso(r.created_at)})),total:found.rows.length};});
  app.get('/api/admin/export',async(request,reply)=>{admin(request);reply.header('Content-Disposition',`attachment; filename="peptide-atlas-export-${new Date().toISOString().slice(0,10)}.json"`);return exportBundle(db);});
  app.post('/api/admin/import',async request=>{admin(request);const input=z.object({bundle:z.unknown(),mode:z.literal('merge')}).parse(request.body);return importBundle(db,input.bundle,request.atlasUser!.email);});
  app.get('/api/admin/users',async request=>{admin(request);const result=await db.query('SELECT id,email,name,role,created_at FROM atlas_users ORDER BY created_at');return {items:result.rows.map(r=>({...publicUser(r),createdAt:iso(r.created_at)})),total:result.rows.length};});
  app.post('/api/admin/users',async(request,reply)=>{
    admin(request);const input=z.object({email:z.string().email(),name:z.string().min(1).max(120),role:z.enum(['admin','editor']),password:z.string().min(12).max(256)}).parse(request.body);
    const user=await createUser(db,input);await audit(db,request,'user_create',`Created ${user.role} account ${user.email}`);return reply.code(201).send(user);
  });
  app.post('/api/admin/users/:id/password',async request=>{
    admin(request);const id=idParam(request),{password}=z.object({password:z.string().min(12).max(256)}).parse(request.body);
    const {hashPassword}=await import('./auth.js');const hash=await hashPassword(password);
    await db.transaction(async tx=>{
      const result=await tx.query('UPDATE atlas_users SET password_hash=$2 WHERE id=$1 RETURNING email',[id,hash]);if(!result.rows.length)throw new Fault(404,'Staff account not found.');
      await tx.query('DELETE FROM atlas_sessions WHERE user_id=$1',[id]);await audit(tx,request,'password_reset',`Reset password for ${result.rows[0].email}`);
    });return {ok:true};
  });

  app.get('/p/:id',async(request,reply)=>{
    const id=idParam(request);
    const found=await db.query("SELECT published FROM atlas_peptides WHERE id=$1 AND state='published'",[id]);
    if(!found.rows.length)throw new Fault(404,'Published peptide entry not found.');
    return reply.header('Cache-Control','no-store').code(302).redirect('/peptides/'+encodeURIComponent(found.rows[0].published.slug));
  });
  app.get('/peptides/:slug',async(request,reply)=>{
    const slug=z.string().max(120).parse((request.params as any).slug);
    const found=await db.query('SELECT published FROM atlas_peptides WHERE published->>\'slug\'=$1 AND state=\'published\'',[slug]);
    if(!found.rows.length){const alias=(await catalog()).items.find(p=>p.referenceNames?.some(name=>name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'')===slug));if(alias)return reply.code(301).redirect('/peptides/'+encodeURIComponent(alias.slug));}
    if(!found.rows.length)return reply.code(404).type('text/html').send('<!doctype html><title>Entry not found</title><h1>Entry not found</h1><p>This profile is not currently published.</p><a href="/">Return to the library</a>');
    const profile=found.rows[0].published as Peptide;
    const related=(await catalog()).items.filter(p=>profile.relatedSlugs?.includes(p.slug)&&p.id!==profile.id).slice(0,6);
    return reply.type('text/html').send(renderPeptide(profile,publicUrl,related));
  });
  app.get('/sitemap.xml',async(_request,reply)=>{
    const full=await catalog();const entries=full.items.map(p=>`<url><loc>${escapeHtml(publicUrl)}/peptides/${encodeURIComponent(p.slug)}</loc><lastmod>${escapeHtml(p.updatedAt)}</lastmod></url>`).join('');
    return reply.type('application/xml').send(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"><url><loc>${escapeHtml(publicUrl)}/</loc></url>${entries}</urlset>`);
  });
  app.get('/robots.txt',async(_request,reply)=>reply.type('text/plain').send(`User-agent: *\nDisallow: /admin\nDisallow: /api/admin\nDisallow: /api/auth\nSitemap: ${publicUrl}/sitemap.xml\n`));
  try{await access(staticDir);await app.register(staticPlugin,{root:staticDir,prefix:'/',wildcard:false,setHeaders(reply){reply.header('Access-Control-Allow-Origin','*');}});}catch{}
  app.setNotFoundHandler(async(request,reply)=>{
    if(request.url.startsWith('/api/'))return reply.code(404).send({error:'not_found',message:'API endpoint not found.'});
    const path=request.url.split('?')[0];
    if(request.method==='GET'&&(path==='/'||path==='/library'||path.startsWith('/admin')||path==='/login')){
      try{return reply.type('text/html').send(await readFile(resolve(staticDir,'index.html'),'utf8'));}
      catch{return reply.code(503).type('text/html').send('<!doctype html><title>Peptide Atlas</title><h1>Peptide Atlas</h1><p>Run npm run build to prepare the application interface.</p>');}
    }
    return reply.code(404).send({error:'not_found',message:'Page not found.'});
  });
  return app;
}

function checkOrigin(request:FastifyRequest,publicUrl:string){
  const origin=request.headers.origin;
  if(origin&&origin!==new URL(publicUrl).origin)throw new Fault(403,'This request origin is not allowed.');
}
