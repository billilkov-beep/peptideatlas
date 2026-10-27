import {readFile,readdir,writeFile,mkdir} from 'node:fs/promises';
import {join,relative,dirname} from 'node:path';
import {deflateRawSync} from 'node:zlib';

const table=Array.from({length:256},(_,i)=>{let n=i;for(let j=0;j<8;j++)n=n&1?0xedb88320^(n>>>1):n>>>1;return n>>>0});
const crc32=buffer=>{let n=0xffffffff;for(const b of buffer)n=table[(n^b)&255]^(n>>>8);return (n^0xffffffff)>>>0};
export async function zipDirectory(root,output,prefix){
  const files=[];async function visit(dir){for(const entry of (await readdir(dir,{withFileTypes:true})).sort((a,b)=>a.name.localeCompare(b.name))){const full=join(dir,entry.name);if(entry.isDirectory())await visit(full);else if(entry.isFile())files.push(full)}}await visit(root);
  const chunks=[],central=[];let offset=0;
  for(const file of files){const name=Buffer.from(prefix+'/'+relative(root,file).replaceAll('\\','/'));const content=await readFile(file);const compressed=deflateRawSync(content);const crc=crc32(content);const header=Buffer.alloc(30);header.writeUInt32LE(0x04034b50,0);header.writeUInt16LE(20,4);header.writeUInt16LE(0x800,6);header.writeUInt16LE(8,8);header.writeUInt16LE(33,12);header.writeUInt32LE(crc,14);header.writeUInt32LE(compressed.length,18);header.writeUInt32LE(content.length,22);header.writeUInt16LE(name.length,26);chunks.push(header,name,compressed);const cent=Buffer.alloc(46);cent.writeUInt32LE(0x02014b50,0);cent.writeUInt16LE(20,4);cent.writeUInt16LE(20,6);cent.writeUInt16LE(0x800,8);cent.writeUInt16LE(8,10);cent.writeUInt16LE(33,14);cent.writeUInt32LE(crc,16);cent.writeUInt32LE(compressed.length,20);cent.writeUInt32LE(content.length,24);cent.writeUInt16LE(name.length,28);cent.writeUInt32LE(offset,42);central.push(cent,name);offset+=header.length+name.length+compressed.length;}
  const directory=Buffer.concat(central);const end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50,0);end.writeUInt16LE(files.length,8);end.writeUInt16LE(files.length,10);end.writeUInt32LE(directory.length,12);end.writeUInt32LE(offset,16);await mkdir(dirname(output),{recursive:true});await writeFile(output,Buffer.concat([...chunks,directory,end]));return {files:files.length,output};
}
