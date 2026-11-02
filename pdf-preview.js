(()=>{
 let library;const pending=[],cache=new Map();let active=0;
 const prepared=new Set(['1asnYxL5Ns6UDgtnENtDEMzILLpRJ0Ryt','1rBCtVQGzhLAVWvYGj7i0KGLOheL_Rhvd','1orkSTjBWfLa9461sFjxhbN5ofPa21gwi']);
 const base='https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.10.38/';
 const load=()=>library||(library=import(base+'pdf.min.mjs').then(pdf=>{pdf.GlobalWorkerOptions.workerSrc=base+'pdf.worker.min.mjs';return pdf;}));
 async function pdfSource(pdf,source){
  const asset=new URL(source).pathname.split('/').pop();
  const chunk=async(begin,end)=>{const response=await fetch('/api/pdf?asset='+encodeURIComponent(asset)+'&start='+begin+'&end='+end);if(!response.ok)throw Error('PDF unavailable');return {data:new Uint8Array(await response.arrayBuffer()),length:Number(response.headers.get('x-pdf-length'))};};
  const initial=await chunk(0,65535);if(!initial.length)throw Error('Invalid PDF');
  if(initial.data.length>=initial.length)return {data:initial.data};
  const transport=new pdf.PDFDataRangeTransport(initial.length,initial.data);let loading;
  transport.requestDataRange=async(begin,end)=>{try{const data=new Uint8Array(end-begin);for(let offset=begin;offset<end;offset+=1048576){const part=await chunk(offset,Math.min(end,offset+1048576)-1);data.set(part.data,offset-begin);}transport.onDataRange(begin,data);}catch{loading?.destroy();}};
  return {range:transport,disableAutoFetch:true,disableStream:true,setTask:task=>{loading=task;}};
 }
 async function pageImage(source,width){
  const key=source+'|'+width;if(cache.has(key))return cache.get(key);
  const task=(async()=>{const pdf=await load();let document;
   try{const options=await pdfSource(pdf,source),task=pdf.getDocument({...options,isEvalSupported:false,cMapUrl:'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/cmaps/',cMapPacked:true,standardFontDataUrl:'https://cdn.jsdelivr.net/npm/pdfjs-dist@4.10.38/standard_fonts/'});options.setTask?.(task);document=await task.promise;
    const page=await document.getPage(1),original=page.getViewport({scale:1}),viewport=page.getViewport({scale:Math.min(width/original.width,2)}),canvas=window.document.createElement('canvas');
    canvas.width=Math.ceil(viewport.width);canvas.height=Math.ceil(viewport.height);
    await page.render({canvasContext:canvas.getContext('2d'),viewport}).promise;
    return canvas.toDataURL('image/webp',.88);
   }finally{if(document)await document.destroy();}
  })();cache.set(key,task);task.catch(()=>cache.delete(key));if(cache.size>32)cache.delete(cache.keys().next().value);return task;
 }
 function run(){while(active<2&&pending.length){const work=pending.shift();if(!work.host.isConnected)continue;active++;work.render().finally(()=>{active--;run();});}}
 const observer='IntersectionObserver'in window?new IntersectionObserver(entries=>{for(const entry of entries)if(entry.isIntersecting){observer.unobserve(entry.target);pending.push(entry.target.pdfWork);run();}},{rootMargin:'120px'}):null;
 window.createPDFPreview=(media,title,cover='',large=false)=>{
  const local=media.provider==='drive'&&prepared.has(media.driveId)?'/assets/pdf/'+media.driveId+'.jpg':'';if(local)cover=local;
  const host=document.createElement('div');host.className='pdf-first-page';host.setAttribute('role','img');host.setAttribute('aria-label',title);
  const image=document.createElement('img');image.alt='';image.decoding='async';host.append(image);
  const placeholder=document.createElement('span');placeholder.className='pdf-placeholder';placeholder.textContent='PDF';placeholder.setAttribute('aria-hidden','true');host.append(placeholder);
  const label=document.createElement('span');label.className='pdf-page-label';label.textContent='01';label.setAttribute('aria-hidden','true');host.append(label);
  const show=source=>new Promise((resolve,reject)=>{image.onload=()=>{host.classList.add('is-ready');resolve();};image.onerror=()=>reject(Error('Preview unavailable'));image.src=source;});
  if(cover)show(cover).catch(()=>{});
  const render=async()=>{try{
   if(local)await show(local);
   else if(media.provider==='drive'&&/^[\w-]+$/.test(media.driveId||''))await show('https://drive.google.com/thumbnail?id='+encodeURIComponent(media.driveId)+'&sz=w'+(large?1200:640));
   else if(/^https:\/\/cdn\.sanity\.io\/files\//.test(media.url))await show(await pageImage(media.url,large?1200:600));
  }catch{host.classList.add('preview-unavailable');}};
  host.pdfWork={host,render};if(observer)observer.observe(host);else{pending.push(host.pdfWork);setTimeout(run,0);}return host;
 };
})();