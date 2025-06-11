import { nextTick, ref, watchEffect, type CSSProperties, type Ref } from 'vue'
import type { SwipeDirection, ToasterProps, ToastT } from './types'
import { ToastState } from './state'
import { MOBILE_VIEWPORT_OFFSET, VIEWPORT_OFFSET } from './constant'

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

export function cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

export function getDefaultSwipeDirections(
  position: string
): Array<SwipeDirection> {
  const [y, x] = position.split('-')
  const directions: Array<SwipeDirection> = []

  if (y) {
    directions.push(y as SwipeDirection)
  }

  if (x) {
    directions.push(x as SwipeDirection)
  }

  return directions
}

export function assignOffset(
  defaultOffset: ToasterProps['offset'],
  mobileOffset: ToasterProps['mobileOffset']
) {
  const styles = {} as CSSProperties

  ;[defaultOffset, mobileOffset].forEach((offset, index) => {
    const isMobile = index === 1
    const prefix = isMobile ? '--mobile-offset' : '--offset'
    const defaultValue = isMobile ? MOBILE_VIEWPORT_OFFSET : VIEWPORT_OFFSET

    function assignAll(offset: string | number) {
      ;['top', 'right', 'bottom', 'left'].forEach((key) => {
        styles[`${prefix}-${key}`] =
          typeof offset === 'number' ? `${offset}px` : offset
      })
    }

    if (typeof offset === 'number' || typeof offset === 'string') {
      assignAll(offset)
    } else if (typeof offset === 'object') {
      ;['top', 'right', 'bottom', 'left'].forEach((key) => {
        if (offset[key as keyof typeof offset] === undefined) {
          styles[`${prefix}-${key}`] = defaultValue
        } else {
          styles[`${prefix}-${key}`] =
            typeof offset[key as keyof typeof offset] === 'number'
              ? `${offset[key as keyof typeof offset]}px`
              : offset[key as keyof typeof offset]
        }
      })
    } else {
      assignAll(defaultValue)
    }
  })

  return styles
}

export function useVueSonner(): {
  activeToasts: Ref<ToastT[]>
} {
  const activeToasts = ref<ToastT[]>([])

  watchEffect((onInvalidate) => {
    const unsubscribe = ToastState.subscribe((toast) => {
      if ('dismiss' in toast && toast.dismiss) {
        activeToasts.value = activeToasts.value.filter((t) => t.id !== toast.id)
        return
      }

      nextTick(() => {
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
    })

    onInvalidate(() => {
      unsubscribe()
    })
  })

  return {
    activeToasts
  }
}
