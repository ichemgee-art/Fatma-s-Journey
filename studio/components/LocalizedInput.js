export function LocalizedInput(props){
 const english=String(props.path?.at(-1)||'').endsWith('En')
 return props.renderDefault({...props,elementProps:{...props.elementProps,dir:english?'ltr':'rtl',lang:english?'en':'ar'}})
}
