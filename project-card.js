(()=>{
 const node=(tag,cls,value)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(value!==undefined)e.textContent=value;return e;};
 const safe=v=>{try{const u=new URL(v);return u.protocol==='https:'?u.href:'';}catch{return '';}};
 const categoryList=['content','voice','video','dubbing','ai','photo'];
 const icon={content:'Aa',voice:'♫',video:'▷',dubbing:'◉',ai:'✳',photo:'◈'};
 const formatKey={image:'imageFormat',video:'videoFormat',audio:'audioFormat',pdf:'pdfFormat',document:'documentFormat'};
 const actionKey={audio:'listen',video:'watch',pdf:'readDocument',document:'readScript',image:'viewPhoto'};
 const bars=[16,28,46,67,35,76,52,95,64,40,71,31,57,83,39,20];
 window.portfolioCard=(data)=>{
  const p=window.portfolioI18n.localizeProject(data),t=window.portfolioI18n.t;
  const kind=p.media?.[0]?.type||p.type||'image';
  const type=Object.hasOwn(formatKey,kind)?kind:'image';
  const category=categoryList.includes(p.category)?p.category:'content';
  const card=node('a','cms-card is-'+type+' category-'+category+(p.customCover?' has-custom-cover':''));
  card.href='/details/?id='+encodeURIComponent(p.id);
  card.setAttribute('aria-label',t(actionKey[type]||'view')+': '+p.title);
  const visual=node('div','cms-cover'),m=p.media?.[0],cover=safe(p.cover)||safe(m?.poster);
  const art=node('div','cover-art');
  art.setAttribute('aria-hidden','true');
  const top=node('div','cover-art-top');
  top.append(node('span','cover-monogram','FJ'),node('span','cover-series',t(category)));
  const center=node('div','cover-art-center');
  center.append(node('span','cover-art-symbol',icon[category]));
  const displayTitle=node('strong','cover-art-title',p.title||t(category));
  displayTitle.dir='auto';center.append(displayTitle);
  const bottom=node('div','cover-art-bottom');
  bottom.append(node('span','cover-art-divider'),node('span','cover-art-caption',t(formatKey[type])));
  art.append(top,center,bottom);visual.append(art);
  function driveEmbedFallback(){
   const id=String(m?.driveId||p.driveId||'');
   if(!['image','video'].includes(type)||!/^[A-Za-z0-9_-]{10,100}$/.test(id))return;
   if(visual.querySelector('.media-embed-fallback'))return;
   const frame=node('iframe','media-embed-fallback');
   frame.src='https://drive.google.com/file/d/'+encodeURIComponent(id)+'/preview';
   frame.title=p.title+' — preview';
   frame.loading='lazy';frame.tabIndex=-1;
   frame.setAttribute('aria-hidden','true');
   frame.setAttribute('scrolling','no');
   visual.classList.add('has-media-embed');
   visual.append(frame);
  }
  if(type==='pdf'){
   visual.classList.add('preview-pdf');
   art.remove();
   if(m&&window.createPDFPreview){
    const previewSource={...m,driveId:m.driveId||p.driveId||''};
    visual.append(window.createPDFPreview(previewSource,p.title,''));
   }else{
    const empty=node('div','pdf-first-page preview-unavailable');
    empty.append(node('span','pdf-placeholder','PDF'));
    visual.append(empty);
   }
   if(p.customCover&&cover){
    const img=node('img','cover-media');
    img.alt='';img.loading='lazy';img.decoding='async';
    img.addEventListener('load',()=>{visual.classList.add('cover-loaded');card.classList.add('cover-loaded');},{once:true});
    img.addEventListener('error',()=>{card.classList.remove('has-custom-cover');img.remove();},{once:true});
    visual.append(img);img.src=cover;
   }else card.classList.remove('has-custom-cover');
  }else if(cover){
   const img=node('img','cover-media');
   img.alt='';img.loading='lazy';img.decoding='async';
   img.addEventListener('load',()=>visual.classList.add('preview-ready'),{once:true});
   img.addEventListener('error',()=>{visual.classList.add('preview-failed');img.remove();driveEmbedFallback();},{once:true});
   visual.append(img);img.src=cover;
  }
  if(!cover&&type!=='pdf')driveEmbedFallback();
  if((category==='voice'||category==='dubbing'||type==='audio')&&!cover){
   const waveform=node('div','cover-wave');waveform.setAttribute('aria-hidden','true');
   for(const height of bars){const bar=node('i');bar.style.setProperty('--wave-height',height+'%');waveform.append(bar);}
   visual.append(waveform);
  }
  if(type==='video'&&!cover){
   const marker=node('span','cover-play-indicator','▷');marker.setAttribute('aria-hidden','true');visual.append(marker);
  }
  visual.append(node('span','card-format',t(formatKey[type])));
  const open=node('span','card-open','↗');open.setAttribute('aria-hidden','true');visual.append(open);
  const body=node('div','cms-card-body');
  const categoryText=window.portfolioI18n.group(p.group)||t(category);
  body.append(node('span','cms-category',categoryText));
  const title=node('h3','',p.title);title.dir='auto';body.append(title);
  if(p.summary){const summary=node('p','cms-summary',p.summary);summary.dir='auto';body.append(summary);}
  if(p.role){const role=node('p','cms-role');role.append(node('span','cms-role-label',t('roleLabel')+': '),document.createTextNode(p.role));role.dir='auto';body.append(role);}
  const footer=node('div','cms-card-footer');
  footer.append(node('span','',t(actionKey[type]||'view')),node('span','card-footer-arrow','↗'));
  body.append(footer);card.append(visual,body);
  return card;
 };
})();