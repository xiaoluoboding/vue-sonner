import { toast } from 'vue-sonner'
import { defineNuxtPlugin } from 'nuxt/app'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.provide('toast', toast)
})
