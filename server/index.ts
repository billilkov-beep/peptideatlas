import './env.js';
import {buildApp} from './app.js';

function argument(name:string){const index=process.argv.indexOf(name);return index>=0?process.argv[index+1]:undefined;}
const port=Number(argument('--port')??process.env.PORT??3000);
if(!Number.isInteger(port)||port<1||port>65535)throw new Error('PORT must be 1–65535.');
if(process.env.NODE_ENV==='production'&&!process.env.PUBLIC_URL)throw new Error('PUBLIC_URL must be configured in production.');
const app=await buildApp({dataDir:process.env.DATA_DIR??'./data/atlas',databaseUrl:process.env.DATABASE_URL,loadCatalog:process.env.LOAD_CATALOG!=='false',publicUrl:process.env.PUBLIC_URL??`http://localhost:${port}`,logger:true});
await app.listen({port,host:argument('--host')??process.env.HOST??'0.0.0.0'});
for(const signal of ['SIGTERM','SIGINT'] as const)process.on(signal,async()=>{await app.close();process.exit(0);});
