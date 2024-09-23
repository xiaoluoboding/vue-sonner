import { ref, watchEffect, type Ref } from 'vue'
import type { ToastT } from './types'
import { ToastState } from './state'

export function useIsDocumentHidden() {
  const isDocumentHidden = ref(false)

  watchEffect(() => {
    const callback = () => {
      isDocumentHidden.value = document.hidden
    }
    document.addEventListener('visibilitychange', callback)
    return () => window.removeEventListener('visibilitychange', callback)
  })

  return {
    isDocumentHidden
  }
}

export function useVueSonner(): {
  activeToasts: Ref<ToastT[]>
} {
  const activeToasts = ref<ToastT[]>([])

  watchEffect((onInvalidate) => {
    const unsubscribe = ToastState.subscribe((toast) => {
      if ('dismiss' in toast && toast.dismiss) {
        return activeToasts.value.filter((t) => t.id !== toast.id)
      }

      const existingToastIndex = activeToasts.value.findIndex(
        (t) => t.id === toast.id
      )
      if (existingToastIndex !== -1) {
        const updatedToasts = [...activeToasts.value]
        updatedToasts[existingToastIndex] = {
          ...updatedToasts[existingToastIndex],
          ...toast
        }

        activeToasts.value = updatedToasts
      } else {
        activeToasts.value = [toast, ...activeToasts.value]
      }
    })

    onInvalidate(() => {
      unsubscribe()
    })
  })

  return {
    activeToasts
  }
}
