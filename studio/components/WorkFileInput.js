import React, {useEffect, useRef, useState} from 'react'
import {PatchEvent, set, unset, useClient, useFormValue} from 'sanity'
import {beginUpload} from '../uploadState.js'

// Keep upload status local. Only the finished asset reference enters the document.
export function WorkFileInput(props){return AssetInput(props,'file')}
export function WorkCoverInput(props){return AssetInput(props,'image')}
function AssetInput({value,onChange,readOnly,elementProps},kind) {
 const client=useClient({apiVersion:'2025-02-19'}),picker=useRef(null),lock=useRef(false),mounted=useRef(true)
 const documentId=useFormValue(['_id']),image=kind==='image'
 const [busy,setBusy]=useState(false),[error,setError]=useState(''),[asset,setAsset]=useState(null)
 useEffect(()=>{mounted.current=true;return()=>{mounted.current=false}},[])
 const reference=value?.asset?._ref
 useEffect(()=>{let current=true;setAsset(null);if(reference)client.getDocument(reference).then(doc=>{if(current)setAsset(doc)}).catch(()=>{});return()=>{current=false}},[client,reference])
 async function upload(event){
  const file=event.target.files?.[0];event.target.value='';if(!file||readOnly||lock.current)return
  if(!file.size){setError('الملف فارغ. اختاري ملفًا آخر.');return}
  if(image&&(!/\.(jpe?g|png|webp)$/i.test(file.name)||file.size>10*1024*1024)){setError('الغلاف: اختاري صورة JPG أو PNG أو WebP، بحجم لا يزيد عن 10 ميجابايت.');return}
  if(!image&&!/\.(pdf|docx?|mp4|mov|webm|m4v|mp3|wav|m4a|aac|ogg|flac|jpe?g|png|webp|gif|avif)$/i.test(file.name)){setError('اختاري PDF أو Word أو صورة أو ملف فيديو أو صوت بصيغة شائعة.');return}
  lock.current=true;const finish=beginUpload(documentId)
  setBusy(true);setError('')
  try{
   const uploaded=await client.assets.upload(kind,file,{filename:file.name})
   if(!mounted.current)return
   onChange(PatchEvent.from(set({_type:kind,asset:{_type:'reference',_ref:uploaded._id}})))
   setAsset(uploaded)
  }catch{if(mounted.current)setError('تعذر الرفع. تأكدي من اتصال الإنترنت وصلاحية الحساب، ثم جرّبي مرة أخرى. الملف السابق محفوظ.')}
  finally{finish();lock.current=false;if(mounted.current)setBusy(false)}
 }
 const buttonStyle={border:'1px solid #8e79b9',borderRadius:8,padding:'11px 16px',background:'#34264c',color:'#fff',cursor:'pointer',font:'inherit',minHeight:44}
 return React.createElement('div',{dir:'rtl',style:{border:'1px solid #55505f',borderRadius:10,padding:18,lineHeight:1.9}},
  image&&React.createElement('p',{style:{fontSize:13,margin:'0 0 14px',lineHeight:1.9}},'غلاف الكارت لكل أنواع الأعمال. المقاس المقترح 1600 × 1200 بكسل، بنسبة 4:3. ضعي العنصر المهم في المنتصف، مع مسافة حول الكلام. JPG أو PNG أو WebP؛ بحد أقصى 10 ميجابايت.'),
  image&&asset?.url&&React.createElement('img',{src:asset.url+'?w=640&h=480&fit=crop&auto=format',alt:'معاينة غلاف الكارت',style:{display:'block',width:'100%',maxWidth:480,aspectRatio:'4/3',objectFit:'cover',borderRadius:10,marginBottom:16}}),
  image&&asset?.metadata?.dimensions&&React.createElement('p',{style:{fontSize:12,margin:'0 0 14px'}},'مقاس الصورة الحالية: '+asset.metadata.dimensions.width+' × '+asset.metadata.dimensions.height+' بكسل.'),
  React.createElement('input',{ref:picker,type:'file',accept:image?'image/jpeg,image/png,image/webp':'.pdf,.doc,.docx,image/*,video/*,audio/*',onChange:upload,disabled:busy||readOnly,style:{display:'none'}}),
  React.createElement('button',{...elementProps,type:'button',disabled:busy||readOnly,onClick:()=>picker.current?.click(),style:buttonStyle},busy?'جارٍ الرفع…':reference?image?'استبدال الغلاف':'استبدال الملف':image?'اختيار غلاف ورفعه':'اختيار ملف ورفعه'),
  React.createElement('p',{role:'status','aria-live':'polite',style:{fontSize:13,margin:'12px 0 0'}},busy?'انتظري اكتمال الرفع قبل النشر أو مغادرة الصفحة.':reference?'تم الرفع ✓ '+(asset?.originalFilename||''):image?'اختياري: لو لم تضيفي غلافًا، سيستخدم الموقع المعاينة التلقائية.':'PDF، صور، فيديو، صوت أو مستند Word.'),
  error&&React.createElement('p',{role:'alert',style:{color:'#ffb6bc',fontSize:13}},error),
  reference&&React.createElement('div',{style:{display:'flex',alignItems:'center',gap:18,marginTop:12}},
   asset?.url&&React.createElement('a',{href:asset.url,target:'_blank',rel:'noopener noreferrer',style:{color:'#d5b5ff'}},'فتح الملف ↗'),
   React.createElement('button',{type:'button',disabled:busy||readOnly,onClick:()=>onChange(PatchEvent.from(unset())),style:{...buttonStyle,background:'transparent',fontSize:12}},image?'إزالة الغلاف فقط':'إزالة الملف من العمل')),
 )
}
