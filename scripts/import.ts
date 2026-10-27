import '../server/env.js';
import {readFile} from 'node:fs/promises';
import {openDatabase} from '../server/db.js';
import {importBundle} from '../server/portable.js';

const source=process.argv[2];
if(!source)throw new Error('Usage: npm run import -- /absolute/path/atlas-export.json');
const bundle=JSON.parse(await readFile(source,'utf8'));
const db=await openDatabase({dataDir:process.env.DATA_DIR??'./data/atlas',databaseUrl:process.env.DATABASE_URL});
try{const result=await importBundle(db,bundle,'CLI import');console.log(JSON.stringify(result,null,2));console.log('Imported website connections are disabled and have no credentials. Rotate each key and enable the connection when ready.');}finally{await db.close();}
