import { randomUUID } from 'node:crypto';
import { z } from 'zod';
import type { Database } from './db.js';
import { contentSchema, nodeSchema, toNode, iso } from './types.js';

const completeContent=z.object({id:z.string().uuid(),publicationState:z.enum(['draft','published','withdrawn']),revision:z.number().int().positive(),updatedAt:z.string().datetime()}).and(contentSchema);
const portableRecord=z.object({id:z.string().uuid(),slug:z.string(),revision:z.number().int().positive(),state:z.enum(['draft','published','withdrawn']),updatedAt:z.string().datetime(),draft:completeContent,published:completeContent.nullable(),revisions:z.array(z.object({id:z.string().uuid(),revision:z.number().int().positive(),action:z.string().min(1).max(80),content:completeContent,createdAt:z.string().datetime()})).max(10000)});
const portableNode=z.object({id:z.string().uuid(),name:z.string(),domain:z.string(),type:z.enum(['wordpress','javascript','api']),enabled:z.boolean(),categories:z.array(z.string()),theme:z.object({accent:z.string(),background:z.string(),font:z.string()}),createdAt:z.string().datetime(),lastSyncAt:z.string().nullable(),lastVersion:z.string().nullable()});
const bundleSchema=z.object({schemaVersion:z.literal(1),application:z.literal('peptide-atlas'),exportedAt:z.string().datetime(),records:z.array(portableRecord).max(10000),nodes:z.array(portableNode).max(10000),starterContent:z.boolean().default(false)});

export async function exportBundle(db:Database){
  return db.transaction(async tx=>{
    await tx.query('SET TRANSACTION ISOLATION LEVEL REPEATABLE READ, READ ONLY');
    const {rows}=await tx.query('SELECT * FROM atlas_peptides ORDER BY slug');
    const records=[];
    for(const row of rows){
      const revisions=await tx.query('SELECT * FROM atlas_revisions WHERE peptide_id=$1 ORDER BY revision',[row.id]);
      records.push({id:row.id,slug:row.slug,revision:row.revision,state:row.state,updatedAt:iso(row.updated_at),draft:row.draft,published:row.published??null,revisions:revisions.rows.map(r=>({id:r.id,revision:r.revision,action:r.action,content:r.content,createdAt:iso(r.created_at)}))});
    }
    const nodes=await tx.query('SELECT * FROM atlas_nodes ORDER BY name');
    const starter=await tx.query('SELECT value FROM atlas_meta WHERE key=\'starterContent\'');
    return {schemaVersion:1,application:'peptide-atlas',exportedAt:new Date().toISOString(),records,nodes:nodes.rows.map(toNode),starterContent:starter.rows[0]?.value===true};
  });
}

export class ImportConflict extends Error {statusCode=409;}

export async function importBundle(db:Database,input:unknown,actor='Import'){
  const bundle=bundleSchema.parse(input);
  const ids=new Set<string>();const slugs=new Set<string>();
  for(const record of bundle.records){
    if(ids.has(record.id)||slugs.has(record.slug))throw new ImportConflict('The bundle contains duplicate record IDs or slugs.');
    ids.add(record.id);slugs.add(record.slug);
    if(record.draft.id!==record.id||record.draft.slug!==record.slug||record.draft.revision!==record.revision||record.draft.publicationState!==record.state)throw new ImportConflict('Record identity or publication state does not match its draft.');
    if(Boolean(record.published)!==(record.state==='published'))throw new ImportConflict('Published state and snapshot must agree.');
    if(record.published&&(record.published.id!==record.id||record.published.publicationState!=='published'||record.published.revision>record.revision))throw new ImportConflict('Invalid published snapshot identity or revision.');
    const revisionIds=new Set<string>();const revisionNumbers=new Set<number>();
    for(const revision of record.revisions){
      if(revisionIds.has(revision.id)||revisionNumbers.has(revision.revision)||revision.revision>record.revision||revision.content.id!==record.id||revision.content.revision!==revision.revision)throw new ImportConflict('Invalid or duplicated revision history.');
      revisionIds.add(revision.id);revisionNumbers.add(revision.revision);
    }
  }
  const nodeIds=new Set<string>();
  for(const node of bundle.nodes){if(nodeIds.has(node.id))throw new ImportConflict('Duplicate website connection ID.');nodeIds.add(node.id);nodeSchema.parse(node);}
  return db.transaction(async tx=>{
    let inserted=0,unchanged=0,nodesImported=0;
    for(const record of bundle.records){
      const match=await tx.query('SELECT * FROM atlas_peptides WHERE id=$1 OR slug=$2 FOR UPDATE',[record.id,record.slug]);
      if(match.rows.length){
        const previous=match.rows[0];
        // Merge is intentionally non-destructive: differing existing entries need an explicit reconciliation.
        if(match.rows.length!==1||previous.id!==record.id||previous.slug!==record.slug||previous.revision!==record.revision||JSON.stringify(previous.draft)!==JSON.stringify(record.draft)||JSON.stringify(previous.published??null)!==JSON.stringify(record.published)){
          // JSONB object ordering differs from JSON serialization: compare canonical values in Postgres.
          const same=await tx.query('SELECT id FROM atlas_peptides WHERE id=$1 AND slug=$2 AND revision=$3 AND draft=$4::jsonb AND published IS NOT DISTINCT FROM $5::jsonb',[record.id,record.slug,record.revision,JSON.stringify(record.draft),record.published?JSON.stringify(record.published):null]);
          if(match.rows.length!==1||!same.rows.length)throw new ImportConflict(`Existing entry conflicts with imported record: ${record.slug}`);
        }
        const previousRevisions=await tx.query('SELECT id,revision,action,content,created_at FROM atlas_revisions WHERE peptide_id=$1 ORDER BY revision',[record.id]);
        if(previousRevisions.rows.length!==record.revisions.length)throw new ImportConflict(`Existing revision history conflicts with imported record: ${record.slug}`);
        for(const revision of record.revisions){
          const sameRevision=await tx.query('SELECT id FROM atlas_revisions WHERE id=$1 AND peptide_id=$2 AND revision=$3 AND action=$4 AND content=$5::jsonb AND created_at=$6',[revision.id,record.id,revision.revision,revision.action,JSON.stringify(revision.content),revision.createdAt]);
          if(!sameRevision.rows.length)throw new ImportConflict(`Existing revision history conflicts with imported record: ${record.slug}`);
        }
        unchanged++;continue;
      }
      await tx.query('INSERT INTO atlas_peptides(id,slug,revision,state,updated_at,draft,published) VALUES($1,$2,$3,$4,$5,$6,$7)',[record.id,record.slug,record.revision,record.state,record.updatedAt,JSON.stringify(record.draft),record.published?JSON.stringify(record.published):null]);
      for(const revision of record.revisions)await tx.query('INSERT INTO atlas_revisions(id,peptide_id,revision,action,content,created_at) VALUES($1,$2,$3,$4,$5,$6)',[revision.id,record.id,revision.revision,revision.action,JSON.stringify(revision.content),revision.createdAt]);
      inserted++;
    }
    for(const raw of bundle.nodes){
      const node=nodeSchema.parse(raw);
      const exists=await tx.query('SELECT id FROM atlas_nodes WHERE id=$1',[raw.id]);
      if(exists.rows.length){
        const same=await tx.query('SELECT id FROM atlas_nodes WHERE id=$1 AND name=$2 AND domain=$3 AND type=$4 AND categories=$5::jsonb AND theme=$6::jsonb',[raw.id,node.name,node.domain,node.type,JSON.stringify(node.categories),JSON.stringify(node.theme)]);
        if(!same.rows.length)throw new ImportConflict(`Existing website configuration conflicts with imported node: ${node.name}`);
        continue;
      }
      // A transfer never carries credentials. An administrator rotates a key and explicitly re-enables each node.
      await tx.query('INSERT INTO atlas_nodes(id,name,domain,type,enabled,categories,theme,created_at) VALUES($1,$2,$3,$4,false,$5,$6,$7)',[raw.id,node.name,node.domain,node.type,JSON.stringify(node.categories),JSON.stringify(node.theme),raw.createdAt]);
      nodesImported++;
    }
    if(bundle.starterContent)await tx.query('INSERT INTO atlas_meta(key,value) VALUES(\'starterContent\',\'true\') ON CONFLICT(key) DO UPDATE SET value=excluded.value');
    await tx.query('INSERT INTO atlas_audit(id,action,label,actor) VALUES($1,\'import\',$2,$3)',[randomUUID(),`Imported ${inserted} entries and ${nodesImported} website connections`,actor]);
    return {inserted,unchanged,nodesImported,credentialsIncluded:false};
  });
}
