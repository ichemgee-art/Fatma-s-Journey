(()=>{
 const t=key=>window.portfolioI18n.t(key),number=n=>new Intl.NumberFormat(window.portfolioI18n.language==='ar'?'ar-EG':'en').format(n);
 const media=document.getElementById('detailMedia'),status=document.getElementById('detailStatus'),article=document.getElementById('detailArticle');
 let current=null,index=0,related=[];
 function node(tag,cls,value){const e=document.createElement(tag);if(cls)e.className=cls;if(value!==undefined)e.textContent=value;return e;}
 function url(v){try{const u=new URL(v);return u.protocol==='https:'?u.href:'';}catch{return '';}}
 function button(label,pressed,action){const b=node('button','',label);b.type='button';b.setAttribute('aria-pressed',String(pressed));b.addEventListener('click',action);return b;}
 function toast(text){const e=document.getElementById('toast');e.textContent=text;e.classList.add('show');setTimeout(()=>e.classList.remove('show'),2400);}
 function render(){
  if(!current)return;
  const category=t(current.category),group=window.portfolioI18n.group(current.group),categoryUrl='/projects/?category='+encodeURIComponent(current.category);
  document.getElementById('detailCategory').textContent=[category,group].filter(Boolean).join(' / ');document.getElementById('detailCategory').href=categoryUrl;
  document.getElementById('backWork').href=categoryUrl;document.getElementById('moreCategory').href=categoryUrl;
  document.getElementById('detailTitle').textContent=current.title;document.getElementById('detailCrumb').textContent=category;
  document.getElementById('detailSummary').textContent=current.summary||'';document.getElementById('detailSummary').hidden=!current.summary;
  document.title=current.title+' — '+t('name');document.querySelector('link[rel="canonical"]').href=location.origin+'/details/?id='+encodeURIComponent(current.id);
  document.getElementById('detailViewer').hidden=!(current.media||[]).length;stage();
  const script=document.getElementById('detailScript');script.hidden=!current.text;document.getElementById('scriptText').textContent=current.text||'';
  const facts=document.getElementById('detailFacts');facts.replaceChildren();
  for(const [key,value] of [['categoryLabel',category],['formatLabel',t(({audio:'audioFormat',video:'videoFormat',image:'imageFormat',pdf:'pdfFormat',document:'documentFormat'})[current.media?.[0]?.type||current.type]||'detailsLabel')],['clientLabel',current.client],['roleLabel',current.role],['yearLabel',current.year]]){
   if(value){const row=node('div');row.append(node('dt','',t(key)));const dd=node('dd','',value);dd.dir='auto';row.append(dd);facts.append(row);}
  }
  document.getElementById('relatedWorks').hidden=!related.length;const cards=document.getElementById('relatedGrid');cards.replaceChildren(...related.map(p=>window.portfolioCard(p)));
 }
 function embed(u){
  const x=new URL(u),host=x.hostname;
  if(host==='youtu.be')return 'https://www.youtube-nocookie.com/embed/'+encodeURIComponent(x.pathname.slice(1));
  if(['youtube.com','www.youtube.com','m.youtube.com'].includes(host)){const id=x.searchParams.get('v')||(x.pathname.startsWith('/shorts/')?x.pathname.split('/')[2]:'');if(id&&/^[\w-]+$/.test(id))return 'https://www.youtube-nocookie.com/embed/'+id;}
  if(['vimeo.com','www.vimeo.com'].includes(host)){const id=x.pathname.split('/')[1];if(/^\d+$/.test(id))return 'https://player.vimeo.com/video/'+id;}
  return '';
 }
 function stage(){
  media.replaceChildren();const items=current.media||[],m=items[index];
  if(m&&url(m.url)){
   const figure=node('figure','media-stage'),u=url(m.url);
   if(m.type==='pdf'){
    figure.classList.add('pdf-stage');figure.append(window.createPDFPreview(m,current.title,url(current.cover),true));
   }else if(m.provider==='drive'){
    const frame=node('iframe');frame.src=u;frame.title=current.title;frame.allow='fullscreen; picture-in-picture';frame.setAttribute('allowfullscreen','');frame.className=['document','pdf'].includes(m.type)?'document-preview':'drive-preview';figure.append(frame);
   }else if(m.type==='image'){
    const img=node('img');img.src=u;img.alt=m.title||current.title;img.className='portfolio-image';
    const zoom=button(t('enlarge'),false,()=>{const on=figure.classList.toggle('zoomed');zoom.textContent=on?t('fit'):t('enlarge');zoom.setAttribute('aria-pressed',String(on));});zoom.className='media-action';figure.append(img,zoom);
   }else if(m.type==='audio'){
    figure.classList.add('audio-stage');figure.append(node('div','audio-art','♫'),node('p','',current.title));
    const audio=node('audio');audio.controls=true;audio.preload='none';audio.src=u;audio.setAttribute('aria-label',current.title);figure.append(audio);
   }else if(m.type==='video'){
    const src=embed(u);
    if(src){const frame=node('iframe');frame.src=src;frame.title=current.title;frame.allow='fullscreen; picture-in-picture';frame.setAttribute('allowfullscreen','');figure.append(frame);}
    else{const video=node('video');video.controls=true;video.preload='metadata';video.playsInline=true;video.src=u;if(url(m.poster||current.cover))video.poster=m.poster||current.cover;figure.append(video);}
   }
   if(['document','pdf'].includes(m.type)){const link=node('a','media-action',m.type==='pdf'?t('openPDF'):t('openDocument'));link.href=pSource();link.target='_blank';link.rel='noopener noreferrer';figure.append(link);}
   media.append(figure);
   if(!['document','pdf'].includes(m.type)){const fallback=node('a','media-original',t('openFile'));fallback.href=pSource();fallback.target='_blank';fallback.rel='noopener noreferrer';media.append(fallback);}
   function pSource(){return m.provider==='drive'?url(current.sourceUrl)||u:u;}
  }
  if(!m&&!current.text)media.append(node('p','',t('noMedia')));
  if(items.length>1){const nav=node('div','media-pagination');const prev=button(t('previous'),false,()=>{index=(index+items.length-1)%items.length;stage();}),next=button(t('next'),false,()=>{index=(index+1)%items.length;stage();});nav.append(prev,node('span','',number(index+1)+' / '+number(items.length)),next);media.append(nav);}
 }

 document.getElementById('shareWork').addEventListener('click',async()=>{if(!current)return;try{await navigator.clipboard.writeText(location.origin+'/details/?id='+encodeURIComponent(current.id));toast(t('copied'));}catch{}});
 document.getElementById('copyScript').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(current.text);toast(t('scriptCopied'));}catch{}});
 window.addEventListener('portfolio:language',render);
 const id=new URLSearchParams(location.search).get('id');
 function failed(message){status.hidden=true;article.hidden=true;document.getElementById('detailError').hidden=false;if(message)document.querySelector('#detailError p').textContent=message;}
 if(!id||!/^[A-Za-z0-9._-]{1,200}$/.test(id)){failed();return;}
 fetch('/api/projects?id='+encodeURIComponent(id),{headers:{Accept:'application/json'}}).then(async r=>{if(r.status===404){failed();return null;}if(!r.ok)throw Error();return r.json();}).then(data=>{if(!data)return;current=data.project;related=Array.isArray(data.related)?data.related:[];if(!current){failed();return;}status.hidden=true;article.hidden=false;render();}).catch(()=>failed(t('readIssue')));
})();
