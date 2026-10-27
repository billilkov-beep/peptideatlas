import {readFile} from 'node:fs/promises';
import {createHash,randomUUID} from 'node:crypto';
import type {Database} from './db.js';
import {contentSchema,type Content,type Peptide} from './types.js';

export type InventoryEntry={referenceName:string;referenceSlug:string;category:string;observedStatus:string;referenceUrl:string};
export type CatalogData={release:string;sourceCheckedAt:string;releasedAt:string;referenceEntryCount:number;profiles:Content[]};
let cached:CatalogData|undefined;
export async function readCatalog():Promise<CatalogData>{
  if(cached)return cached;
  const raw=JSON.parse(await readFile(new URL('../content/catalog.json',import.meta.url),'utf8'));
  const profiles=raw.profiles.map((p:unknown)=>contentSchema.parse(p));
  const slugs=new Set<string>();
  for(const profile of profiles){if(slugs.has(profile.slug))throw new Error('Duplicate catalogue slug: '+profile.slug);slugs.add(profile.slug);}
  cached={release:raw.release,sourceCheckedAt:raw.sourceCheckedAt,releasedAt:raw.releasedAt,referenceEntryCount:raw.referenceEntryCount,profiles};return cached!;
}
export async function readInventory():Promise<InventoryEntry[]>{return JSON.parse(await readFile(new URL('../content/reference-inventory.json',import.meta.url),'utf8')).entries;}
function stableId(slug:string){const hex=createHash('sha256').update('peptide-atlas:canonical:'+slug).digest('hex');return `${hex.slice(0,8)}-${hex.slice(8,12)}-5${hex.slice(13,16)}-a${hex.slice(17,20)}-${hex.slice(20,32)}`;}

/** A release can add records or replace untouched machine imports, never overwrite editorial work. */
export async function installCatalog(db:Database,release?:CatalogData){
  const catalog=release??await readCatalog();
  return db.transaction(async tx=>{
    const current=await tx.query("SELECT value FROM atlas_meta WHERE key='catalogRelease'");
    if(current.rows[0]?.value===catalog.release)return {inserted:0,upgraded:0,preserved:0,release:catalog.release,alreadyInstalled:true};
    let inserted=0,upgraded=0,preserved=0,unchanged=0;
    for(const raw of catalog.profiles){
      // An editor may rename a slug. Retain canonical and legacy import identity
      // instead of inserting a duplicate or colliding with its existing UUID.
      const match=await tx.query(`SELECT * FROM atlas_peptides p WHERE slug=$1 OR id=$2
        OR (draft->'referenceNames') ?| $3::text[]
        OR EXISTS(SELECT 1 FROM atlas_revisions r WHERE r.peptide_id=p.id
          AND r.action IN ('starter_import','catalog_import','catalog_upgrade') AND r.content->>'slug'=$1)
        FOR UPDATE`,[raw.slug,stableId(raw.slug),raw.referenceNames??[]]);
      if(match.rows.length>1){preserved++;continue;}
      const existing=match.rows[0];
      if(existing?.draft.catalogRelease===catalog.release){unchanged++;continue;}
      if(existing){
        const history=await tx.query('SELECT action FROM atlas_revisions WHERE peptide_id=$1',[existing.id]);
        const untouched=history.rows.length>0&&history.rows.every(row=>['starter_import','catalog_import','catalog_upgrade'].includes(row.action));
        if(!untouched||existing.state!=='published'){preserved++;continue;}
      }
      const id=existing?.id??stableId(raw.slug);const revision=(existing?.revision??0)+1;const now=catalog.releasedAt;
      const content:Peptide={...raw,id,publicationState:'published',revision,updatedAt:now,catalogRelease:catalog.release};
      if(existing){await tx.query("UPDATE atlas_peptides SET draft=$2,published=$2,revision=$3,state='published',updated_at=$4,slug=$5 WHERE id=$1",[id,JSON.stringify(content),revision,now,raw.slug]);upgraded++;}
      else {await tx.query("INSERT INTO atlas_peptides(id,slug,draft,published,revision,state,updated_at) VALUES($1,$2,$3,$3,$4,'published',$5)",[id,raw.slug,JSON.stringify(content),revision,now]);inserted++;}
      await tx.query('INSERT INTO atlas_revisions(id,peptide_id,revision,action,content,created_at) VALUES($1,$2,$3,$4,$5,$6)',[stableId('revision:'+id+':'+catalog.release),id,revision,existing?'catalog_upgrade':'catalog_import',JSON.stringify(content),now]);
    }
    await tx.query("INSERT INTO atlas_meta(key,value) VALUES('catalogRelease',$1::jsonb) ON CONFLICT(key) DO UPDATE SET value=excluded.value",[JSON.stringify(catalog.release)]);
    await tx.query("INSERT INTO atlas_meta(key,value) VALUES('starterContent','false') ON CONFLICT(key) DO UPDATE SET value=excluded.value");
    await tx.query("INSERT INTO atlas_audit(id,action,label,actor) VALUES($1,'catalog_install',$2,'Peptide Atlas catalogue')",[randomUUID(),`Installed ${catalog.release}: ${inserted} new, ${upgraded} upgraded, ${preserved} editorial records preserved`]);
    return {inserted,upgraded,preserved,unchanged,release:catalog.release,alreadyInstalled:false};
  });
}
export function coverageFor(items:Peptide[],inventory:InventoryEntry[]){
  return inventory.map(entry=>{
    const profile=items.find(p=>p.referenceNames?.includes(entry.referenceName));
    return {...entry,covered:!!profile,canonicalSlug:profile?.slug??null,canonicalName:profile?.name??null,recordId:profile?.id??null,currentStatus:profile?.regulatoryStatus??null,reviewStatus:profile?.reviewStatus??null};
  });
}
