const active=new Map(),listeners=new Set()
const key=id=>String(id||'').replace(/^drafts\./,'')
const notify=()=>listeners.forEach(fn=>fn())
export const subscribeUploads=fn=>{listeners.add(fn);return()=>listeners.delete(fn)}
export const hasUploads=id=>(active.get(key(id))||0)>0
export function beginUpload(id){const k=key(id);active.set(k,(active.get(k)||0)+1);notify();let done=false;return()=>{if(done)return;done=true;const count=(active.get(k)||1)-1;if(count)active.set(k,count);else active.delete(k);notify()}}
