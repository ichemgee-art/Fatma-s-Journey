const categories = ['content','photo','voice','video','dubbing','ai'];
const projectId = process.env.SANITY_PROJECT_ID || 'q3zqgei4';
const dataset = process.env.SANITY_DATASET || 'production';
const projection = '_type,kind,title,caption,alt,"url":coalesce(asset->url,image.asset->url,file.asset->url,url,externalUrl,videoUrl),"mimeType":coalesce(asset->mimeType,file.asset->mimeType),"poster":poster.asset->url';
const query = '{"projects":*[_type in ["work","portfolioProject","project","portfolioItem","caseStudy"] && !(_id in path("drafts.**"))] | order(coalesce(order,priority,999) asc,_id asc){_id,_type,title,name,category,group,type,hidden,order,summary,description,text,client,role,year,"coverUrl":coalesce(cover.asset->url,coverImage.asset->url,image.asset->url),"singleMedia":select(_type=="work"=>media{'+projection+'}),"media":select(_type!="work"=>media[]{'+projection+'}),"gallery":gallery[]{'+projection+'},"images":images[]{'+projection+'},"files":files[]{'+projection+'},"audio":audio[]{'+projection+'},"videos":videos[]{'+projection+'},videoUrl},"settings":*[_type in ["siteSettings","portfolioSettings"]][0]{name,headline,tagline,about,contactEmail,"heroImage":heroImage.asset->url,socials[]{label,url}}}';
function text(v){return typeof v==='string'?v.trim():'';}
function safeUrl(v){try{const u=new URL(v);return u.protocol==='https:'?u.href:'';}catch{return '';}}
function category(v){const aliases={plans:'content',reels:'video',photography:'photo'};return categories.includes(v)?v:aliases[v]||'';}
function media(v,hint){
 if(!v)return null;const x=typeof v==='string'?{url:v}:v;const url=safeUrl(x.url);if(!url)return null;
 const kind=x.kind||x.mimeType||hint||x._type||'';
 const type=/audio/i.test(kind)||/\.(mp3|wav|m4a|aac|ogg)([?#]|$)/i.test(url)?'audio':/pdf/i.test(kind)||/\.pdf([?#]|$)/i.test(url)?'pdf':/document|word/i.test(kind)||/\.docx?([?#]|$)/i.test(url)?'document':/video/i.test(kind)||/\.(mp4|webm|mov|m4v)([?#]|$)/i.test(url)||/youtu|vimeo/.test(new URL(url).hostname)?'video':'image';
 return {url,type,title:text(x.caption||x.title||x.alt),poster:safeUrl(x.poster)};
}
function normalize(p){
 const items=[];
 for(const [values,hint] of [[p.singleMedia,p.type],[p.media,''],[p.gallery,''],[p.images,'image'],[p.files,'document'],[p.audio,'audio'],[p.videos,'video'],[p.videoUrl,'video']]){
  for(const x of Array.isArray(values)?values:[values]){const m=media(x,hint);if(m&&!items.some(i=>i.url===m.url))items.push(m);}
 }
 if(!items.length&&p.coverUrl)items.push(media({url:p.coverUrl},'image'));
 return {id:p._id,title:text(p.title||p.name),category:category(p.category),group:text(p.group),summary:text(p.summary||p.description),text:text(p.text),client:text(p.client),role:text(p.role),year:text(p.year),cover:safeUrl(p.coverUrl)||items.find(m=>m?.type==='image')?.url||'',media:items.filter(Boolean),hidden:p.hidden===true};
}
function assemble(raw={}){
 const projects=(Array.isArray(raw.projects)?raw.projects:[]).filter(p=>p.hidden!==true).map(normalize).filter(p=>p.title&&p.category);
 const s=raw.settings||{};
 return {projects,count:projects.length,mediaLibrary:[],settings:{name:text(s.name),headline:text(s.headline),tagline:text(s.tagline),about:text(s.about),heroImage:safeUrl(s.heroImage),contactEmail:/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s.contactEmail||'')?s.contactEmail:'',socials:s.socials||[]}};
}
async function handler(req,res){
 if(req.method!=='GET'){res.setHeader('Allow','GET');return res.status(405).json({error:'Method not allowed'});}
 let raw={},sourceStatus='unavailable';
 if(/^[a-z0-9]+$/.test(projectId)&&/^[a-z0-9][a-z0-9_-]*$/.test(dataset)){
  const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),9000);
  try{
   const endpoint=new URL('https://'+projectId+'.api.sanity.io/v2025-02-19/data/query/'+dataset);endpoint.searchParams.set('query',query);
   const headers={Accept:'application/json'};if(process.env.SANITY_READ_TOKEN)headers.Authorization='Bearer '+process.env.SANITY_READ_TOKEN;
   const response=await fetch(endpoint,{headers,signal:controller.signal});if(!response.ok)throw Error('Sanity HTTP '+response.status);
   const payload=await response.json();if(payload.error)throw Error('Sanity query failed');raw=payload.result||{};sourceStatus='connected';
  }catch(e){console.error('Portfolio content:',e.message);}finally{clearTimeout(timer);}
 }
 res.setHeader('Cache-Control',sourceStatus==='connected'?'s-maxage=30,stale-while-revalidate=120':'no-store');
 if(sourceStatus!=='connected')return res.status(503).json({error:'The portfolio is temporarily unavailable.'});
 return res.status(200).json({...assemble(raw),sourceStatus});
}
module.exports=handler;
module.exports.assemble=assemble;
module.exports.query=query;
