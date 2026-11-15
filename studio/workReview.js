import {validateGroup,validateLocalized,validateMedia} from './validation.js'

const has=v=>typeof v==='string'&&v.trim().length>=2

// Shared, read-only guidance for the form and Publish button.
// The built-in Sanity validation continues to be the final authority.
export function reviewWork(document={}){
 const d=document||{},legacy=!!(d.importedFromDrive||d.sourceDriveId)
 const errors=[],warnings=[]
 const error=(code,message)=>errors.push({code,message})
 const warning=(code,message)=>warnings.push({code,message})
 if(!d.category)error('category','اختاري القسم الرئيسي الذي يظهر فيه العمل.')
 if(validateGroup(d.group,d)!==true)warning('group','القسم الفرعي لا يناسب القسم الرئيسي؛ يُفضّل تغييره أو مسحه قبل النشر.')
 for(const [key,label] of [['titleAr','العنوان بالعربية'],['titleEn','العنوان بالإنجليزية']]){
  if(validateLocalized(d[key],d,key)!==true)error(key,'اكتبي '+label+' (حرفين على الأقل).')
  else if(!has(d[key]))warning(key,'يُفضّل إضافة '+label+' بدل العنوان القديم.')
 }
 for(const [key,label] of [['summaryAr','الوصف بالعربية'],['summaryEn','الوصف بالإنجليزية']]){
  if(validateLocalized(d[key],d,key)!==true)error(key,'اكتبي '+label+' (سطر أو سطرين).')
  else if(!has(d[key]))warning(key,'محتاج '+label+' لتظهر معلومات كاملة للزائر.')
 }
 if(validateMedia(d.media,d)!==true)error('media','ارفعي ملف العمل الأصلي أو اكتبي السكريبت الكامل. صورة غلاف الكارت وحدها لا تكفي للفيديو.')
 if(legacy&&!d.media?.asset?._ref&&d.sourceDriveUrl)warning('drive','الملف الأصلي ما زال على Google Drive؛ تعديل البيانات ممكن، والرفع لـSanity اختياري.')
 if(!d.cardCover?.asset?._ref&&!d.cover?.asset?._ref)
  warning('cover','غلاف الكارت اختياري؛ يمكن رفع صورة مستقلة عنه من خانة «صورة غلاف الكارت الخارجي».')
 if(d.hidden)warning('hidden','العمل مخفي من الموقع حتى بعد الضغط على «نشر».')
 return {errors,warnings,ready:errors.length===0}
}
