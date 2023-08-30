import type { Plugin } from 'vue'
import { Toaster } from './component'
import type { ToasterProps } from './component'
import { toast } from './state'

export { Toaster, toast, ToasterProps }

const plugin: Plugin = {
  install(app) {
    app.component('Toaster', Toaster)
  }
}

export default plugin
