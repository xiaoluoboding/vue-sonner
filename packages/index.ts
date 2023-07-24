import type { Plugin } from 'vue'
import { Toaster } from './component'
import { toast } from './state'

export { Toaster, toast }

const plugin: Plugin = {
  install(app) {
    app.component('Toaster', Toaster)
  }
}

export default plugin
