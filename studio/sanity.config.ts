import {defineConfig} from 'sanity'
import {structureTool} from 'sanity/structure'
import {visionTool} from '@sanity/vision'
import {codeInput} from '@sanity/code-input'
import {schemaTypes} from './schemaTypes'

export default defineConfig({
  name: 'default',
  title: 'khoitrn.com',

  projectId: 'euoc7nal',
  dataset: 'production',

  plugins: [structureTool(), visionTool(), codeInput()],

  schema: {
    types: schemaTypes,
  },
})
