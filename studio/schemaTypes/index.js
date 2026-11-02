import {defineField, defineType} from 'sanity'

const categories = [
  {title:'Content Plans', value:'plans'},
  {title:'Voice Over', value:'voice'},
  {title:'Dubbing', value:'dubbing'},
  {title:'AI Content', value:'ai'},
  {title:'Reels', value:'reels'},
  {title:'Photography', value:'photo'},
]
const mediaItem = defineType({
 name:'portfolioMedia',title:'Gallery media',type:'object',
 fields:[
  defineField({name:'kind',title:'Media kind',type:'string',options:{list:[{title:'Image',value:'image'},{title:'Video file',value:'video'},{title:'External video link',value:'external'}]},initialValue:'image',validation:r=>r.required()}),
  defineField({name:'image',title:'Image',type:'image',options:{hotspot:true},hidden:({parent})=>parent?.kind!=='image'}),
  defineField({name:'file',title:'Video file (MP4 / WEBM)',type:'file',options:{accept:'video/*'},hidden:({parent})=>parent?.kind!=='video'}),
  defineField({name:'url',title:'YouTube, Vimeo or HTTPS media URL',type:'url',hidden:({parent})=>parent?.kind!=='external'}),
  defineField({name:'poster',title:'Video poster image',type:'image',hidden:({parent})=>parent?.kind==='image'}),
  defineField({name:'caption',title:'Caption / accessible description',type:'string'}),
 ],
 preview:{select:{title:'caption',subtitle:'kind',media:'image'}}
})
function projectType(name,title){return defineType({
 name,title,type:'document',
 groups:[{name:'main',title:'Overview'},{name:'gallery',title:'Media'},{name:'meta',title:'Details'}],
 fields:[
  defineField({name:'title',title:'Project title',type:'string',group:'main',validation:r=>r.required().min(2)}),
  defineField({name:'slug',title:'URL slug',type:'slug',options:{source:'title',maxLength:90},group:'main'}),
  defineField({name:'category',title:'Category',type:'string',options:{list:categories,layout:'dropdown'},group:'main',validation:r=>r.required()}),
  defineField({name:'summary',title:'Short description',type:'text',rows:4,group:'main'}),
  defineField({name:'cover',title:'Project cover image',type:'image',options:{hotspot:true},group:'gallery'}),
  defineField({name:'gallery',title:'All photos, videos and media',type:'array',of:[{type:'portfolioMedia'},{type:'image',options:{hotspot:true}}],group:'gallery'}),
  defineField({name:'images',title:'Extra image gallery (batch upload)',type:'array',of:[{type:'image'}],group:'gallery'}),
  defineField({name:'videoUrl',title:'Main video URL (YouTube / Vimeo / MP4)',type:'url',group:'gallery'}),
  defineField({name:'client',title:'Client (optional)',type:'string',group:'meta'}),
  defineField({name:'role',title:'Fatma’s role',type:'string',group:'meta'}),
  defineField({name:'year',title:'Year',type:'string',group:'meta'}),
  defineField({name:'order',title:'Sort order (lower first)',type:'number',group:'meta',initialValue:10}),
  defineField({name:'featured',title:'Feature this project',type:'boolean',group:'meta',initialValue:false}),
 ],
 preview:{select:{title:'title',subtitle:'category',media:'cover'}}
})}
export const portfolioProject=projectType('portfolioProject','Portfolio project')
export const legacyProject=projectType('project','Project (compatible)')
export const siteSettings=defineType({name:'siteSettings',title:'Portfolio settings',type:'document',fields:[
 defineField({name:'name',title:'Display name',type:'string',initialValue:'Fatma'}),
 defineField({name:'headline',title:'Main headline',type:'string',initialValue:'Ideas into Impact.'}),
 defineField({name:'tagline',title:'Tagline',type:'string'}),
 defineField({name:'about',title:'About Fatma',type:'text',rows:7}),
 defineField({name:'heroImage',title:'Homepage hero image',type:'image',options:{hotspot:true}}),
 defineField({name:'contactEmail',title:'Public professional contact email',type:'email'}),
 defineField({name:'socials',title:'Social links',type:'array',of:[{type:'object',fields:[defineField({name:'label',type:'string',title:'Label'}),defineField({name:'url',type:'url',title:'URL'})]}]})
]})
