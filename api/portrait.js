/* Serve the published Sanity portrait as the FIRST image request.
 * A redirect avoids flashing an obsolete hardcoded JPG during hydration. */
const projectId=process.env.SANITY_PROJECT_ID||'q3zqgei4';
const dataset=process.env.SANITY_DATASET||'production';
const fallback='/assets/fatma-eltaweel.jpg';
const query='*[_type in ["siteSettings","portfolioSettings"] && !(_id in path("drafts.**")) && !(_id in path("versions.**"))] | order(_updatedAt desc,_id asc)[0]{"heroImage":heroImage.asset->url,"aboutImage":aboutImage.asset->url}';

module.exports=async function portrait(req,res){
 if(req.method!=='GET'){
  res.setHeader('Allow','GET');
  return res.status(405).end();
 }
 const key=new URL(req.url||'/','https://portfolio.local').searchParams.get('key');
 if(key!=='heroImage'&&key!=='aboutImage')return res.status(400).end('Invalid image key');
 let location=fallback;
 if(/^[a-z0-9]+$/.test(projectId)&&/^[a-z0-9][a-z0-9_-]*$/.test(dataset)){
  const controller=new AbortController();
  const timer=setTimeout(()=>controller.abort(),6000);
  try{
   const endpoint=new URL('https://'+projectId+'.api.sanity.io/v2025-02-19/data/query/'+dataset);
   endpoint.searchParams.set('query',query);
   const headers={Accept:'application/json'};
   if(process.env.SANITY_READ_TOKEN)headers.Authorization='Bearer '+process.env.SANITY_READ_TOKEN;
   const response=await fetch(endpoint,{headers,signal:controller.signal});
   if(!response.ok)throw Error('Sanity response '+response.status);
   const result=(await response.json()).result||{};
   const candidate=result[key];
   if(typeof candidate==='string'){
    const url=new URL(candidate);
    if(url.protocol==='https:'&&url.hostname==='cdn.sanity.io'&&url.pathname.startsWith('/images/')){
     url.searchParams.set('w','1000');
     url.searchParams.set('q','82');
     url.searchParams.set('auto','format');
     location=url.toString();
    }
   }
  }catch(error){
   console.error('Sanity portrait:',error?.message||'Failed to load portrait');
  }finally{clearTimeout(timer);}
 }
 // The published image is reused briefly; replacing it in Sanity yields a new asset URL.
 res.setHeader('Cache-Control',location===fallback?'no-store':'public, max-age=120, s-maxage=120, stale-while-revalidate=180');
 res.setHeader('Location',location);
 return res.status(302).end();
};
