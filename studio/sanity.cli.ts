import {defineCliConfig} from 'sanity/cli'

export default defineCliConfig({
  api: {
    projectId: 'euoc7nal',
    dataset: 'production'
  },
  deployment: {
    autoUpdates: true,
    appId: 'k1t301xh21j1m0yrcbccoyk9',
  }
})
