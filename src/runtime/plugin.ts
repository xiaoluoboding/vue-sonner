import { toast } from '../packages'
import { defineNuxtPlugin } from 'nuxt/app'

export default defineNuxtPlugin(() => {
  return {
    provide: {
      toast
    }
  }
})
