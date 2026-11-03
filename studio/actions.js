import {useSyncExternalStore} from 'react'
import {subscribeUploads,hasUploads} from './uploadState.js'
const wrappers=new WeakMap()
export function withUploadGuard(Action){
 if(wrappers.has(Action))return wrappers.get(Action)
 function GuardedAction(props){
  const busy=useSyncExternalStore(subscribeUploads,()=>hasUploads(props.id),()=>false)
  const action=Action(props)
  return action?{...action,label:busy?'انتظري اكتمال الرفع…':'نشر التعديلات',disabled:action.disabled||busy,title:busy?'انتظري اكتمال رفع الملفات قبل النشر.':action.title}:null
 }
 GuardedAction.action=Action.action
 wrappers.set(Action,GuardedAction)
 return GuardedAction
}
