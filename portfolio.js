(()=>{
 const t=key=>window.portfolioI18n.t(key);
 const categories=['content','video','voice','dubbing','ai','photo'];
 const labels={};
 const refreshLabels=()=>categories.forEach(key=>labels[key]=t(key));
 refreshLabels();
 const number=value=>new Intl.NumberFormat(window.portfolioI18n.language==='ar'?'ar-EG':'en').format(value);
 const grid=document.getElementById('cmsGrid'),status=document.getElementById('cmsStatus');
 const controls=document.getElementById('cmsControls'),groups=document.getElementById('cmsGroups');
 const overview=document.getElementById('portfolioOverview');
 const highlights=document.getElementById('work-highlights'),highlightsGrid=document.getElementById('workHighlightsGrid');
 let loaded=false,failed=false,list=[],active=new URLSearchParams(location.search).get('category')||'all',group='all',limit=12;
 if(!Object.hasOwn(labels,active))active='all';
 const node=(tag,cls,value)=>{const e=document.createElement(tag);if(cls)e.className=cls;if(value!==undefined)e.textContent=value;return e;};
 const groupName=g=>window.portfolioI18n.group(g);
 function button(label,pressed,action){const b=node('button','',label);b.type='button';b.setAttribute('aria-pressed',String(pressed));b.addEventListener('click',action);return b;}
 function select(category){
  active=category;group='all';limit=12;draw();
  const query=new URL(location.href);
  if(category==='all')query.searchParams.delete('category');else query.searchParams.set('category',category);
  history.replaceState(null,'',query);
 }
 function renderOverview(){
  if(!overview)return;
  const count=new Set(list.map(project=>project.category)).size;
  const work=node('span','overview-pill');
  work.append(node('strong','',number(list.length)+' '),document.createTextNode(t('overviewWorks')));
  const disciplines=node('span','overview-pill');
  disciplines.append(node('strong','',number(count)+' '),document.createTextNode(t('overviewDisciplines')));
  overview.replaceChildren(work,disciplines);
  overview.hidden=!list.length;
 }
 function renderHighlights(){
  if(!highlights||!highlightsGrid)return;
  const byId=new Map(list.map(project=>[project.id,project]));
  const picks=window.portfolioI18n.featuredIds.map(id=>byId.get(id)).filter(Boolean);
  const seen=new Set(picks.map(project=>project.id));
  for(const category of ['content','video','voice']){
   if(picks.length>=3)break;
   const fallback=list.find(project=>project.category===category&&project.media?.length&&!seen.has(project.id));
   if(fallback){picks.push(fallback);seen.add(fallback.id);}
  }
  highlightsGrid.replaceChildren(...picks.slice(0,3).map(window.portfolioCard));
  highlights.hidden=active!=='all'||!picks.length;
 }
 function draw(){
  const scroll=controls.scrollLeft;
  controls.replaceChildren(button(t('all'),active==='all',()=>select('all')));
  for(const category of categories)controls.append(button(labels[category],active===category,()=>select(category)));
  controls.scrollLeft=scroll;
  const selected=active==='all'?list:list.filter(project=>project.category===active);
  const names=[...new Set(selected.map(project=>groupName(project.group)).filter(Boolean))];
  groups.replaceChildren();groups.hidden=active==='all'||!names.length;
  if(!groups.hidden){
   groups.append(button(t('allPrefix')+' '+labels[active],group==='all',()=>{group='all';limit=12;draw();}));
   for(const name of names)groups.append(button(name,group===name,()=>{group=name;limit=12;draw();}));
  }
  const shown=group==='all'?selected:selected.filter(project=>groupName(project.group)===group);
  grid.replaceChildren();status.hidden=shown.length>0;
  if(!shown.length)status.textContent=t('empty');
  for(const key of active==='all'?categories:[active]){
   const works=shown.filter(project=>project.category===key);
   if(!works.length)continue;
   const section=node('section','portfolio-track');section.setAttribute('aria-label',labels[key]);
   const heading=node('div','track-heading'),copy=node('div','track-copy');
   copy.append(node('h3','',labels[key]),node('p','track-description',t('section_'+key)));
   heading.append(copy,node('span','',number(works.length)+' '+t('works')));section.append(heading);
   const cards=node('div','cms-grid'),count=active==='all'?6:limit;
   for(const project of works.slice(0,count))cards.append(window.portfolioCard(project));
   section.append(cards);
   if(works.length>count){
    const more=button(active==='all'?t('viewAll')+' '+labels[key]:t('more'),false,()=>{if(active==='all')select(key);else{limit+=12;draw();}});
    more.className='portfolio-more';section.append(more);
   }
   grid.append(section);
  }
  renderOverview();renderHighlights();
 }
 window.addEventListener('portfolio:language',()=>{
  refreshLabels();group='all';
  if(loaded)draw();else status.textContent=t(failed?'unavailable':'loading');
 });
 fetch('/api/projects',{headers:{Accept:'application/json'}}).then(response=>{if(!response.ok)throw Error('Portfolio unavailable');return response.json();}).then(data=>{
  loaded=true;list=(data.projects||[]).filter(project=>Object.hasOwn(labels,project.category));
  grid.hidden=false;controls.hidden=false;draw();
 }).catch(()=>{failed=true;status.hidden=false;status.textContent=t('unavailable');});
})();