import { expect, test } from '@playwright/test'
import { toast } from 'vue-sonner'

test('returned ID dismisses a toast with an undefined option ID', () => {
  const requestAnimationFrame = globalThis.requestAnimationFrame
  globalThis.requestAnimationFrame = callback => {
    callback(0)
    return 0
  }

  try {
    const otherId = toast('Keep this toast', { id: 'unrelated-toast' })
    const id = toast('Persistent toast', { id: undefined, duration: Infinity })

    expect(toast.getHistory().at(-1)).toMatchObject({
      id,
      title: 'Persistent toast',
      duration: Infinity,
    })

    toast.dismiss(id)
    expect(toast.getToasts().map(value => value.id)).toContain(otherId)
    expect(toast.getToasts().map(value => value.id)).not.toContain(id)
  } finally {
    globalThis.requestAnimationFrame = requestAnimationFrame
  }
})
