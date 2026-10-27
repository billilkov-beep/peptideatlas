import '../server/env.js';
import {writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {openDatabase} from '../server/db.js';
import {exportBundle} from '../server/portable.js';

const destination=process.argv[2];
if(!destination)throw new Error('Usage: npm run export -- /absolute/path/atlas-export.json');
const db=await openDatabase({dataDir:process.env.DATA_DIR??'./data/atlas',databaseUrl:process.env.DATABASE_URL});
try{const bundle=await exportBundle(db);await writeFile(resolve(destination),JSON.stringify(bundle,null,2),{mode:0o600,flag:'wx'});console.log(`Exported ${bundle.records.length} entries and ${bundle.nodes.length} website configurations. Credentials are excluded.`);}finally{await db.close();}
