export function LocalizedInput(props){
 const english=String(props.path?.at(-1)||'').endsWith('En')
 const direction=english?'ltr':'rtl'
 return props.renderDefault({...props,elementProps:{
  ...props.elementProps,
  dir:direction,
  lang:english?'en':'ar',
  style:{...props.elementProps?.style,direction,textAlign:english?'left':'right',fontFamily:'Alexandria, Tahoma, sans-serif'}
 }})
}
