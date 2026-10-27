import {existsSync} from 'node:fs';
// Node's native .env loader keeps configuration outside source and archives.
if(existsSync('.env'))process.loadEnvFile('.env');
