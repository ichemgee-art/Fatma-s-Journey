import {useSyncExternalStore} from 'react'
import {subscribeUploads,hasUploads} from './uploadState.js'
import {reviewWork} from './workReview.js'

const wrappers=new WeakMap()
export function withUploadGuard(Action){
 if(wrappers.has(Action))return wrappers.get(Action)
 function GuardedAction(props){
  const busy=useSyncExternalStore(subscribeUploads,()=>hasUploads(props.id),()=>false)
  const current=props.draft||props.published||{}
  const issues=props.type==='work'?reviewWork(current):{errors:[]}
  const action=Action(props)
  if(!action)return null
  const hasErrors=issues.errors.length>0
  return {...action,
   label:busy?'جارٍ رفع الملفات…':hasErrors?'راجعي الأخطاء قبل النشر':'نشر على الموقع',
   disabled:action.disabled||busy||hasErrors,
   title:busy?'انتظري اكتمال رفع الملف الأصلي أو غلاف الكارت ثم انشري.'
    :hasErrors?issues.errors.map(x=>x.message).join(' | ')
    :'حفظ التعديلات المنشورة وإظهارها للزوار بعد انتهاء التحقق.'
  }
 }
 GuardedAction.action=Action.action
 wrappers.set(Action,GuardedAction)
 return GuardedAction
}
export function renameDangerAction(Action){
 if(wrappers.has(Action))return wrappers.get(Action)
 function ClearAction(props){
  const action=Action(props)
  if(!action)return null
  const name=Action.action
  const titles={
   delete:['حذف العمل نهائيًا','تحذير: حذف هذا المستند نهائيًا. هتظهر رسالة تأكيد من Sanity قبل الحذف. يُفضّل استخدام «إخفاء العمل» بدلًا منه.'],
   unpublish:['إلغاء نشر العمل','إلغاء النشر يخفي العمل من الموقع، لكن لا يحذف الملفات من Sanity.'],
   discardChanges:['التراجع عن تعديلات المسودة','إلغاء التعديلات غير المنشورة فقط، دون حذف النسخة المنشورة.']
  }
  const info=titles[name]
  return info?{...action,label:info[0],title:info[1]}:action
 }
 ClearAction.action=Action.action
 wrappers.set(Action,ClearAction)
 return ClearAction
}
