import type { Plugin } from 'vue'
import type { ToasterProps } from './types'
import { Toaster } from './component'
import { toast } from './state'

export { Toaster, toast, type ToasterProps }

const plugin: Plugin = {
  install(app) {
    app.component('Toaster', Toaster)
  }
}

export default plugin
