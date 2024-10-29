import { Toaster, toast } from 'vue-sonner'
import { defineNuxtPlugin } from 'nuxt/app'

import type { NuxtApp } from 'nuxt/app'

export default defineNuxtPlugin((nuxtApp: NuxtApp) => {
  nuxtApp.vueApp.component('Toaster', Toaster)

  return {
    provide: {
      toast
    }
  }
})
