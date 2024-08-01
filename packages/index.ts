import type { Plugin } from 'vue'
import type { ToasterProps, ToastT, ExternalToast, Action, ToastClasses, ToastToDismiss } from './types'
import { Toaster } from './component'
import { toast } from './state'
import { useVueSonner } from './hooks'

export { Toaster, toast, useVueSonner, type ToasterProps, type ToastT, type ExternalToast, type Action, type ToastClasses, type ToastToDismiss  }

const plugin: Plugin = {
  install(app) {
    app.component('Toaster', Toaster)
  },
}

export default plugin
