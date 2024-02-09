<template>
  <!-- Remove item from normal navigation flow, only available via hotkey -->
  <section :aria-label="`Notifications ${hotkeyLabel}`" :tabIndex="-1">
    <ol
      ref="listRef"
      data-sonner-toaster
      :dir="dir === 'auto' ? getDocumentDirection() : dir"
      :tabIndex="-1"
      :data-theme="theme"
      :data-rich-colors="richColors"
      :data-y-position="coords[0]"
      :data-x-position="coords[1]"
      :style="
        {
          '--front-toast-height': `${heights[0]?.height}px`,
          '--offset': typeof offset === 'number' ? `${offset}px` : offset || VIEWPORT_OFFSET,
          '--width': `${TOAST_WIDTH}px`,
          '--gap': `${GAP}px`,
          ...(attrs as Record<string, Record<string, any>>).style,
        }
      "
      @mouseenter="expanded = true"
      @mousemove="expanded = true"
      @mouseleave="
        () => {
          // Avoid setting expanded to false when interacting with a toast, e.g. swiping
          if (!interacting) {
            expanded = false
          }
        }
      "
      @pointerdown="interacting = false"
      @pointerup="interacting = false"
    >
      <template v-for="(toast, index) in toasts" :key="toast.id">
        <Toast
          :index="index"
          :toast="toast"
          :duration="toastOptions?.duration ?? duration"
          :toasterClassName="toastOptions?.className"
          :toasterDescriptionClassName="toastOptions?.descriptionClassName"
          :invert="invert"
          :visibleToasts="visibleToasts"
          :closeButton="closeButton"
          :interacting="interacting"
          :position="position"
          :style="toastOptions?.style"
          :toasts="toasts"
          :expandByDefault="expand"
          :gap="gap"
          :expanded="expanded"
          v-model:heights="heights"
          @removeToast="removeToast"
        />
      </template>
    </ol>
  </section>
</template>

<script lang="ts">
export interface ToasterProps {
  invert?: boolean
  theme?: Theme
  position?: Position
  hotkey?: string[]
  richColors?: boolean
  expand?: boolean
  duration?: number
  gap?: number
  visibleToasts?: number
  closeButton?: boolean
  toastOptions?: ToastOptions
  className?: string
  style?: CSSProperties
  offset?: string | number
  dir?: 'rtl' | 'ltr' | 'auto'
}

// Visible toasts amount
const VISIBLE_TOASTS_AMOUNT = 3

// Viewport padding
const VIEWPORT_OFFSET = '32px'

// Default lifetime of a toasts (in ms)
const TOAST_LIFETIME = 4000

// Default toast width
const TOAST_WIDTH = 356

// Default gap between toasts
const GAP = 14

const isClient = typeof window !== 'undefined' && typeof document !== 'undefined'
</script>

<script lang="ts" setup>
import {
  computed,
  onMounted,
  onUnmounted,
  ref,
  watch,
  watchEffect,
  useAttrs,
  type CSSProperties,
  nextTick
} from 'vue'
import type {
  HeightT,
  Position,
  Theme,
  ToastOptions,
  ToastT,
  ToastToDismiss
} from './types'
import { ToastState } from './state'
import Toast from './Toast.vue'

defineOptions({
  name: 'Toaster',
  inheritAttrs: false
})

const props = withDefaults(defineProps<ToasterProps>(), {
  invert: false,
  position: 'bottom-right',
  hotkey: () => ['altKey', 'KeyT'],
  expand: false,
  closeButton: false,
  className: '',
  offset: VIEWPORT_OFFSET,
  theme: 'light',
  richColors: false,
  duration: TOAST_LIFETIME,
  style: () => ({}),
  visibleToasts: VISIBLE_TOASTS_AMOUNT,
  toastOptions: () => ({}),
  dir: 'auto',
  gap: GAP
})

const attrs = useAttrs()
const toasts = ref<ToastT[]>([])
const heights = ref<HeightT[]>([])
const expanded = ref(false)
const interacting = ref(false)
const actualTheme = ref(
  props.theme !== 'system'
    ? props.theme
    : typeof window !== 'undefined'
    ? window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light'
    : 'light'
)
const coords = computed(() => props.position.split('-'))
const listRef = ref<HTMLOListElement | null>(null)
const hotkeyLabel = props.hotkey
  .join('+')
  .replace(/Key/g, '')
  .replace(/Digit/g, '')

function removeToast(toast: ToastT) {
  toasts.value = toasts.value.filter(({ id }) => id !== toast.id)
}

function getDocumentDirection(): ToasterProps['dir'] {
  if (typeof window === 'undefined') return 'ltr'

  const dirAttribute = document.documentElement.getAttribute('dir')

  if (dirAttribute === 'auto' || !dirAttribute) {
    return window.getComputedStyle(document.documentElement)
      .direction as ToasterProps['dir']
  }

  return dirAttribute as ToasterProps['dir']
}

onMounted(() => {
  const unsubscribe = ToastState.subscribe((toast) => {
    if ((toast as ToastToDismiss).dismiss) {
      toasts.value = toasts.value.map((t) =>
        t.id === toast.id ? { ...t, delete: true } : t
      )
      return
    }

    nextTick(() => {
      const indexOfExistingToast = toasts.value.findIndex((t) => t.id === toast.id);

      // Update the toast if it already exists
      if (indexOfExistingToast !== -1) {
        toasts.value.splice(indexOfExistingToast, 1, toast)
      } else {
        toasts.value = [toast, ...toasts.value]
      }
    })
  })

  onUnmounted(() => {
    unsubscribe()
  })
})

watch(
  () => props.theme,
  (newTheme) => {
    if (newTheme !== 'system') {
      actualTheme.value = newTheme
      return
    }

    if (newTheme === 'system') {
      // check if current preference is dark
      if (
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: dark)').matches
      ) {
        // it's currently dark
        actualTheme.value = 'dark'
      } else {
        // it's not dark
        actualTheme.value = 'light'
      }
    }

    if (typeof window === 'undefined') return

    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', ({ matches }) => {
        if (matches) {
          actualTheme.value = 'dark'
        } else {
          actualTheme.value = 'light'
        }
      })
  }
)

watchEffect(() => {
  // Ensure expanded is always false when no toasts are present / only one left
  if (toasts.value.length <= 1) {
    expanded.value = false
  }
})

watchEffect((onInvalidate) => {
  function handleKeyDown(event: KeyboardEvent) {
    const isHotkeyPressed = props.hotkey.every(
      (key) => (event as any)[key] || event.code === key
    )

    if (isHotkeyPressed) {
      expanded.value = true
      listRef.value?.focus()
    }

    if (
      event.code === 'Escape' &&
      (document.activeElement === listRef.value ||
        listRef.value?.contains(document.activeElement))
    ) {
      expanded.value = false
    }
  }

  if(!isClient) return

  document.addEventListener('keydown', handleKeyDown)

  onInvalidate(() => {
    document.removeEventListener('keydown', handleKeyDown)
  })
})
</script>
