import { useClipboard } from '@vueuse/core'
import type { Ref } from 'vue'

interface CopyCodeParams {
  code: string
  checkIconRef: Ref<boolean>
}

export async function useCopyCode({ code, checkIconRef }: CopyCodeParams) {
  const { copy } = useClipboard({
    source: code,
  })

  checkIconRef.value = false
  await copy(code)
  checkIconRef.value = true

  setTimeout(() => {
    checkIconRef.value = false
  }, 1500)
}
