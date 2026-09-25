import { certifications } from './certifications-data.js';
import { certificateFile, verificationUrl } from './certificate-utils.js';
const icon='<svg viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="8" r="6"/><path d="m8.5 13-1 9 4.5-3 4.5 3-1-9"/></svg>';
function el(tag,cls='',text=''){const n=document.createElement(tag);n.className=cls;n.textContent=text;return n;}
function link(text,href,download=false){const n=el('a','certificate-view',text);n.href=href;if(download)n.download=href.split('/').pop();else{n.target='_blank';n.rel='noopener noreferrer';}return n;}
function details(c){const n=el('div','certificate-details');for(const [label,value] of [['Issuer',c.issuer],['Issued',c.date],['Credential ID',c.credentialId],['Category',c.category]])if(value)n.append(el('p','',`${label}: ${value}`));return n;}
class AwsCertifications extends HTMLElement{
 connectedCallback(){
  if(this.dataset.ready)return;this.dataset.ready='true';
  const dialog=el('dialog','certificate-dialog');dialog.setAttribute('aria-labelledby','certificate-dialog-title');
  const panel=el('div','certificate-modal-panel'),close=el('button','certificate-close','Close ×'),title=el('h3'),metadata=el('div'),image=el('img','certificate-full'),error=el('p','','The certificate could not be loaded. Try Open Full Certificate.'),actions=el('div','certificate-actions');
  close.type='button';close.setAttribute('aria-label','Close certificate viewer');title.id='certificate-dialog-title';error.hidden=true;panel.append(close,title,metadata,image,error,actions);dialog.append(panel);this.append(dialog);
  let opener,previousOverflow;close.onclick=()=>dialog.close();image.onerror=()=>{error.hidden=false;image.hidden=true;};
  dialog.addEventListener('click',e=>{if(e.target===dialog){const r=panel.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
  dialog.addEventListener('close',()=>{document.body.style.overflow=previousOverflow;opener?.focus();});
  for(const cert of certifications){
   const file=certificateFile(cert.file),verify=verificationUrl(cert.credentialUrl),card=el('article','cert-card aws-flip-card'+(cert.issuer==='AWS'?' aws':'')),inner=el('div','certificate-inner'),front=el('div','certificate-front'),badge=el('div','cert-icon');badge.innerHTML=icon;
   front.append(badge,el('h3','',cert.name),details(cert));if(cert.description)front.append(el('p','',cert.description));inner.append(front);card.append(inner);this.append(card);
   if(!file){front.append(el('p','certificate-missing','Certificate file not added yet.'));continue;}
   const preview=()=>{if(file.pdf&&!certificateFile(cert.thumbnail))return el('p','certificate-pdf','PDF document · Open to read the original certificate');const n=el('img','certificate-thumb');n.src=file.pdf?cert.thumbnail:file.path;n.alt=cert.name+' — original certificate preview';n.loading='lazy';n.width=800;n.height=566;n.onerror=()=>n.replaceWith(el('p','certificate-missing','Preview unavailable. Open the original certificate below.'));return n;};
   const buttons=()=>{const group=el('div','certificate-actions'),view=link('View Certificate',file.path);view.addEventListener('click',e=>{if(file.pdf)return;e.preventDefault();e.stopPropagation();opener=view;title.textContent=cert.name;metadata.replaceChildren(details(cert));error.hidden=true;image.hidden=false;image.src=file.path;image.alt=cert.name+' — full-resolution certificate';actions.replaceChildren(link('Open Full Certificate',file.path),link('Download Certificate',file.path,true));if(verify)actions.append(link('Verify Credential',verify));previousOverflow=document.body.style.overflow;dialog.showModal();document.body.style.overflow='hidden';close.focus();});group.append(view,link('Open Certificate',file.path),link('Download Certificate',file.path,true));if(verify)group.append(link('Verify Credential',verify));return group;};
   front.append(preview(),buttons(),el('span','certificate-hint','Hover, tap or press Enter to flip'));const back=el('div','certificate-back');back.append(preview(),el('p','certificate-caption',cert.name),buttons());inner.append(back);
   card.tabIndex=0;card.setAttribute('aria-label',cert.name+'. Press Enter or Space to flip the certificate card.');let pinned=false,hovered=false;
   const update=()=>{const flipped=pinned||hovered;card.classList.toggle('is-flipped',flipped);front.inert=flipped;back.inert=!flipped;front.setAttribute('aria-hidden',String(flipped));back.setAttribute('aria-hidden',String(!flipped));};update();
   card.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'&&matchMedia('(hover:hover)').matches&&!card.contains(document.activeElement)){hovered=true;update();}});
   card.addEventListener('pointerleave',()=>{if(back.contains(document.activeElement))pinned=true;hovered=false;update();});
   card.addEventListener('click',e=>{if(e.target.closest('a,button'))return;pinned=!pinned;hovered=false;update();});
   card.addEventListener('keydown',e=>{if(e.target===card&&(e.key==='Enter'||e.key===' ')){e.preventDefault();pinned=!pinned;hovered=false;update();}});
  }
 }
}
customElements.define('aws-certifications',AwsCertifications);
