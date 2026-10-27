export const categories = [
  {id:'brain',label:'Brain & sleep',short:'Brain',icon:'brain',color:'#7c79b8'},
  {id:'skin',label:'Skin & aging',short:'Skin',icon:'skin',color:'#c17b74'},
  {id:'digestive',label:'Digestive & metabolism',short:'Digestive',icon:'digestive',color:'#b98b4c'},
  {id:'immune',label:'Immune system',short:'Immune',icon:'shield',color:'#679a7b'},
  {id:'hormones',label:'Hormones',short:'Hormones',icon:'spark',color:'#b48bba'},
  {id:'musculoskeletal',label:'Bones & muscles',short:'Muscles',icon:'bone',color:'#748fad'},
  {id:'cardiovascular',label:'Heart & circulation',short:'Heart',icon:'heart',color:'#c78079'},
  {id:'reproductive',label:'Reproductive system',short:'Reproductive',icon:'circles',color:'#a18d71'}
] as const;
export type DisplayStatus='fda_approved'|'clinical_trial'|'not_fda_approved'|'cosmetic';
export const displayStatusLabels:Record<DisplayStatus|'unreviewed',string>={fda_approved:'FDA approved',clinical_trial:'In clinical trials',not_fda_approved:'Not FDA approved',cosmetic:'Cosmetic / topical',unreviewed:'Status needs review'};
export function publicStatus(profile:{displayStatus?:string}):DisplayStatus|'unreviewed'{return profile.displayStatus&&profile.displayStatus!=='unreviewed'&&Object.hasOwn(displayStatusLabels,profile.displayStatus)?profile.displayStatus as DisplayStatus:'unreviewed';}
export type ArticleSection={id:string;title:string;body:string;citations:number[]};
export type Peptide={displayStatus?:DisplayStatus;displayStatusNote?:string;molecularClass?:string;keyTakeaway?:string;atAGlance?:{label:string;value:string}[];sections?:ArticleSection[];referenceNames?:string[];relatedSlugs?:string[];catalogRelease?:string;id:string;slug:string;name:string;aliases:string[];categories:string[];summary:string;description:string;mechanism:string;evidenceLevel:string;regulatoryStatus:string;jurisdiction:string;references:{title:string;url:string;kind?:string;accessedAt?:string}[];reviewer:string;reviewedAt:string|null;reviewStatus:string;publicationState:string;revision:number;updatedAt:string};
export type SiteNode={id:string;name:string;domain:string;type:string;enabled:boolean;categories:string[];theme:{accent:string;background:string;font:string};createdAt:string;lastSyncAt:string|null;lastVersion:string|null};
export type User={id:string;name:string;email:string;role:'admin'|'editor'};
export type Activity={id:string;action:string;label:string;actor?:string;createdAt:string};
export const evidenceLabels:Record<string,string>={established:'Established evidence',clinical:'Clinical research',preclinical:'Preclinical research',limited:'Limited evidence'};
export const statusLabels:Record<string,string>={approved_medicine:'Approved medicine',clinical_trials:'Investigational',research_only:'Research / unapproved',cosmetic:'Cosmetic / topical',unspecified:'Context-dependent status'};
export const dateLabel=(value?:string|null)=>value?new Intl.DateTimeFormat('en-CA',{dateStyle:'medium'}).format(new Date(value)):'—';
export const timeLabel=(value?:string|null)=>value?new Intl.DateTimeFormat('en-CA',{dateStyle:'medium',timeStyle:'short'}).format(new Date(value)):'Not yet';
