import { z } from 'zod';

export const categories=[
  {id:'brain',label:'Brain & sleep'}, {id:'skin',label:'Skin & aging'},
  {id:'digestive',label:'Digestive & metabolism'}, {id:'immune',label:'Immune system'},
  {id:'hormones',label:'Hormones'}, {id:'musculoskeletal',label:'Bones & muscles'},
  {id:'cardiovascular',label:'Heart & circulation'}, {id:'reproductive',label:'Reproductive system'}
];
export const categorySchema=z.enum(['brain','skin','digestive','immune','hormones','musculoskeletal','cardiovascular','reproductive']);
export const displayStatusSchema=z.enum(['fda_approved','clinical_trial','not_fda_approved','cosmetic']);
const sourceUrl=z.string().url().max(2048).refine(v=>/^https?:\/\//i.test(v),'Use an http or https reference URL.').refine(v=>{try {const u=new URL(v);return !u.username&&!u.password;}catch{return false;}},'URL credentials are not allowed.');
export const contentSchema=z.object({
  slug:z.string().trim().min(1).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/,'Use lowercase words separated by hyphens.'),
  name:z.string().trim().min(1).max(160),
  aliases:z.array(z.string().trim().min(1).max(160)).max(30).default([]),
  categories:z.array(categorySchema).min(1).max(8).transform(v=>[...new Set(v)]),
  summary:z.string().trim().min(1).max(1000),
  description:z.string().trim().max(60000).default(''),
  mechanism:z.string().trim().max(12000).default(''),
  molecularClass:z.string().trim().max(300).optional(),
  keyTakeaway:z.string().trim().max(1800).optional(),
  atAGlance:z.array(z.object({label:z.string().trim().min(1).max(100),value:z.string().trim().min(1).max(1600)})).max(20).optional(),
  sections:z.array(z.object({id:z.string().regex(/^[a-z0-9][a-z0-9-]*$/).max(100),title:z.string().trim().min(1).max(180),body:z.string().trim().min(1).max(20000),citations:z.array(z.number().int().positive()).max(100).default([])})).max(30).optional(),
  referenceNames:z.array(z.string().trim().min(1).max(180)).max(20).optional(),
  relatedSlugs:z.array(z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)).max(12).optional(),
  catalogRelease:z.string().max(80).optional(),
  evidenceLevel:z.enum(['established','clinical','preclinical','limited']).default('limited'),
  regulatoryStatus:z.enum(['approved_medicine','clinical_trials','research_only','cosmetic','unspecified']).default('unspecified'),
  // Explicit editorial classification. Do not derive FDA approval from a
  // country-neutral regulatoryStatus or infer current trials from old studies.
  displayStatus:displayStatusSchema.optional(),
  displayStatusNote:z.string().trim().max(600).optional(),
  jurisdiction:z.string().trim().max(400).default(''),
  references:z.array(z.object({title:z.string().trim().min(1).max(300),url:sourceUrl,kind:z.enum(['regulatory','trial','primary_research','manufacturer','ingredient_registry']).optional(),accessedAt:z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional()})).max(100).default([]),
  reviewer:z.string().trim().max(160).default(''),
  reviewedAt:z.string().regex(/^\d{4}-\d{2}-\d{2}$/).refine(s=>{try{return new Date(s).toISOString().slice(0,10)===s;}catch{return false;}},'Invalid review date').nullable().default(null),
  reviewStatus:z.enum(['unreviewed','source_checked','reviewed']).default('unreviewed')
}).superRefine((v,ctx)=>{
  if(v.reviewStatus!=='unreviewed'&&!(v.reviewer&&v.reviewedAt&&v.references.length))ctx.addIssue({code:'custom',message:'Source-checked or reviewed entries need an attribution, date, and reference.',path:['reviewStatus']});
  const ids=new Set<string>();
  for(const [index,section] of (v.sections??[]).entries()){
    if(['overview','mechanism','sources','at-a-glance','takeaway','guide-panel','sources-panel','guide-tab','sources-tab'].includes(section.id)||section.id.startsWith('ref-'))ctx.addIssue({code:'custom',message:'This identifier is reserved for article navigation.',path:['sections',index,'id']});
    if(ids.has(section.id))ctx.addIssue({code:'custom',message:'Section identifiers must be unique.',path:['sections',index,'id']});ids.add(section.id);
    if(section.citations.some(n=>n>v.references.length))ctx.addIssue({code:'custom',message:'A section refers to a missing source.',path:['sections',index,'citations']});
  }
});

export type Content=z.infer<typeof contentSchema>;
export type Peptide=Content&{id:string;publicationState:'draft'|'published'|'withdrawn';revision:number;updatedAt:string};
export type User={id:string;email:string;name:string;role:'admin'|'editor'};

export const nodeSchema=z.object({
  name:z.string().trim().min(1).max(120),
  domain:z.string().trim().min(1).max(253).refine(v=>{try{const u=new URL(v.includes('://')?v:`https://${v}`);return ['http:','https:'].includes(u.protocol)&&Boolean(u.hostname)&&!u.username&&!u.password&&u.pathname==='/'&&!u.search&&!u.hash;}catch{return false;}},'Use a domain or base origin without a path.').transform(v=>new URL(v.includes('://')?v:`https://${v}`).origin),
  type:z.enum(['wordpress','javascript','api']).default('wordpress'),
  categories:z.array(categorySchema).max(8).transform(v=>[...new Set(v)]).default([]),
  theme:z.object({accent:z.string().regex(/^#[0-9a-fA-F]{6}$/).default('#267b71'),background:z.string().regex(/^#[0-9a-fA-F]{6}$/).default('#f5f7f5'),font:z.string().max(80).regex(/^[a-zA-Z0-9 ,\-]+$/).default('Inter, sans-serif')}).default({accent:'#267b71',background:'#f5f7f5',font:'Inter, sans-serif'})
});

export function iso(value:any):string{return value instanceof Date?value.toISOString():String(value);}
export function toPeptide(row:any):Peptide{return {...row.draft,id:row.id,revision:row.revision,publicationState:row.state,updatedAt:iso(row.updated_at)};}
export function toNode(row:any){return {id:row.id,name:row.name,domain:row.domain,type:row.type,enabled:row.enabled,categories:row.categories,theme:row.theme,createdAt:iso(row.created_at),lastSyncAt:row.last_sync_at?iso(row.last_sync_at):null,lastVersion:row.last_version??null};}
