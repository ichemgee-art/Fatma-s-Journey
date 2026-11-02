(()=>{
 const t=key=>window.portfolioI18n.t(key);
 const labels={};
 function refreshLabels(){for(const key of ['content','photo','voice','video','dubbing','ai'])labels[key]=t(key);}
 refreshLabels();
 const number=n=>new Intl.NumberFormat(window.portfolioI18n.language==='ar'?'ar-EG':'en').format(n);
 const grid=document.getElementById('cmsGrid'),status=document.getElementById('cmsStatus'),controls=document.getElementById('cmsControls');
 const groups=document.getElementById('cmsGroups');
 let loaded=false,failed=false;
 let list=[],active=new URLSearchParams(location.search).get('category')||'all',group='all',limit=12;
 if(!Object.hasOwn(labels,active))active='all';
 function node(tag,cls,value){const e=document.createElement(tag);if(cls)e.className=cls;if(value!==undefined)e.textContent=value;return e;}
 function url(v){try{const u=new URL(v);return u.protocol==='https:'?u.href:'';}catch{return '';}}
 function groupName(g){return window.portfolioI18n.group(g);}
 function button(label,pressed,action){const b=node('button','',label);b.type='button';b.setAttribute('aria-pressed',String(pressed));b.addEventListener('click',action);return b;}
 function select(category){active=category;group='all';limit=12;draw();const query=new URL(location.href);if(category==='all')query.searchParams.delete('category');else query.searchParams.set('category',category);history.replaceState(null,'',query);}
 function draw(){
  const categoryScroll=controls.scrollLeft;
  controls.replaceChildren(button(t('all'),active==='all',()=>select('all')));
  Object.entries(labels).forEach(([key,label])=>controls.append(button(label,active===key,()=>select(key))));
  controls.scrollLeft=categoryScroll;
  const selected=active==='all'?list:list.filter(p=>p.category===active);
  const names=[...new Set(selected.map(p=>groupName(p.group)).filter(Boolean))];
  groups.replaceChildren();groups.hidden=active==='all'||!names.length;
  if(!groups.hidden){groups.append(button(t('allPrefix')+' '+labels[active],group==='all',()=>{group='all';limit=12;draw();}));names.forEach(g=>groups.append(button(g,group===g,()=>{group=g;limit=12;draw();})));}
  const shown=group==='all'?selected:selected.filter(p=>groupName(p.group)===group);
  grid.replaceChildren();status.hidden=shown.length>0;
  if(!shown.length)status.textContent=t('empty');
  const sections=active==='all'?Object.keys(labels):[active];
  for(const key of sections){
   const works=shown.filter(p=>p.category===key);if(!works.length)continue;
   const section=node('section','portfolio-track');section.setAttribute('aria-label',labels[key]);
   const heading=node('div','track-heading');heading.append(node('h3','',labels[key]),node('span','',number(works.length)+' '+t('works')));section.append(heading);
   const cards=node('div','cms-grid');
   const count=active==='all'?6:limit;
   for(const p of works.slice(0,count))cards.append(card(p));section.append(cards);
   if(works.length>count){const more=button(active==='all'?t('viewAll')+' '+labels[key]:t('more'),false,()=>{if(active==='all')select(key);else{limit+=12;draw();}});more.className='portfolio-more';section.append(more);}
   grid.append(section);
  }
 }
 function card(p){return window.portfolioCard(p);}
 window.addEventListener('portfolio:language',()=>{refreshLabels();group='all';if(loaded)draw();else status.textContent=t(failed?'unavailable':'loading');});
 fetch('/api/projects',{headers:{Accept:'application/json'}}).then(r=>{if(!r.ok)throw Error();return r.json();}).then(data=>{
  loaded=true;list=(data.projects||[]).filter(p=>labels[p.category]);grid.hidden=false;controls.hidden=false;draw();
 }).catch(()=>{failed=true;status.hidden=false;status.textContent=t('unavailable');});
})();
