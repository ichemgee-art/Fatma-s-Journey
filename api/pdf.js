// Read bounded chunks of public PDF assets from this project's CDN.
module.exports=async(req,res)=>{
 if(req.method!=='GET'){res.setHeader('Allow','GET');return res.status(405).end();}
 const q=new URL(req.url,'https://portfolio.local').searchParams,asset=q.get('asset'),start=Number(q.get('start')),end=Number(q.get('end'));
 if(!/^[a-f0-9]{40}\.pdf$/.test(asset||'')||!q.has('start')||!q.has('end')||!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start<0||end<start||end-start>=1048576)return res.status(400).end();
 try{
  const r=await fetch('https://cdn.sanity.io/files/q3zqgei4/production/'+asset,{headers:{Range:'bytes='+start+'-'+end},signal:AbortSignal.timeout(12000)});
  const range=r.headers.get('content-range')?.match(/^bytes (\d+)-(\d+)\/(\d+)$/);
  if(r.status!==206||!range||Number(range[1])!==start||Number(range[2])-start>=1048576){await r.body?.cancel();return res.status(502).end();}
  const body=Buffer.from(await r.arrayBuffer());
  res.setHeader('Content-Type','application/octet-stream');res.setHeader('X-PDF-Length',range[3]);res.setHeader('Cache-Control','public, max-age=31536000, immutable');return res.status(200).end(body);
 }catch{return res.status(502).end();}
};
