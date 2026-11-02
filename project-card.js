(()=>{
 const node=(tag,cls,text)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;};
 const safe=v=>{try{const u=new URL(v);return u.protocol==='https:'?u.href:'';}catch{return '';}};
 window.portfolioCard=p=>{
  p=window.portfolioI18n.localizeProject(p);
  const t=window.portfolioI18n.t,type=p.media?.[0]?.type||p.type||'image';
  const card=node('a','cms-card is-'+type+(p.category==='voice'?' is-voice':'')+(p.customCover?' has-custom-cover':''));card.href='/details/?id='+encodeURIComponent(p.id);card.setAttribute('aria-label',t('view')+' '+p.title);
  const visual=node('div','cms-cover'),cover=safe(p.cover);
  if(type==='pdf'&&!p.customCover&&window.createPDFPreview)visual.append(window.createPDFPreview(p.media[0],p.title,cover));
  else if(cover){const image=node('img');image.src=cover;image.alt='';image.loading='lazy';image.decoding='async';visual.append(image);image.addEventListener('error',()=>{image.remove();visual.classList.add('no-cover');},{once:true});}
  if(p.category==='voice'){
   const art=node('div','voice-art');art.setAttribute('aria-hidden','true');
   const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 64 64');svg.setAttribute('class','voice-mic');
   for(const d of ['M25 13a7 7 0 0 1 14 0v20a7 7 0 0 1-14 0Z','M18 28v5a14 14 0 0 0 28 0v-5M32 47v10M24 57h16','M8 23v15M56 23v15M3 28v5M61 28v5']){const path=document.createElementNS('http://www.w3.org/2000/svg','path');path.setAttribute('d',d);path.setAttribute('stroke-linecap','round');svg.append(path);}art.append(svg,node('strong','',t('voiceCard')),node('small','',t('voiceCardSub')));
   const wave=node('div','card-wave');for(const h of [22,43,65,37,82,51,100,59,31,74,48,26,55,71,35]){const bar=node('i');bar.style.setProperty('--bar',h+'%');wave.append(bar);}art.append(wave);visual.append(art);
  }else if(type==='audio'){
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
