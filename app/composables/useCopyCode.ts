import { useClipboard } from '@vueuse/core'
import type { Ref } from 'vue'

type CopyCodeParams = {
  code: string
  checkIconRef: Ref<boolean>
}

export const useCopyCode = async ({ code, checkIconRef }: CopyCodeParams) => {
  const { copy } = useClipboard({
    source: code
  })

  checkIconRef.value = false
  await copy(code)
  checkIconRef.value = true

  setTimeout(() => {
    checkIconRef.value = false
  }, 1500)
}
