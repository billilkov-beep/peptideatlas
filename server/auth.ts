import { randomBytes,randomUUID,scrypt as scryptCallback,timingSafeEqual,createHash } from 'node:crypto';
import { promisify } from 'node:util';
import type { Database } from './db.js';
import type { User } from './types.js';

const scrypt=promisify(scryptCallback);
export const digest=(value:string)=>createHash('sha256').update(value).digest('hex');
export const randomToken=()=>randomBytes(32).toString('base64url');

export async function hashPassword(password:string){
  const salt=randomBytes(24).toString('hex');
  const key=await scrypt(password,salt,64) as Buffer;
  return `scrypt:${salt}:${key.toString('hex')}`;
}
export async function verifyPassword(password:string,stored:string){
  const [scheme,salt,hash]=stored.split(':');
  if(scheme!=='scrypt'||!salt||!hash)return false;
  const key=await scrypt(password,salt,64) as Buffer;
  const expected=Buffer.from(hash,'hex');
  return expected.length===key.length&&timingSafeEqual(expected,key);
}
export async function createUser(db:Database,input:{email:string;password:string;name?:string;role?:'admin'|'editor'}):Promise<User>{
  if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.email)||input.email.length>254)throw new Error('A valid email is required.');
  if(input.password.length<12||input.password.length>256)throw new Error('Password must have 12–256 characters.');
  const user:User={id:randomUUID(),email:input.email.trim().toLowerCase(),name:(input.name??'Administrator').slice(0,120),role:input.role??'admin'};
  const passwordHash=await hashPassword(input.password);
  await db.query('INSERT INTO atlas_users(id,email,name,role,password_hash) VALUES($1,$2,$3,$4,$5)',[user.id,user.email,user.name,user.role,passwordHash]);
  return user;
}
