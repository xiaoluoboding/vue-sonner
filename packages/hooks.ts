import { ref, watchEffect } from 'vue'

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
    isDocumentHidden,
  }
}
