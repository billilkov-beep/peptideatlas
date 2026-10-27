import { PGlite } from '@electric-sql/pglite';
import pg from 'pg';
import { mkdir } from 'node:fs/promises';
import { dirname } from 'node:path';

export interface Database {
  kind: 'postgresql' | 'pglite';
  query<T extends Record<string, any> = Record<string, any>>(sql: string, params?: unknown[]): Promise<{rows:T[]}>;
  transaction<T>(fn:(db:Database)=>Promise<T>):Promise<T>;
  close():Promise<void>;
}

export async function openDatabase(options:{dataDir?:string;databaseUrl?:string}={}):Promise<Database> {
  let db:Database;
  if (options.databaseUrl) {
    const pool = new pg.Pool({connectionString:options.databaseUrl,max:10,connectionTimeoutMillis:10000});
    db = {
      kind:'postgresql',
      query:async (sql, params=[]) => pool.query(sql,params),
      transaction:async fn=>{
        const client=await pool.connect();
        const tx:Database={kind:'postgresql',query:async(sql,params=[])=>client.query(sql,params),transaction:async nested=>nested(tx),close:async()=>{}};
        try {await client.query('BEGIN');const result=await fn(tx);await client.query('COMMIT');return result;}
        catch(error){await client.query('ROLLBACK');throw error;}finally{client.release();}
      },
      close:async()=>pool.end()
    };
  } else {
    const path=options.dataDir??'./data/atlas';
    if(path!==':memory:')await mkdir(dirname(path),{recursive:true});
    const engine=new PGlite(path===':memory:'?undefined:path);
    await engine.waitReady;
    db={
      kind:'pglite',
      query:async(sql,params=[])=>engine.query(sql,params),
      transaction:async fn=>engine.transaction(async client=>{
        const tx:Database={kind:'pglite',query:async(sql,params=[])=>client.query(sql,params),transaction:async nested=>nested(tx),close:async()=>{}};
        return fn(tx);
      }),
      close:async()=>engine.close()
    };
  }
  await migrate(db);
  return db;
}

async function migrate(db:Database){
  const statements=[
    `CREATE TABLE IF NOT EXISTS atlas_migrations(version integer PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())`,
    `CREATE TABLE IF NOT EXISTS atlas_users(id uuid PRIMARY KEY,email text NOT NULL UNIQUE,name text NOT NULL,role text NOT NULL CHECK(role IN ('admin','editor')),password_hash text NOT NULL,created_at timestamptz NOT NULL DEFAULT now())`,
    `CREATE TABLE IF NOT EXISTS atlas_sessions(token_hash text PRIMARY KEY,user_id uuid NOT NULL REFERENCES atlas_users(id) ON DELETE CASCADE,csrf_token text NOT NULL,expires_at timestamptz NOT NULL,created_at timestamptz NOT NULL DEFAULT now())`,
    `CREATE INDEX IF NOT EXISTS atlas_session_expiry ON atlas_sessions(expires_at)`,
    `CREATE TABLE IF NOT EXISTS atlas_peptides(id uuid PRIMARY KEY,slug text NOT NULL UNIQUE,draft jsonb NOT NULL,published jsonb,revision integer NOT NULL DEFAULT 1,state text NOT NULL DEFAULT 'draft' CHECK(state IN ('draft','published','withdrawn')),updated_at timestamptz NOT NULL DEFAULT now())`,
    `CREATE UNIQUE INDEX IF NOT EXISTS atlas_published_slug ON atlas_peptides((published->>'slug')) WHERE published IS NOT NULL`,
    `CREATE TABLE IF NOT EXISTS atlas_revisions(id uuid PRIMARY KEY,peptide_id uuid NOT NULL REFERENCES atlas_peptides(id) ON DELETE CASCADE,revision integer NOT NULL,action text NOT NULL,content jsonb NOT NULL,created_at timestamptz NOT NULL DEFAULT now(),UNIQUE(peptide_id,revision))`,
    `CREATE TABLE IF NOT EXISTS atlas_nodes(id uuid PRIMARY KEY,name text NOT NULL,domain text NOT NULL,type text NOT NULL CHECK(type IN ('wordpress','javascript','api')),enabled boolean NOT NULL DEFAULT true,categories jsonb NOT NULL DEFAULT '[]',theme jsonb NOT NULL DEFAULT '{}',key_hash text UNIQUE,created_at timestamptz NOT NULL DEFAULT now(),last_sync_at timestamptz,last_version text)`,
    `CREATE TABLE IF NOT EXISTS atlas_audit(id uuid PRIMARY KEY,action text NOT NULL,label text NOT NULL,actor text NOT NULL,created_at timestamptz NOT NULL DEFAULT now())`,
    `CREATE TABLE IF NOT EXISTS atlas_meta(key text PRIMARY KEY,value jsonb NOT NULL)`,
    `INSERT INTO atlas_migrations(version) VALUES (1) ON CONFLICT DO NOTHING`
  ];
  await db.transaction(async tx=>{for(const sql of statements)await tx.query(sql);});
}
