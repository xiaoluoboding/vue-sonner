import { toast } from './packages/state'
import Toaster from './packages/Toaster.vue'

/**
 * VueSonner plugin for Vue 3
 *
 * - Globally registers the `<Toaster />` component
 * - Adds `$toast` to all component instances (Options API)
 * - Provides `toast` via Vue’s dependency injection (Composition API)
 * - Automatically exposes `window.toast` in UMD builds for use in plain JS
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
 *   // Toast usage anywhere (even outside Vue)
 *   toast.success('This works globally!')
 * </script>
 *
 * @example
 * // Inside a Vue component (Options API)
 * this.$toast.success('Message sent!')
 *
 * @example
 * // Inside a Vue component (Composition API)
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

    // assign toast to window
    if (typeof window !== 'undefined') {
      window.toast = toast
    }
  }
}

// UMD-friendly single export for Vue.use(VueSonner)
export default VueSonner
