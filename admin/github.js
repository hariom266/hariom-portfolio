export const REPO = 'hariom266/hariom-portfolio';
export const DATA_PATH = 'assets/certifications-data.js';
const PREFIX = '// Certificate data. Keep this module as a JSON array export for the admin uploader.\nexport const certifications = ';
export function serializeData(items) { return PREFIX + JSON.stringify(items, null, 2) + ';\n'; }
export function parseData(source) {
  const match = source.match(/^\/\/[^\n]*\nexport const certifications = (\[[\s\S]*\]);\s*$/);
  if (!match) throw new Error('The certification data format has changed. No changes were published. Update this uploader before retrying.');
  const data = JSON.parse(match[1]);
  if (!Array.isArray(data) || data.some(c => !c || typeof c.id !== 'string' || typeof c.name !== 'string' || typeof c.image !== 'string') || new Set(data.map(c => c.id)).size !== data.length) throw new Error('Invalid or duplicate certification data. No changes were published.');
  return data;
}
export function toBase64(bytes) {
  let text = '';
  for (let i = 0; i < bytes.length; i += 8192) text += String.fromCharCode(...bytes.subarray(i, i + 8192));
  return btoa(text);
}
export function decodeText(base64) { return new TextDecoder('utf-8', {fatal:true}).decode(Uint8Array.from(atob(base64.replace(/\s/g, '')), c => c.charCodeAt(0))); }
export function imageType(bytes) {
  if (bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255) return 'image/jpeg';
  if ([137,80,78,71,13,10,26,10].every((n,i) => bytes[i] === n)) return 'image/png';
  if (String.fromCharCode(...bytes.slice(0,4)) === 'RIFF' && String.fromCharCode(...bytes.slice(8,12)) === 'WEBP') return 'image/webp';
  return '';
}
export function prepareData(items, {id, name, issuer, date}, path, newId) {
  name = name.trim(); issuer = issuer.trim();
  if (!name || name.length > 160 || !issuer || issuer.length > 100 || (date && !/^\d{4}-\d{2}-\d{2}$/.test(date))) throw new Error('Please enter a valid name, issuer and optional date.');
  const index = id ? items.findIndex(c => c.id === id) : -1;
  if (id && index < 0) throw new Error('This certificate was removed on GitHub. Reload the page before retrying.');
  if (!id && items.some(c => c.name.toLowerCase() === name.toLowerCase())) throw new Error('This certification already exists. Select it under Add or replace.');
  const entry = {...(index >= 0 ? items[index] : {id:newId, description:'', credentialUrl:''}), name, issuer, date, image:'./'+path};
  const updated = [...items];
  if (index >= 0) updated[index] = entry; else updated.push(entry);
  return updated;
}
export async function publishCertificate({token, metadata, image, mime}, request = fetch) {
  const api = async (path, method = 'GET', body) => {
    let response;
    try { response = await request(`https://api.github.com/repos/${REPO}/${path}`, {method, headers:{Accept:'application/vnd.github+json', Authorization:`Bearer ${token}`, 'X-GitHub-Api-Version':'2026-03-10', ...(body ? {'Content-Type':'application/json'} : {})}, ...(body ? {body:JSON.stringify(body)} : {})}); }
    catch { throw new Error('Network connection interrupted. Check the repository before retrying; a final publish request may have reached GitHub.'); }
    if (!response.ok) {
      const hints = {401:'Token rejected or expired. Paste a valid fine-grained token.',403:'GitHub denied access. Check token Contents: Read and write permission, approval, expiry or API rate limits.',404:'Repository or data not found. Check token access to hariom-portfolio and that this uploader has been pushed to main.',409:'The main branch changed during upload. Reload and retry; nothing was overwritten.',422:'GitHub rejected the update. The branch may have changed or require a pull request. Reload and check repository rules.'};
      throw new Error(hints[response.status] || `GitHub returned HTTP ${response.status}. Check the repository before retrying.`);
    }
    return response.json();
  };
  const ref = await api('git/ref/heads/main');
  const head = ref.object.sha;
  const commit = await api('git/commits/'+head);
  const file = await api(`contents/${DATA_PATH}?ref=${head}`);
  const data = parseData(decodeText(file.content));
  const suffix = crypto.randomUUID();
  const slug = metadata.name.toLowerCase().normalize('NFKD').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,75) || 'certificate';
  const extension = {'image/webp':'webp','image/png':'png','image/jpeg':'jpg'}[mime];
  if (!extension || image.length > 5*1024*1024 || imageType(image) !== mime) throw new Error('Invalid image type or size. Choose a JPG, PNG or WebP under 5 MiB.');
  const path = `assets/certificates/${slug}-${suffix}.${extension}`;
  const updated = prepareData(data, metadata, path, slug+'-'+suffix);
  const blob = await api('git/blobs','POST',{content:toBase64(image),encoding:'base64'});
  const tree = await api('git/trees','POST',{base_tree:commit.tree.sha,tree:[{path,mode:'100644',type:'blob',sha:blob.sha},{path:DATA_PATH,mode:'100644',type:'blob',content:serializeData(updated)}]});
  const next = await api('git/commits','POST',{message:`Update certificate: ${metadata.name.trim()}`,tree:tree.sha,parents:[head]});
  // Never force: a concurrent push must fail rather than replace someone else's work.
  await api('git/refs/heads/main','PATCH',{sha:next.sha,force:false});
  return {sha:next.sha, path};
}
