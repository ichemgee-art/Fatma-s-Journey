(()=>{
 const node=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;};
 const safe=v=>{try{const u=new URL(v);return u.protocol==='https:'?u.href:'';}catch{return '';}};
 window.portfolioCard=p=>{
  const t=window.portfolioI18n.t,type=p.media?.[0]?.type||p.type||'image';
  const card=node('a','cms-card is-'+type);card.href='/details/?id='+encodeURIComponent(p.id);card.setAttribute('aria-label',t('view')+' '+p.title);
  const visual=node('div','cms-cover'),cover=safe(p.cover);
  if(type==='pdf'&&window.createPDFPreview)visual.append(window.createPDFPreview(p.media[0],p.title,cover));
  else if(cover){const image=node('img');image.src=cover;image.alt='';image.loading='lazy';image.decoding='async';visual.append(image);image.addEventListener('error',()=>{image.remove();visual.classList.add('no-cover');},{once:true});}
  if(type==='audio'){
   const waveform=node('div','card-wave');waveform.setAttribute('aria-hidden','true');for(const h of [18,35,51,28,62,40,75,49,30,60,43,21,39,56,25]){const bar=node('i');bar.style.setProperty('--bar',h+'%');waveform.append(bar);}visual.append(waveform);
  }else if(type!=='pdf'){visual.append(node('span','card-art-symbol',({image:'◈',video:'▷',document:'Aa'})[type]||'✦'));}
  visual.append(node('span','card-format',t(({image:'imageFormat',video:'videoFormat',audio:'audioFormat',pdf:'pdfFormat',document:'documentFormat'})[type]||'detailsLabel')));
  visual.append(node('span','card-open','↗'));card.append(visual);
  const body=node('div','cms-card-body');body.append(node('span','cms-category',window.portfolioI18n.group(p.group)||t(p.category)));
  const title=node('h3','',p.title);title.dir='auto';body.append(title);
  if(p.summary){const summary=node('p','',p.summary);summary.dir='auto';body.append(summary);}
  const footer=node('div','cms-card-footer');footer.append(node('span','',t(({audio:'listen',video:'watch',pdf:'readDocument',document:'readScript',image:'viewPhoto'})[type]||'view')),node('span','card-footer-arrow','↗'));body.append(footer);card.append(body);return card;
 };
})();
