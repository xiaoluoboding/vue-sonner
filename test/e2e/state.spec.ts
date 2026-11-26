import { expect, test } from '@playwright/test'
import { effectScope, nextTick } from 'vue'
import { toast, useVueSonner } from 'vue-sonner'

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

test('returned zero ID dismisses only its toast on the next frame', async () => {
  const requestAnimationFrame = globalThis.requestAnimationFrame
  const frames: FrameRequestCallback[] = []
  globalThis.requestAnimationFrame = callback => frames.push(callback)
  const scope = effectScope()
  const { activeToasts } = scope.run(useVueSonner)!

  try {
    const otherId = toast('Keep this toast', { id: 'unrelated-zero-toast' })
    const id = toast('Zero toast', { id: 0 })
    await nextTick()

    expect(id).toBe(0)
    expect(activeToasts.value.map(value => value.id)).toEqual([id, otherId])
    expect(toast.dismiss(id)).toBe(id)
    expect(toast.getToasts().map(value => value.id)).toContain(otherId)
    expect(toast.getToasts().map(value => value.id)).not.toContain(id)
    expect(activeToasts.value.map(value => value.id)).toEqual([id, otherId])
    expect(frames).toHaveLength(1)

    frames[0](0)
    expect(activeToasts.value.map(value => value.id)).toEqual([otherId])
  } finally {
    scope.stop()
    globalThis.requestAnimationFrame = requestAnimationFrame
  }
})

for (const [name, dismiss] of [
  ['omitted', () => toast.dismiss()],
  ['undefined', () => toast.dismiss(undefined)],
  ['empty string', () => toast.dismiss('')],
] as const) {
  test(`dismiss with ${name} ID broadcasts without scheduling a frame`, async () => {
    const requestAnimationFrame = globalThis.requestAnimationFrame
    const frames: FrameRequestCallback[] = []
    globalThis.requestAnimationFrame = callback => frames.push(callback)
    const scope = effectScope()
    const { activeToasts } = scope.run(useVueSonner)!

    try {
      const otherId = toast('Another toast', { id: 'broadcast-toast' })
      const id = toast('Zero toast', { id: 0 })
      await nextTick()

      expect(activeToasts.value.map(value => value.id)).toEqual([id, otherId])
      const activeBefore = toast.getToasts()
      dismiss()
      expect(activeToasts.value).toEqual([])
      expect(frames).toHaveLength(0)
      expect(toast.getToasts()).toEqual(activeBefore)
    } finally {
      scope.stop()
      globalThis.requestAnimationFrame = requestAnimationFrame
    }
  })
}
