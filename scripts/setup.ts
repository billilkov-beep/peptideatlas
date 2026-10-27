import '../server/env.js';
import {createInterface} from 'node:readline/promises';
import {stdin,stdout} from 'node:process';
import {openDatabase} from '../server/db.js';
import {createUser} from '../server/auth.js';

const db=await openDatabase({dataDir:process.env.DATA_DIR??'./data/atlas',databaseUrl:process.env.DATABASE_URL});
try{
  const rl=createInterface({input:stdin,output:stdout});
  const email=process.env.ADMIN_EMAIL??await rl.question('Administrator email: ');
  const name=process.env.ADMIN_NAME??await rl.question('Administrator name: ');
  rl.close();
  const password=process.env.ADMIN_PASSWORD??await passwordPrompt('Password (at least 12 characters): ');
  const user=await createUser(db,{email,name,password,role:'admin'});
  console.log(`Administrator created: ${user.email}. Start the application and sign in at /admin.`);
}finally{await db.close();}

async function passwordPrompt(prompt:string):Promise<string>{
  if(!stdin.isTTY)throw new Error('Set ADMIN_PASSWORD through the environment when setup is non-interactive.');
  stdout.write(prompt);stdin.setRawMode(true);stdin.resume();stdin.setEncoding('utf8');
  return new Promise((resolve,reject)=>{
    let value='';
    const cleanup=()=>{stdin.setRawMode(false);stdin.pause();stdin.off('data',onData);stdout.write('\n');};
    const onData=(input:string|Buffer)=>{
      for(const c of String(input)){
        if(c==='\u0003'){cleanup();reject(new Error('Setup cancelled.'));return;}
        if(c==='\r'||c==='\n'){cleanup();resolve(value);return;}
        if(c==='\u007f'||c==='\b')value=value.slice(0,-1);
        else if(c>=' ')value+=c;
      }
    };
    stdin.on('data',onData);
  });
}
