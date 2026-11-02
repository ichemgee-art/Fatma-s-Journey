import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {portfolioProject, legacyProject, siteSettings, portfolioMedia} from './schemaTypes/index.js'

export default defineConfig({
  name: 'fatma-portfolio',
  title: 'Fatma — Portfolio Studio',
  projectId: 'q3zqgei4',
  dataset: 'production',
  plugins: [structureTool(), visionTool()],
  schema: {types: [portfolioProject, legacyProject, portfolioMedia, siteSettings]},
})
