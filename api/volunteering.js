const projectId=process.env.SANITY_PROJECT_ID||'q3zqgei4'
const dataset=process.env.SANITY_DATASET||'production'
const query='*[_type=="volunteering" && !(_id in path("drafts.**")) && !(_id in path("versions.**")) && hidden!=true] | order(coalesce(order,0) asc,_createdAt desc,_id asc){_id,roleAr,roleEn,descriptionAr,descriptionEn,pageUrl,"imageUrl":image.asset->url}'
function safeUrl(raw){
 try{const u=new URL(raw);return u.protocol==='https:'?u.href:''}catch{return ''}
}
function makeList(result){
 if(!Array.isArray(result))return []
 return result.map(item=>({
  id:String(item._id||''),
  roleAr:String(item.roleAr||'').trim(),roleEn:String(item.roleEn||'').trim(),
  descriptionAr:String(item.descriptionAr||'').trim(),descriptionEn:String(item.descriptionEn||'').trim(),
  pageUrl:safeUrl(item.pageUrl),imageUrl:safeUrl(item.imageUrl)
 })).filter(item=>item.id&&item.roleAr&&item.roleEn&&item.descriptionAr&&item.descriptionEn&&item.pageUrl&&item.imageUrl)
}
async function handler(req,res){
 if(req.method!=='GET'){res.setHeader('Allow','GET');return res.status(405).json({error:'Method not allowed'})}
 if(!/^[a-z0-9]+$/.test(projectId)||!/^[a-z0-9][a-z0-9_-]*$/.test(dataset))
  return res.status(503).json({error:'Content temporarily unavailable'})
 const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),9000)
 try{
  const endpoint=new URL('https://'+projectId+'.api.sanity.io/v2025-02-19/data/query/'+dataset)
  endpoint.searchParams.set('query',query)
  const headers={Accept:'application/json'}
  if(process.env.SANITY_READ_TOKEN)headers.Authorization='Bearer '+process.env.SANITY_READ_TOKEN
  const response=await fetch(endpoint,{headers,signal:controller.signal})
  if(!response.ok)throw Error('Sanity HTTP '+response.status)
  const payload=await response.json()
  if(payload.error)throw Error('Sanity GROQ request rejected')
  const items=makeList(payload.result)
  res.setHeader('Cache-Control','public, max-age=0, s-maxage=5, must-revalidate')
  return res.status(200).json({volunteering:items})
 }catch(error){
  console.error('Volunteering content:',error?.message||'Unknown Sanity request error')
  res.setHeader('Cache-Control','no-store')
  return res.status(503).json({error:'Content temporarily unavailable'})
 }finally{clearTimeout(timer)}
}
module.exports=handler
module.exports.makeList=makeList
module.exports.query=query
