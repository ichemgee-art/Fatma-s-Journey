(()=>{
 const grid=document.getElementById('volunteer-grid')
 const status=document.getElementById('volunteer-status')
 if(!grid||!status)return
 const i18n=window.portfolioI18n
 let items=null
 const t=key=>i18n.t(key)
 const node=(tag,className,text)=>{
  const x=document.createElement(tag)
  if(className)x.className=className
  if(text!==undefined)x.textContent=text
  return x
 }
 function safeUrl(input){
  try{const u=new URL(input);return u.protocol==='https:'?u.href:''}catch{return ''}
 }
 function platformFor(url){
  const host=new URL(url).hostname.toLowerCase().replace(/^www\./,'')
  const matches=(...domains)=>domains.some(d=>host===d||host.endsWith('.'+d))
  if(matches('facebook.com','fb.com','fb.watch','fb.me'))return {key:'facebook',label:'Facebook'}
  if(matches('instagram.com'))return {key:'instagram',label:'Instagram'}
  if(matches('linkedin.com','lnkd.in'))return {key:'linkedin',label:'LinkedIn'}
  if(matches('tiktok.com'))return {key:'tiktok',label:'TikTok'}
  if(matches('youtube.com','youtu.be'))return {key:'youtube',label:'YouTube'}
  if(matches('wa.me','whatsapp.com'))return {key:'whatsapp',label:'WhatsApp'}
  if(matches('twitter.com','x.com'))return {key:'x',label:'X'}
  return {key:'website',label:i18n.language==='ar'?'الموقع الإلكتروني':'Website'}
 }
 function optimizedImage(url){
  const u=new URL(url)
  if(u.hostname==='cdn.sanity.io'&&u.pathname.startsWith('/images/')){
   u.searchParams.set('w','1100')
   u.searchParams.set('q','84')
   u.searchParams.set('auto','format')
  }
  return u.href
 }
 function icon(platform){
  const holder=node('span','volunteer-platform-icon')
  holder.setAttribute('aria-hidden','true')
  if(platform.key==='website'){
   const svg=document.createElementNS('http://www.w3.org/2000/svg','svg')
   svg.setAttribute('viewBox','0 0 24 24')
   const path=document.createElementNS('http://www.w3.org/2000/svg','path')
   path.setAttribute('d','M10 13a5 5 0 0 0 7.07 0l3-3A5 5 0 0 0 13 2.93l-1.7 1.7M14 11a5 5 0 0 0-7.07 0l-3 3A5 5 0 0 0 11 21.07l1.7-1.7')
   svg.append(path);holder.append(svg)
  }else{
   const img=node('img')
   img.src='/assets/social/'+platform.key+'.svg'
   img.alt=''
   img.width=22;img.height=22
   holder.append(img)
  }
  return holder
 }
 function renderCard(item){
  const arabic=i18n.language==='ar'
  const role=arabic?item.roleAr:item.roleEn
  const description=arabic?item.descriptionAr:item.descriptionEn
  const card=node('article','volunteer-card')
  const visual=node('div','volunteer-photo-wrap')
  const image=node('img','volunteer-photo')
  image.alt=t('volunteerImageAlt')+': '+role
  image.src=optimizedImage(item.imageUrl)
  image.loading='lazy';image.decoding='async'
  image.addEventListener('error',()=>{
   image.remove()
   visual.append(node('span','volunteer-image-error',arabic?'تعذّر تحميل الصورة':'Image unavailable'))
  },{once:true})
  visual.append(image)
  const body=node('div','volunteer-card-body')
  body.append(node('span','volunteer-kicker',t('volunteering')))
  const title=node('h2','volunteer-role',role);title.dir='auto';body.append(title)
  const summary=node('p','volunteer-description',description);summary.dir='auto';body.append(summary)
  const p=platformFor(item.pageUrl)
  const link=node('a','volunteer-visit')
  link.href=item.pageUrl;link.target='_blank';link.rel='noopener noreferrer'
  link.setAttribute('aria-label',t('volunteerVisit')+' — '+p.label+': '+role)
  const brand=node('span','volunteer-platform')
  brand.append(icon(p),node('span','',p.label))
  link.append(brand,node('span','volunteer-arrow','↗'))
  body.append(link);card.append(visual,body)
  return card
 }
 function showStatus(key){
  status.hidden=false
  status.dataset.i18n=key
  status.textContent=t(key)
 }
 function render(){
  if(items===null){showStatus('volunteerLoading');return}
  if(items.length===0){grid.replaceChildren();grid.hidden=true;showStatus('volunteerEmpty');return}
  const valid=items.filter(x=>safeUrl(x.pageUrl)&&safeUrl(x.imageUrl))
  grid.replaceChildren(...valid.map(renderCard))
  grid.hidden=valid.length===0
  if(valid.length)status.hidden=true
  else showStatus('volunteerEmpty')
 }
 window.addEventListener('portfolio:language',render)
 fetch('/api/volunteering',{headers:{Accept:'application/json'}})
  .then(response=>{if(!response.ok)throw Error('Volunteering request failed');return response.json()})
  .then(data=>{
   items=Array.isArray(data.volunteering)?data.volunteering:[]
   render()
  })
  .catch(error=>{
   console.error('Volunteering:',error?.message||error)
   grid.hidden=true;showStatus('volunteerError')
  })
})();
