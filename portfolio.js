(()=>{
 const labels={content:'Content Creation',photo:'Photography',voice:'Voice Over',video:'Videos',dubbing:'Dubbing',ai:'AI Content'};
 const grid=document.getElementById('cmsGrid'),status=document.getElementById('cmsStatus'),controls=document.getElementById('cmsControls');
 const groups=document.getElementById('cmsGroups'),modal=document.getElementById('cmsModal'),media=document.getElementById('cmsModalMedia');
 const closeButton=document.getElementById('cmsClose');
 let list=[],active='all',group='all',limit=12,origin=null,current=null,index=0;
 function node(tag,cls,value){const e=document.createElement(tag);if(cls)e.className=cls;if(value!==undefined)e.textContent=value;return e;}
 function url(v){try{const u=new URL(v);return u.protocol==='https:'?u.href:'';}catch{return '';}}
 function groupName(g){return ({'scripts':'Scripts','Ai Designs':'AI Images','Ai Videos':'AI Videos','Ai Videos / Engineering':'AI Videos / Engineering','Ai Songs':'AI Music'})[g]||g;}
 function button(label,pressed,action){const b=node('button','',label);b.type='button';b.setAttribute('aria-pressed',String(pressed));b.addEventListener('click',action);return b;}
 function select(category){active=category;group='all';limit=12;draw();}
 function draw(){
  controls.replaceChildren(button('All work',active==='all',()=>select('all')));
  Object.entries(labels).forEach(([key,label])=>controls.append(button(label,active===key,()=>select(key))));
  const selected=active==='all'?list:list.filter(p=>p.category===active);
  const names=[...new Set(selected.map(p=>groupName(p.group)).filter(Boolean))];
  groups.replaceChildren();groups.hidden=active==='all'||!names.length;
  if(!groups.hidden){groups.append(button('All '+labels[active],group==='all',()=>{group='all';limit=12;draw();}));names.forEach(g=>groups.append(button(g,group===g,()=>{group=g;limit=12;draw();})));}
  const shown=group==='all'?selected:selected.filter(p=>groupName(p.group)===group);
  grid.replaceChildren();status.hidden=shown.length>0;
  if(!shown.length)status.textContent='No work in this section yet.';
  const sections=active==='all'?Object.keys(labels):[active];
  for(const key of sections){
   const works=shown.filter(p=>p.category===key);if(!works.length)continue;
   const section=node('section','portfolio-track');section.setAttribute('aria-label',labels[key]);
   const heading=node('div','track-heading');heading.append(node('h3','',labels[key]),node('span','',works.length+' works'));section.append(heading);
   const cards=node('div','cms-grid');
   const count=active==='all'?6:limit;
   for(const p of works.slice(0,count))cards.append(card(p));section.append(cards);
   if(works.length>count){const more=button(active==='all'?'View all '+labels[key]:'Show more',false,()=>{if(active==='all')select(key);else{limit+=12;draw();}});more.className='portfolio-more';section.append(more);}
   grid.append(section);
  }
 }
 function card(p){
  const b=node('button','cms-card');b.type='button';b.setAttribute('aria-label','View '+p.title);
  const cover=node('div','cms-cover'),type=p.media?.[0]?.type||'image';
  if(url(p.cover)){const img=node('img');img.src=p.cover;img.alt='';img.loading='lazy';img.decoding='async';img.addEventListener('error',()=>{img.remove();cover.classList.add('no-cover');},{once:true});cover.append(img);}
  const symbol={audio:'♫',video:'▶',pdf:'PDF',document:'Aa',image:'↗'}[type]||'↗';
  cover.append(node('span','cms-type-icon',symbol));b.append(cover);
  const body=node('div','cms-card-body');body.append(node('span','cms-category',groupName(p.group)||labels[p.category]),node('h3','',p.title));
  if(p.summary)body.append(node('p','',p.summary));
  body.append(node('div','cms-card-footer',({audio:'Listen',video:'Watch',pdf:'Read document',document:'Read script',image:'View photo'})[type]+' ↗'));
  b.append(body);b.addEventListener('click',()=>open(p,b));return b;
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
  const text=node('div','portfolio-script',current.text||'');text.dir='auto';
  if(m&&url(m.url)){
   const figure=node('figure','media-stage'),u=url(m.url);
   if(m.provider==='drive'){
    const frame=node('iframe');frame.src=u;frame.title=current.title;frame.allow='fullscreen; picture-in-picture';frame.setAttribute('allowfullscreen','');frame.className=['document','pdf'].includes(m.type)?'document-preview':'drive-preview';figure.append(frame);
   }else if(m.type==='image'){
    const img=node('img');img.src=u;img.alt=m.title||current.title;img.className='portfolio-image';
    const zoom=button('Enlarge image',false,()=>{const on=figure.classList.toggle('zoomed');zoom.textContent=on?'Fit image':'Enlarge image';zoom.setAttribute('aria-pressed',String(on));});zoom.className='media-action';figure.append(img,zoom);
   }else if(m.type==='audio'){
    figure.classList.add('audio-stage');figure.append(node('div','audio-art','♫'),node('p','',current.title));
    const audio=node('audio');audio.controls=true;audio.preload='none';audio.src=u;audio.setAttribute('aria-label',current.title);figure.append(audio);
   }else if(m.type==='video'){
    const src=embed(u);
    if(src){const frame=node('iframe');frame.src=src;frame.title=current.title;frame.allow='fullscreen; picture-in-picture';frame.setAttribute('allowfullscreen','');figure.append(frame);}
    else{const video=node('video');video.controls=true;video.preload='metadata';video.playsInline=true;video.src=u;if(url(m.poster||current.cover))video.poster=m.poster||current.cover;figure.append(video);}
   }else if(m.type==='pdf'){
    const frame=node('iframe');frame.src=u;frame.title=current.title+' — document';frame.className='document-preview';figure.append(frame);
   }
   if(['document','pdf'].includes(m.type)){const link=node('a','media-action',m.type==='pdf'?'Open PDF ↗':'Open original document ↗');link.href=pSource();link.target='_blank';link.rel='noopener noreferrer';figure.append(link);}
   media.append(figure);
   if(!['document','pdf'].includes(m.type)){const fallback=node('a','media-original','Open original file ↗');fallback.href=pSource();fallback.target='_blank';fallback.rel='noopener noreferrer';media.append(fallback);}
   function pSource(){return m.provider==='drive'?url(current.sourceUrl)||u:u;}
  }
  if(current.text)media.append(text);
  if(!m&&!current.text)media.append(node('p','','This work has no media attached yet.'));
  if(items.length>1){const nav=node('div','media-pagination');const prev=button('← Previous',false,()=>{index=(index+items.length-1)%items.length;stage();}),next=button('Next →',false,()=>{index=(index+1)%items.length;stage();});nav.append(prev,node('span','',String(index+1)+' / '+items.length),next);media.append(nav);}
 }
 function open(p,b){
  origin=b;current=p;index=0;
  document.getElementById('cmsModalTitle').textContent=p.title;
  document.getElementById('cmsModalCategory').textContent=[labels[p.category],groupName(p.group)].filter(Boolean).join(' / ');
  document.getElementById('cmsModalDetails').textContent=[p.summary,p.role,p.client,p.year].filter(Boolean).join(' · ');
  stage();modal.classList.add('open');modal.setAttribute('aria-hidden','false');document.body.style.overflow='hidden';
  document.querySelector('.page').inert=true;closeButton.focus();
 }
 function close(){modal.classList.remove('open');modal.setAttribute('aria-hidden','true');media.replaceChildren();document.body.style.overflow='';document.querySelector('.page').inert=false;origin?.focus();current=null;}
 closeButton.addEventListener('click',close);modal.addEventListener('click',e=>{if(e.target===modal)close();});
 document.addEventListener('keydown',e=>{
  if(!current)return;
  if(e.key==='Escape'){close();return;}
  if(e.key==='Tab'){
   const elements=[...modal.querySelectorAll('button,a[href],audio[controls],video[controls],iframe')];const first=elements[0],last=elements[elements.length-1];
   if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus();}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus();}
  }
 });
 document.querySelectorAll('[data-go]').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();select(a.dataset.go);document.getElementById('projects').scrollIntoView({behavior:'smooth'});}));
 const nav=document.getElementById('nav'),menu=document.getElementById('menu');
 menu.addEventListener('click',()=>{const open=nav.classList.toggle('open');menu.setAttribute('aria-expanded',String(open));});
 nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',()=>{nav.classList.remove('open');menu.setAttribute('aria-expanded','false');}));
 document.getElementById('copyLink').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(location.href.split('#')[0]);const t=document.getElementById('toast');t.textContent='Portfolio link copied';t.classList.add('show');setTimeout(()=>t.classList.remove('show'),2500);}catch{}});
 fetch('/api/projects',{headers:{Accept:'application/json'}}).then(r=>{if(!r.ok)throw Error();return r.json();}).then(data=>{
  list=(data.projects||[]).filter(p=>labels[p.category]);grid.hidden=false;controls.hidden=false;draw();
 }).catch(()=>{status.hidden=false;status.textContent='The portfolio is temporarily unavailable. Please try again shortly.';});
})();
