import fs from 'node:fs';
import path from 'node:path';
import {spawnSync} from 'node:child_process';
import {certifications} from '../assets/certifications-data.js';
import {certificateFile,verificationUrl} from '../assets/certificate-utils.js';
import {imageType} from '../admin/github.js';
const root=path.resolve(import.meta.dirname,'..'); let added=0;
for(const cert of certifications){
 if(cert.credentialUrl&&!verificationUrl(cert.credentialUrl))throw Error('Invalid verification URL: '+cert.name);
 if(!cert.file)continue;
 const file=certificateFile(cert.file);if(!file)throw Error('Invalid certificate path: '+cert.file);
 const bytes=fs.readFileSync(path.join(root,file.path));
 const expected={pdf:'application/pdf',jpg:'image/jpeg',jpeg:'image/jpeg',png:'image/png',webp:'image/webp'}[file.path.split('.').pop().toLowerCase()];
 if(imageType(bytes)!==expected)throw Error('Certificate type mismatch: '+file.path);added++;
}
for(const dir of ['assets','admin'])for(const file of fs.readdirSync(path.join(root,dir))){
 if(!file.endsWith('.js'))continue;const full=path.join(root,dir,file);
 const result=spawnSync(process.execPath,['--check',full],{encoding:'utf8'});if(result.status!==0)throw Error(result.stderr);
 for(const m of fs.readFileSync(full,'utf8').matchAll(/from\s*['"](\.[^'"]+)['"]/g))if(!fs.existsSync(path.resolve(path.dirname(full),m[1])))throw Error('Broken import: '+m[1]);
}
for(const page of ['index.html','admin/upload.html']){
 const full=path.join(root,page);
 for(const m of fs.readFileSync(full,'utf8').matchAll(/(?:src|href)="(\.[^"]+\.(?:js|css|svg))"/g))if(!fs.existsSync(path.resolve(path.dirname(full),m[1])))throw Error('Missing asset: '+m[1]);
}
console.log(`Static production files validated. ${added} actual certificate files; ${certifications.length-added} entries await original files. No bundling needed.`);
