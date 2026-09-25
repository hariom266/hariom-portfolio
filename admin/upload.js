import {certifications} from '../assets/certifications-data.js';
import {publishCertificate, imageType, parseData, REPO} from './github.js';

const $ = id => document.getElementById(id);
const LOCK_KEY = 'portfolio-certificate-lock-v1';
const TOKEN_KEY = 'portfolio-certificate-token-v1';
let prepared, previewUrl, busy = false, watchId = 0;
const stored = key => { try { return localStorage.getItem(key); } catch { return null; } };
const forget = () => { try { localStorage.removeItem(TOKEN_KEY); } catch {} $('token').value = ''; $('remember').checked = false; };
async function hash(password, salt) {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(password), 'PBKDF2', false, ['deriveBits']);
  const result = await crypto.subtle.deriveBits({name:'PBKDF2',salt:new TextEncoder().encode(salt),iterations:210000,hash:'SHA-256'},key,256);
  return [...new Uint8Array(result)].map(b => b.toString(16).padStart(2,'0')).join('');
}
function showGate() {
  $('gate-title').textContent = stored(LOCK_KEY) ? 'Unlock this browser' : 'Set a browser password';
  $('gate-help').textContent = stored(LOCK_KEY) ? 'Enter the password you set on this browser. This does not authenticate with GitHub.' : 'Choose at least 10 characters. Only a salted password hash is stored locally. This lock applies only to this browser—not every visitor to the page.';
  $('password').autocomplete = stored(LOCK_KEY) ? 'current-password' : 'new-password';
}
showGate();
for (const cert of certifications) {
  const option = document.createElement('option'); option.value = cert.id; option.textContent = cert.name; $('existing').append(option);
}
$('unlock-form').addEventListener('submit', async event => {
  event.preventDefault(); $('unlock').disabled = true; $('gate-message').textContent = '';
  try {
    const password = $('password').value;
    const saved = stored(LOCK_KEY);
    if (saved) {
      const lock = JSON.parse(saved);
      if (await hash(password,lock.salt) !== lock.hash) throw new Error('Incorrect browser password.');
    } else {
      if (password.length < 10) throw new Error('Use at least 10 characters.');
      const salt = crypto.randomUUID();
      localStorage.setItem(LOCK_KEY,JSON.stringify({salt,hash:await hash(password,salt)}));
    }
    $('password').value = ''; $('gate').hidden = true; $('editor').hidden = false;
    $('token').value = stored(TOKEN_KEY) || ''; $('remember').checked = Boolean(stored(TOKEN_KEY)); $('token').focus();
  } catch (error) { $('gate-message').textContent = error instanceof SyntaxError ? 'Browser lock data is invalid. Clear this site’s local storage to set a new browser password.' : error.message; }
  finally { $('unlock').disabled = false; }
});
$('lock').addEventListener('click', () => {
  if (busy) return;
  watchId++; $('token').value = ''; $('editor').hidden = true; $('gate').hidden = false; showGate(); $('password').focus();
});
$('forget').addEventListener('click', () => { forget(); $('status').textContent = 'Saved token removed from this browser.'; });
$('remember').addEventListener('change', () => { if (!$('remember').checked) { try {localStorage.removeItem(TOKEN_KEY);} catch {} } });
$('existing').addEventListener('change', () => {
  const cert = certifications.find(c => c.id === $('existing').value);
  $('name').value = cert?.name || ''; $('issuer').value = cert?.issuer || 'AWS'; $('date').value = cert?.date || '';
});
let selection = 0;
$('image').addEventListener('change', async () => {
  const current = ++selection;
  prepared = null; $('preview').hidden = true; $('image-info').textContent = '';
  if (previewUrl) URL.revokeObjectURL(previewUrl);
  const file = $('image').files[0]; if (!file) return;
  $('publish').disabled = true;
  try {
    if (file.size > 5*1024*1024 || !file.size) throw new Error('Choose a nonempty image no larger than 5 MiB.');
    const bytes = new Uint8Array(await file.arrayBuffer());
    const mime = imageType(bytes);
    if (!mime || !/\.(jpe?g|png|webp)$/i.test(file.name)) throw new Error('Only JPG, PNG and WebP images are accepted.');
    const bitmap = await createImageBitmap(new Blob([bytes],{type:mime}));
    let blob;
    try {
      if (!bitmap.width || !bitmap.height || bitmap.width*bitmap.height > 40000000) throw new Error('Image dimensions are too large. Please choose an image under 40 megapixels.');
      const scale = Math.min(1,2400/Math.max(bitmap.width,bitmap.height));
      const canvas = document.createElement('canvas'); canvas.width = Math.round(bitmap.width*scale); canvas.height = Math.round(bitmap.height*scale);
      canvas.getContext('2d').drawImage(bitmap,0,0,canvas.width,canvas.height);
      blob = await new Promise(resolve => canvas.toBlob(resolve,'image/webp',.9));
      if (!blob) throw new Error('Image conversion failed. Try a different image.');
      if (scale === 1 && blob.size >= file.size) blob = new Blob([bytes],{type:mime});
    } finally { bitmap.close(); }
    if (blob.size > 5*1024*1024) throw new Error('Processed image exceeds 5 MiB. Please use a smaller image.');
    const output = new Uint8Array(await blob.arrayBuffer());
    if (current !== selection) return;
    prepared = {image:output,mime:imageType(output)};
    previewUrl = URL.createObjectURL(blob); $('preview').src = previewUrl; $('preview').hidden = false;
    $('image-info').textContent = `Ready: ${(blob.size/1024).toFixed(0)} KiB (${prepared.mime.replace('image/','')}). Check the preview before publishing.`;
  } catch (error) { if (current === selection) $('image-info').textContent = error.message || 'Cannot decode this image. Choose a valid JPG, PNG or WebP.'; }
  finally { if (current === selection) $('publish').disabled = busy; }
});
async function watchProduction(path, id) {
  // The production page can still be serving the previous deployment for a while.
  for (let attempt = 0; attempt < 24 && id === watchId; attempt++) {
    await new Promise(resolve => setTimeout(resolve,5000));
    if (id !== watchId) return;
    try {
      const response = await fetch('../assets/certifications-data.js?deployment='+Date.now(),{cache:'no-store'});
      if (response.ok && parseData(await response.text()).some(c => c.image === './'+path)) {
        if (id === watchId) $('status').textContent = 'Published to GitHub and verified on this website. Open the production website to view your certificate.';
        return;
      }
    } catch { /* A deployment may briefly be unavailable. Keep the commit links visible. */ }
  }
  if (id === watchId) $('status').textContent = 'Committed to GitHub. The updated site is not visible yet. Check Vercel deployment status and confirm Git auto-deploy is connected to main; do not upload again.';
}
$('upload-form').addEventListener('submit', async event => {
  event.preventDefault(); if (busy) return;
  if (!prepared) { $('status').textContent = 'Select a valid certificate image and wait for the preview.'; return; }
  const token = $('token').value.trim(); if (!token) return;
  const metadata = {id:$('existing').value,name:$('name').value,issuer:$('issuer').value,date:$('date').value};
  const payload = {token,metadata,...prepared};
  busy = true; const id = ++watchId;
  $('result').hidden = true; $('status').textContent = 'Uploading image and certificate details to GitHub…';
  const controls = [...$('upload-form').elements,$('lock')]; controls.forEach(el => el.disabled = true);
  try {
    if ($('remember').checked) localStorage.setItem(TOKEN_KEY,token); else { try { localStorage.removeItem(TOKEN_KEY); } catch {} }
    const result = await publishCertificate(payload);
    $('commit-link').href = `https://github.com/${REPO}/commit/${result.sha}`;
    $('result').hidden = false;
    $('status').textContent = 'Committed to GitHub in one update. Waiting for Vercel to deploy (usually a minute or two).';
    prepared = null; $('image').value = ''; $('preview').hidden = true; $('image-info').textContent = '';
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    if (location.hostname === 'hariom-portfolio-lac.vercel.app') void watchProduction(result.path,id);
    else $('status').textContent = 'Committed to GitHub. Use the production and Vercel links below to check deployment. Reload this page before another upload.';
  } catch (error) { $('status').textContent = error.message; }
  finally { busy = false; controls.forEach(el => el.disabled = false); }
});
