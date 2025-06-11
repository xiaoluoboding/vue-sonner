import { toast } from 'vue-sonner'
import { defineNuxtPlugin } from 'nuxt/app'

export default defineNuxtPlugin(() => {
  nuxtApp.provide('toast', toast)
})
