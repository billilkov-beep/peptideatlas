import test,{before,after} from 'node:test';
import assert from 'node:assert/strict';
import {randomUUID} from 'node:crypto';
import {buildApp} from '../server/app.js';
import {readCatalog,readInventory,installCatalog,coverageFor} from '../server/catalog.js';
import {contentSchema} from '../server/types.js';
import {openDatabase} from '../server/db.js';
import {exportBundle,importBundle} from '../server/portable.js';
import type {FastifyInstance} from 'fastify';

let app:FastifyInstance;
before(async()=>{app=await buildApp({dataDir:':memory:',loadCatalog:true});});
after(async()=>{await app?.close();});

test('complete installed catalogue represents all 152 reference entries with 147 full canonical articles',async()=>{
  const catalog=await readCatalog(),inventory=await readInventory();
  const response=await app.inject('/api/v1/catalog');assert.equal(response.statusCode,200);
  const snapshot=response.json();assert.equal(snapshot.items.length,147);assert.equal(snapshot.starterContent,false);
  assert.deepEqual(snapshot.referenceCoverage,{covered:152,total:152});
  assert.equal(coverageFor(snapshot.items,inventory).filter(row=>row.covered).length,152);
  for(const profile of catalog.profiles){
    assert.equal(profile.reviewStatus,'source_checked',profile.slug);
    assert.ok(profile.sections&&profile.sections.length>=3,profile.slug);
    assert.ok(profile.atAGlance&&profile.atAGlance.length>=4,profile.slug);
    assert.ok(profile.keyTakeaway&&profile.molecularClass&&profile.mechanism&&profile.description,profile.slug);
    for(const section of profile.sections??[])assert.ok(section.citations.length&&section.citations.every(n=>n<=profile.references.length),profile.slug+' / '+section.id);
  }
  const installedAgain=await installCatalog(app.atlasDb);assert.equal(installedAgain.alreadyInstalled,true);
  assert.equal((await app.inject('/api/v1/catalog')).json().items.length,147);
});

test('alias routes resolve to one canonical article and full article sources remain crawlable',async()=>{
  const canonical=(await app.inject('/api/v1/peptides/bremelanotide')).json();
  const alias=(await app.inject('/api/v1/peptides/pt-141')).json();
  assert.equal(alias.id,canonical.id);
  const redirect=await app.inject('/peptides/pt-141');assert.equal(redirect.statusCode,301);assert.equal(redirect.headers.location,'/peptides/bremelanotide');
  const page=await app.inject('/peptides/bremelanotide');assert.equal(page.statusCode,200);
  assert.ok(page.body.includes('At a glance'));assert.ok(page.body.includes('AI-assisted source review'));
  for(const section of canonical.sections)assert.ok(page.body.includes('id="'+section.id+'"'));
  for(let index=1;index<=canonical.references.length;index++)assert.ok(page.body.includes('id="ref-'+index+'"'));
  assert.ok(page.body.includes('MedicalWebPage'));assert.ok(page.body.includes('Related profiles'));
  const searched=(await app.inject('/api/v1/catalog?q=PT-141')).json();assert.ok(searched.items.some((item:any)=>item.id===canonical.id));
});

test('catalogue upgrades retain legacy IDs and preserve human-edited or withdrawn content',async()=>{
  const database=await openDatabase({dataDir:':memory:'});
  try{
    const catalog=await readCatalog();const ids=[randomUUID(),randomUUID(),randomUUID()];
    const cases=[['starter_import','published'],['save','published'],['starter_import','withdrawn']];
    for(let index=0;index<cases.length;index++){
      const [action,state]=cases[index];const raw=catalog.profiles[index];
      const content={...raw,id:ids[index],catalogRelease:'old',revision:1,publicationState:state,summary:'Existing content '+index,updatedAt:'2026-10-01T00:00:00.000Z'};
      await database.query('INSERT INTO atlas_peptides(id,slug,draft,published,revision,state) VALUES($1,$2,$3,$4,1,$5)',[ids[index],raw.slug,JSON.stringify(content),state==='published'?JSON.stringify(content):null,state]);
      await database.query('INSERT INTO atlas_revisions(id,peptide_id,revision,action,content) VALUES($1,$2,1,$3,$4)',[randomUUID(),ids[index],action,JSON.stringify(content)]);
    }
    const result=await installCatalog(database);assert.equal(result.upgraded,1);assert.equal(result.preserved,2);assert.equal(result.inserted,144);
    const rows=(await database.query('SELECT id,draft,state FROM atlas_peptides WHERE id=ANY($1::uuid[])',[ids])).rows;
    const upgraded=rows.find(row=>row.id===ids[0])!;assert.equal(upgraded.draft.catalogRelease,catalog.release);assert.equal(upgraded.draft.revision,2);
    assert.equal(rows.find(row=>row.id===ids[1])!.draft.summary,'Existing content 1');
    assert.equal(rows.find(row=>row.id===ids[2])!.state,'withdrawn');
    // A published rename must retain both a legacy random ID and a new canonical ID.
    const renamedIds=[];
    for(const [index,slug] of [catalog.profiles[0].slug,catalog.profiles[3].slug].entries()){
      const row=(await database.query('SELECT * FROM atlas_peptides WHERE slug=$1',[slug])).rows[0];
      const renamed={...row.draft,slug:'renamed-profile-'+index,revision:row.revision+1};
      delete renamed.referenceNames;
      await database.query('UPDATE atlas_peptides SET slug=$2,draft=$3,published=$3,revision=$4 WHERE id=$1',[row.id,renamed.slug,JSON.stringify(renamed),renamed.revision]);
      await database.query('INSERT INTO atlas_revisions(id,peptide_id,revision,action,content) VALUES($1,$2,$3,\'save\',$4)',[randomUUID(),row.id,renamed.revision,JSON.stringify(renamed)]);
      renamedIds.push(row.id);
    }
    const next=await installCatalog(database,{...catalog,release:catalog.release+'.next'});
    assert.equal(next.inserted,0);assert.equal(next.preserved,4);
    assert.equal((await database.query('SELECT count(*)::int AS total FROM atlas_peptides')).rows[0].total,147);
    for(const id of renamedIds)assert.ok((await database.query('SELECT slug FROM atlas_peptides WHERE id=$1',[id])).rows[0].slug.startsWith('renamed-profile-'));
    const releaseRename=structuredClone(catalog);releaseRename.release=catalog.release+'.renamed';
    releaseRename.profiles[4].slug='updated-canonical-url';
    await installCatalog(database,releaseRename);
    const renamedRelease=(await database.query("SELECT slug,draft FROM atlas_peptides WHERE slug='updated-canonical-url'")).rows[0];
    assert.ok(renamedRelease);assert.equal(renamedRelease.slug,renamedRelease.draft.slug);
    const exported=await exportBundle(database);assert.ok(exported.records.every(record=>record.slug===record.draft.slug));
  }finally{await database.close();}
});

test('full catalogue export imports with stable identities, section citations and relationships intact',async()=>{
  const bundle=await exportBundle(app.atlasDb);const database=await openDatabase({dataDir:':memory:'});
  try{
    assert.equal(bundle.records.length,147);
    const result=await importBundle(database,bundle);assert.equal(result.inserted,147);
    const again=await installCatalog(database);assert.equal(again.inserted,0);assert.equal(again.upgraded,0);
    const restored=await exportBundle(database);
    assert.deepEqual(restored.records,bundle.records);
    assert.equal(restored.records.flatMap(record=>record.draft.referenceNames??[]).length,152);
    assert.ok(restored.records.every(record=>record.draft.sections?.length&&record.draft.relatedSlugs?.length));
  }finally{await database.close();}
});

test('article validation rejects broken citation links and colliding navigation identifiers',async()=>{
  const profile=structuredClone((await readCatalog()).profiles[0]);
  profile.sections![0].citations=[profile.references.length+1];assert.equal(contentSchema.safeParse(profile).success,false);
  profile.sections![0].citations=[1];profile.sections![0].id='sources-panel';assert.equal(contentSchema.safeParse(profile).success,false);
});

test('FDA display classification distinguishes foreign approvals, withdrawn approvals, inactive studies and product availability',async()=>{
  const catalog=await readCatalog();const bySlug=new Map(catalog.profiles.map(profile=>[profile.slug,profile]));
  assert.ok(catalog.profiles.every(profile=>profile.displayStatus&&profile.displayStatusNote));
  // A country-neutral approved_medicine value is not sufficient for FDA green.
  for(const slug of ['efpeglenatide','mazdutide']){
    assert.equal(bySlug.get(slug)?.regulatoryStatus,'approved_medicine');
    assert.equal(bySlug.get(slug)?.displayStatus,'not_fda_approved');
  }
  for(const slug of ['nesiritide','sermorelin','compounded-gonadorelin'])assert.equal(bySlug.get(slug)?.displayStatus,'not_fda_approved');
  // Completed/terminated studies, planned recruitment, and an active platform
  // with a closed peptide-specific arm must not imply a current peptide trial.
  for(const slug of ['aviptadil','balixafortide','brilacidin','davunetide','larazotide-acetate','murepavadin','nangibotide','pn-943']){
    assert.equal(bySlug.get(slug)?.regulatoryStatus,'clinical_trials');
    assert.equal(bySlug.get(slug)?.displayStatus,'not_fda_approved');
  }
  for(const slug of ['albiglutide','desirudin','enfuvirtide','parathyroid-hormone']){
    assert.equal(bySlug.get(slug)?.displayStatus,'fda_approved');
    assert.match(bySlug.get(slug)!.displayStatusNote!,/discontinued|ended/i);
  }
  const trials=(await app.inject('/api/v1/catalog?displayStatus=clinical_trial')).json();
  assert.equal(trials.total,13);assert.ok(trials.items.every((profile:any)=>profile.displayStatus==='clinical_trial'));
  assert.ok(trials.items.some((profile:any)=>profile.slug==='retatrutide'));
  assert.ok(!trials.items.some((profile:any)=>profile.slug==='davunetide'));
  const approved=(await app.inject('/api/v1/catalog?displayStatus=fda_approved')).json();
  assert.equal(approved.total,75);assert.ok(!approved.items.some((profile:any)=>profile.slug==='mazdutide'));
  assert.equal((await app.inject('/api/v1/catalog?displayStatus=guess')).statusCode,400);
});

test('legacy imports have no inferred FDA display badge and explicit classifications survive content validation',async()=>{
  const profile=structuredClone((await readCatalog()).profiles.find(profile=>profile.slug==='efpeglenatide')!);
  assert.equal(contentSchema.parse(profile).displayStatus,'not_fda_approved');
  delete profile.displayStatus;delete profile.displayStatusNote;
  const legacy=contentSchema.parse(profile);
  assert.equal(legacy.regulatoryStatus,'approved_medicine');assert.equal(legacy.displayStatus,undefined);
  assert.equal(contentSchema.safeParse({...profile,displayStatus:'approved_medicine'}).success,false);
});
