/** Assemble and validate the maintained release. No network access is required. */
import {readFile,writeFile} from 'node:fs/promises';
import {contentSchema,type Content} from '../server/types.js';

const directory=new URL('../content/',import.meta.url);
const inventory=JSON.parse(await readFile(new URL('reference-inventory.json',directory),'utf8'));
const articleAudit=JSON.parse(await readFile(new URL('reference-article-audit.json',directory),'utf8'));
const relationships=JSON.parse(await readFile(new URL('relationships.json',directory),'utf8')).groups as string[][];
const referenceNames=new Set<string>(inventory.entries.map((entry:{referenceName:string})=>entry.referenceName));
const RELEASE='2026-10-27.2';
const CHECKED='2026-10-27';
const RELEASED='2026-10-27T15:24:13.000Z';

if(process.argv.includes('--assemble')){
  const profiles:Content[]=[];
  for(const file of ['brain-skin-profiles.json','clinical-profiles.json','body-profiles.json']){
    profiles.push(...JSON.parse(await readFile(new URL(file,directory),'utf8')));
  }
  for(const profile of profiles){
    if(profile.referenceNames?.includes('TB-500'))profile.slug='tb-500-fragment';
    profile.catalogRelease=RELEASE;
    // Canonical names and category order are kept; every audited name remains searchable.
    profile.aliases=[...new Set([...profile.aliases,...(profile.referenceNames??[]).filter(name=>name!==profile.name)])];
  }
  profiles.sort((a,b)=>a.name.localeCompare(b.name,'en',{numeric:true}));
  for(const profile of profiles){
    const relatedNames=new Set(relationships.filter(group=>group.some(name=>profile.referenceNames?.includes(name))).flat());
    const specific=profiles.filter(other=>other.slug!==profile.slug&&other.referenceNames?.some(name=>relatedNames.has(name)));
    const sameSystem=profiles.filter(other=>other.slug!==profile.slug&&other.categories.some(category=>profile.categories.includes(category)))
      .sort((a,b)=>Number(b.molecularClass===profile.molecularClass)-Number(a.molecularClass===profile.molecularClass)||a.name.localeCompare(b.name))
      .map(other=>other.slug);
    profile.relatedSlugs=[...new Set([...specific.map(other=>other.slug),...sameSystem])].slice(0,6);
  }
  const catalog={release:RELEASE,sourceCheckedAt:CHECKED,releasedAt:RELEASED,referenceEntryCount:inventory.entryCount,profiles};
  validate(catalog);
  await writeFile(new URL('catalog.json',directory),JSON.stringify(catalog,null,2)+'\n');
  console.log('Assembled complete catalogue.');
}else{
  validate(JSON.parse(await readFile(new URL('catalog.json',directory),'utf8')));
}

function validate(catalog:any){
  const errors:string[]=[];
  const slugs=new Set<string>();const covered=new Map<string,string>();let wordCount=0,sourceCount=0;
  if(catalog.referenceEntryCount!==152||inventory.entryCount!==152||referenceNames.size!==152)errors.push('Reference inventory must account for all 152 entries.');
  if(catalog.profiles.length!==147)errors.push(`Expected 147 canonical profiles; found ${catalog.profiles.length}.`);
  if(!catalog.release||catalog.release.startsWith('qa-'))errors.push('A complete release identifier is required.');
  for(const raw of catalog.profiles){
    const parsed=contentSchema.safeParse(raw);
    if(!parsed.success){errors.push(`${raw.slug}: ${parsed.error.message}`);continue;}
    const profile=parsed.data;
    if(slugs.has(profile.slug))errors.push('Duplicate slug: '+profile.slug);slugs.add(profile.slug);
    if(profile.reviewStatus!=='source_checked'&&profile.reviewStatus!=='reviewed')errors.push(profile.slug+': source review missing.');
    if(!profile.displayStatus||!profile.displayStatusNote)errors.push(profile.slug+': explicit FDA/trial display classification and scope note are required.');
    if(!profile.molecularClass||!profile.keyTakeaway||!profile.description||!profile.mechanism||!profile.atAGlance||profile.atAGlance.length<4||!profile.sections||profile.sections.length<3)errors.push(profile.slug+': incomplete article.');
    const words=[profile.summary,profile.description,profile.mechanism,profile.keyTakeaway,...(profile.sections??[]).map(section=>section.body)].join(' ').trim().split(/\s+/).length;
    if(words<300)errors.push(`${profile.slug}: substantive article required (${words} words).`);
    wordCount+=words;sourceCount+=profile.references.length;
    if(!profile.references.length||profile.references.some(source=>!source.kind||!source.accessedAt))errors.push(profile.slug+': source provenance incomplete.');
    for(const section of profile.sections??[])if(!section.citations.length)errors.push(profile.slug+': uncited section '+section.id);
    if(!profile.referenceNames?.length)errors.push(profile.slug+': missing reference coverage.');
    for(const name of profile.referenceNames??[]){
      if(!referenceNames.has(name))errors.push(profile.slug+': unknown reference name '+name);
      if(covered.has(name))errors.push(name+': covered by more than one canonical profile.');
      covered.set(name,profile.slug);
    }
  }
  for(const name of referenceNames)if(!covered.has(name))errors.push('Missing reference entry: '+name);
  for(const entry of inventory.entries){
    const profile=catalog.profiles.find((candidate:Content)=>candidate.referenceNames?.includes(entry.referenceName));
    if(profile&&!profile.categories.includes(entry.category))errors.push(entry.referenceName+': reference body system is missing.');
  }
  for(const entry of articleAudit.entries){
    if(!entry.observedSectionHeadings.some((heading:string)=>/FAQ|frequently asked/i.test(heading)))continue;
    const profile=catalog.profiles.find((candidate:Content)=>candidate.referenceNames?.includes(entry.referenceName));
    if(profile&&!profile.sections?.some((section:{id:string;title:string})=>/faq|frequently asked/i.test(section.id+' '+section.title)))errors.push(entry.referenceName+': original FAQ coverage is missing.');
  }
  for(const profile of catalog.profiles){
    for(const slug of profile.relatedSlugs??[])if(!slugs.has(slug)||slug===profile.slug)errors.push(profile.slug+': invalid related profile '+slug);
  }
  if(errors.length)throw new Error('Catalogue validation failed:\n'+errors.join('\n'));
  console.log(JSON.stringify({release:catalog.release,canonicalProfiles:catalog.profiles.length,referenceEntries:covered.size,originalArticleWords:wordCount,sourceCitations:sourceCount}));
}
