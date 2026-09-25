import test from 'node:test';
import assert from 'node:assert/strict';
import {parseData, serializeData, prepareData, imageType, publishCertificate, toBase64} from '../admin/github.js';
const original = [{id:'cloud',name:'Cloud – 云',issuer:'AWS',date:'',file:'./assets/certificates/old.pdf',description:'Keep me'}];
const image = new Uint8Array([255,216,255,0]);
test('JSON data round trips Unicode without executing JavaScript', () => {
  assert.deepEqual(parseData(serializeData(original)),original);
  assert.throws(() => parseData('export const certifications = alert(1);'));
  assert.throws(() => parseData(serializeData([...original,...original])));
});
test('replacement preserves ID, order and description; additions reject duplicate names', () => {
  const updated = prepareData(original,{id:'cloud',name:'New name',issuer:'AWS',date:'2026-09-25'},'assets/certificates/new.webp','new');
  assert.equal(updated.length,1); assert.equal(updated[0].id,'cloud'); assert.equal(updated[0].description,'Keep me');
  assert.equal(original[0].name,'Cloud – 云');
  assert.throws(() => prepareData(original,{id:'missing',name:'N',issuer:'AWS',date:''},'x','y'));
  assert.throws(() => prepareData(original,{id:'',name:'Cloud – 云',issuer:'AWS',date:''},'x','y'));
});
test('file signatures reject SVG and disguised executable files', () => {
  assert.equal(imageType(image),'image/jpeg');
  assert.equal(imageType(new TextEncoder().encode('<svg></svg>')),'');
  assert.equal(imageType(new Uint8Array([77,90,0,0])),'');
});
function mock(conflict = false) {
  const calls = [];
  const responses = [{object:{sha:'head'}},{tree:{sha:'base-tree'}},{content:toBase64(new TextEncoder().encode(serializeData(original)))},{sha:'image-blob'},{sha:'new-tree'},{sha:'new-commit'},{}];
  return {calls, request:async (url,options) => {
    calls.push({url,...options,body:options.body&&JSON.parse(options.body)});
    const n = calls.length;
    return {ok:!(conflict&&n===7),status:conflict&&n===7?409:200,json:async()=>responses[n-1]};
  }};
}
const payload = {token:'test-only-not-a-real-token',metadata:{id:'cloud',name:'Cloud',issuer:'AWS',date:''},image,mime:'image/jpeg'};
test('publishes image and metadata in one tree and non-forced branch update', async () => {
  const m = mock(); const result = await publishCertificate(payload,m.request);
  assert.equal(result.sha,'new-commit'); assert.equal(m.calls.length,7);
  assert.ok(m.calls[2].url.endsWith('?ref=head'));
  assert.equal(m.calls[4].body.base_tree,'base-tree'); assert.equal(m.calls[4].body.tree.length,2);
  assert.equal(parseData(m.calls[4].body.tree[1].content)[0].file,'./'+result.path);
  assert.deepEqual(m.calls[5].body.parents,['head']); assert.deepEqual(m.calls[6].body,{sha:'new-commit',force:false});
});
test('concurrent branch change stops with useful message and no forced retry', async () => {
  const m = mock(true); await assert.rejects(publishCertificate(payload,m.request),/branch changed/); assert.equal(m.calls.length,7);
});
test('expired token stops before attempting any writes', async () => {
  let count=0; await assert.rejects(publishCertificate(payload,async()=>{count++;return {ok:false,status:401};}),/expired/); assert.equal(count,1);
});
import {certificateFile,verificationUrl} from '../assets/certificate-utils.js';
test('supports original PDFs/images and rejects unsafe file or credential URLs',()=>{
 assert.equal(certificateFile('./assets/certificates/cert.pdf').pdf,true);
 assert.equal(certificateFile('./assets/certificates/cert.jpg').pdf,false);
 assert.equal(certificateFile(''),null);
 assert.equal(certificateFile('./assets/certificates/../private.pdf'),null);
 assert.equal(certificateFile('./assets/certificates/fake.svg'),null);
 assert.equal(verificationUrl('javascript:alert(1)'),'');
 assert.equal(verificationUrl(''),'');
});
test('PDF upload preserves original bytes and allows unknown metadata to remain empty',async()=>{
 const pdf=new TextEncoder().encode('%PDF-1.7\nunit-test bytes only');
 const m=mock(); const result=await publishCertificate({...payload,image:pdf,mime:'application/pdf',metadata:{id:'cloud',name:'Cloud',issuer:'',date:'',credentialId:'',credentialUrl:'',category:''}},m.request);
 assert.ok(result.path.endsWith('.pdf'));
 assert.equal(m.calls[3].body.content,toBase64(pdf));
 const entry=parseData(m.calls[4].body.tree[1].content)[0];assert.equal(entry.issuer,'');assert.equal(entry.credentialId,'');assert.equal(entry.file,'./'+result.path);
});
