import { toast } from './packages/state'
import Toaster from './packages/Toaster.vue'

/**
 * VueSonner plugin for Vue 3
 * 
 * - Globally registers the `<Toaster />` component
 * - Adds `$toast` to all component instances for use in Options API
 * - Provides `toast` via Vue's dependency injection system (Composition API)
 *
 * @example
 * // main.ts or main.js (ESM)
 * import { createApp } from 'vue'
 * import App from './App.vue'
 * import VueSonner from 'vue-sonner'
 * 
 * const app = createApp(App)
 * app.use(VueSonner)
 * app.mount('#app')
 *
 * @example
 * // index.html (UMD / CDN build)
 * <script src="https://unpkg.com/vue@3"></script>
 * <script src="https://unpkg.com/vue-sonner"></script>
 * <script>
 *   const app = Vue.createApp({})
 *   app.use(VueSonner)
 *   app.mount('#app')
 *
 *   // Later in a component:
 *   app.config.globalProperties.$toast.success('Hello from UMD!')
 * </script>
 *
 * @example
 * // Inside a component (Options API)
 * this.$toast.success('Message sent!')
 *
 * @example
 * // Inside a setup() function (Composition API)
 * import { inject } from 'vue'
 * const toast = inject('toast')
 * toast?.error('Something went wrong!')
 */
const VueSonner = {
  /**
   * Install function used by Vue.use()
   * @param {App} app - The Vue application instance
   */
  install(app) {
    // Make $toast globally available in Options API
    app.config.globalProperties.$toast = toast

    // Register the <Toaster /> component globally
    app.component('Toaster', Toaster)

    // Provide toast for Composition API usage
    app.provide('toast', toast)
  }
}

// UMD-friendly single export for Vue.use(VueSonner)
export default VueSonner
