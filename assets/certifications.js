import { certifications } from "./certifications-data.js";
const cloudIcon='<svg viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><path d="M20 16.2A4.5 4.5 0 0 0 18 7.7a6 6 0 0 0-11.8 1A4 4 0 0 0 6 17h13"/></svg>';
const badgeIcon='<svg viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><circle cx="12" cy="8" r="6"/><path d="m8.5 13-1 9 4.5-3 4.5 3-1-9"/></svg>';
function element(tag,className,text){const el=document.createElement(tag);if(className)el.className=className;if(text)el.textContent=text;return el;}
class AwsCertifications extends HTMLElement {
 connectedCallback(){
  if(this.dataset.ready)return;this.dataset.ready='true';
  const dialog=element('dialog','certificate-dialog');
  dialog.setAttribute('aria-labelledby','certificate-dialog-title');
  const close=element('button','certificate-close','Close ×');close.type='button';close.setAttribute('aria-label','Close certificate viewer');
  const title=element('h3','','');title.id='certificate-dialog-title';
  const large=element('img','certificate-full');
  const panel=element('div','certificate-modal-panel');panel.append(close,title,large);dialog.append(panel);
  let opener;
  close.onclick=()=>dialog.close();
  dialog.addEventListener('click',e=>{if(e.target===dialog){const r=panel.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();}});
  dialog.addEventListener('close',()=>{document.body.style.overflow='';opener?.focus();});
  this.append(dialog);
  certifications.forEach(cert=>{
   const card=element('article','cert-card aws-flip-card'+(cert.issuer==='AWS'?' aws':''));card.tabIndex=0;card.setAttribute('aria-label',cert.name+'. Press Enter or Space to show or hide certificate.');
   const inner=element('div','certificate-inner');
   const front=element('div','certificate-front');const icon=element('div','cert-icon');icon.innerHTML=cert.issuer==='AWS'?cloudIcon:badgeIcon;
   front.append(icon,element('span','cert-issuer',cert.issuer||'Issuer details pending'),element('h3','',cert.name));if(cert.date)front.append(element('p','certificate-date',cert.date));front.append(element('p','',cert.description),element('span','certificate-hint','Hover, tap or press Enter to view'));
   const back=element('div','certificate-back');const img=element('img','certificate-thumb');img.src=cert.image;img.alt=cert.name+' certificate — open full size to inspect';img.loading='lazy';img.width=800;img.height=566;
   const caption=element('p','certificate-caption',cert.name);const link=element('a','certificate-view','View full size');link.href=cert.image;
   back.append(img,caption,link);if(cert.credentialUrl){const credential=element('a','','Verify credential');credential.href=cert.credentialUrl;credential.target='_blank';credential.rel='noopener noreferrer';back.append(credential);}
   inner.append(front,back);card.append(inner);this.append(card);
   let pinned=false,hovered=false;
   const update=()=>{const flipped=pinned||hovered;card.classList.toggle('is-flipped',flipped);front.setAttribute('aria-hidden',String(flipped));back.setAttribute('aria-hidden',String(!flipped));back.inert=!flipped;};update();
   card.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'&&matchMedia('(hover:hover)').matches){hovered=true;update();}});
   card.addEventListener('pointerleave',()=>{hovered=false;update();});
   card.addEventListener('click',e=>{if(e.target.closest('a,button'))return;pinned=!pinned;hovered=false;update();});
   card.addEventListener('keydown',e=>{if(e.target!==card)return;if(e.key==='Enter'||e.key===' '){e.preventDefault();pinned=!pinned;hovered=false;update();}});
   link.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();pinned=true;update();opener=link;title.textContent=cert.name;large.src=cert.image;large.alt=cert.name+' certificate, full size';dialog.showModal();document.body.style.overflow='hidden';close.focus();});
  });
 }
}
customElements.define('aws-certifications',AwsCertifications);
