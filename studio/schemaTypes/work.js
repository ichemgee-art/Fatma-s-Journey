import {defineField, defineType} from 'sanity'

// Compatible with the existing 130 imported work documents.
export const work = defineType({
 name:'work',title:'Portfolio work',type:'document',
 fields:[
  defineField({name:'title',type:'string',title:'Title',validation:r=>r.required()}),
  defineField({name:'category',type:'string',title:'Category',options:{list:[{title:'Content Creation',value:'content'},{title:'Photography',value:'photo'},{title:'Voice Over',value:'voice'},{title:'Videos',value:'video'},{title:'Dubbing',value:'dubbing'},{title:'AI Content',value:'ai'}]},validation:r=>r.required()}),
  defineField({name:'group',type:'string',title:'Section',description:'Content plans, scripts, Reels, Advertising, Ai Designs, Ai Videos, Ai Videos / Engineering, or Ai Songs.'}),
  defineField({name:'type',type:'string',title:'File type',options:{list:['image','video','audio','pdf','document']},validation:r=>r.required()}),
  defineField({name:'cover',type:'image',title:'Cover / video poster',options:{hotspot:true}}),
  defineField({name:'media',type:'file',title:'Original file'}),
  defineField({name:'text',type:'text',title:'Script / document text',rows:15}),
  defineField({name:'summary',type:'text',title:'Short description',rows:3}),
  defineField({name:'order',type:'number',title:'Order (lower first)'}),
  defineField({name:'hidden',type:'boolean',title:'Hide from portfolio',initialValue:false}),
 ],
 orderings:[{title:'Portfolio order',name:'portfolioOrder',by:[{field:'order',direction:'asc'}]}],
 preview:{select:{title:'title',subtitle:'category',media:'cover'}},
})
