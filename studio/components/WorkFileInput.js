import React, {useEffect, useRef, useState} from 'react'
import {PatchEvent, set, unset, useClient} from 'sanity'

// Keep upload status local. Only the finished asset reference enters the document.
export function WorkFileInput({value,onChange,readOnly,elementProps}) {
 const client=useClient({apiVersion:'2025-02-19'}),picker=useRef(null)
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),[asset,setAsset]=useState(null)
 const reference=value?.asset?._ref
 useEffect(()=>{let current=true;setAsset(null);if(reference)client.getDocument(reference).then(doc=>{if(current)setAsset(doc)}).catch(()=>{});return()=>{current=false}},[client,reference])
 async function upload(event){
  const file=event.target.files?.[0];event.target.value='';if(!file||readOnly||busy)return
  setBusy(true);setError('')
  try{
   const uploaded=await client.assets.upload('file',file,{filename:file.name})
   onChange(PatchEvent.from(set({_type:'file',asset:{_type:'reference',_ref:uploaded._id}})))
   setAsset(uploaded)
  }catch{setError('تعذر رفع الملف. تأكد من اتصال الإنترنت ثم جرّب مرة أخرى. الملف السابق محفوظ.')}
  finally{setBusy(false)}
 }
 const buttonStyle={border:'1px solid #8e79b9',borderRadius:8,padding:'11px 16px',background:'#34264c',color:'#fff',cursor:'pointer',font:'inherit',minHeight:44}
 return React.createElement('div',{dir:'rtl',style:{border:'1px solid #55505f',borderRadius:10,padding:18,lineHeight:1.9}},
  React.createElement('input',{ref:picker,type:'file',onChange:upload,disabled:busy||readOnly,style:{display:'none'}}),
  React.createElement('button',{...elementProps,type:'button',disabled:busy||readOnly,onClick:()=>picker.current?.click(),style:buttonStyle},busy?'جارٍ رفع الملف…':reference?'استبدال الملف':'اختيار ملف ورفعه'),
  React.createElement('p',{role:'status','aria-live':'polite',style:{fontSize:13,margin:'12px 0 0'}},busy?'انتظر اكتمال الرفع قبل مغادرة الصفحة.':reference?'الملف مرفوع ✓ '+(asset?.originalFilename||''):'PDF، صور، فيديو، صوت أو مستند Word.'),
  error&&React.createElement('p',{role:'alert',style:{color:'#ffb6bc',fontSize:13}},error),
  reference&&React.createElement('div',{style:{display:'flex',alignItems:'center',gap:18,marginTop:12}},
   asset?.url&&React.createElement('a',{href:asset.url,target:'_blank',rel:'noopener noreferrer',style:{color:'#d5b5ff'}},'فتح الملف ↗'),
   React.createElement('button',{type:'button',disabled:busy||readOnly,onClick:()=>onChange(PatchEvent.from(unset())),style:{...buttonStyle,background:'transparent',fontSize:12}},'إزالة الملف من العمل')),
 )
}
