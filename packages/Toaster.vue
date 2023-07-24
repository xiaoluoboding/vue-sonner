<template>
  <!-- Remove item from normal navigation flow, only available via hotkey -->
  <section :aria-label="`Notifications ${hotkeyLabel}`" :tabIndex="-1">
    <ol
      ref="listRef"
      :tabIndex="-1"
      data-sonner-toaster
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
          :duration="duration"
          :className="toastOptions?.className"
          :descriptionClassName="toastOptions?.descriptionClassName"
          :invert="invert"
          :visibleToasts="visibleToasts"
          :closeButton="closeButton"
          :interacting="interacting"
          :position="position"
          :style="toastOptions?.style"
          :toasts="toasts"
          :expandByDefault="expand"
          :expanded="expanded"
          v-model:heights="heights"
          @removeToast="removeToast"
        />
      </template>
    </ol>
  </section>
</template>

<script lang="ts" setup>
import {
  computed,
  onMounted,
  onUnmounted,
  ref,
  watchEffect,
  useAttrs
} from 'vue'
import {
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

export interface ToasterProps {
  invert?: boolean
  theme?: Theme
  position?: Position
  hotkey?: string[]
  richColors?: boolean
  expand?: boolean
  duration?: number
  visibleToasts?: number
  closeButton?: boolean
  toastOptions?: ToastOptions
  className?: string
  style?: Record<string, any>
  offset?: string | number
}

// Visible toasts amount
const VISIBLE_TOASTS_AMOUNT = 3

const VIEWPORT_OFFSET = '32px'

// Default toast width
const TOAST_WIDTH = 356

// Default gap between toasts
const GAP = 14

const props = withDefaults(defineProps<ToasterProps>(), {
  invert: false,
  theme: 'light',
  position: 'bottom-right',
  hotkey: () => ['altKey', 'KeyT'],
  richColors: false,
  expand: false,
  duration: Number,
  visibleToasts: 3,
  closeButton: false,
  toastOptions: () => ({}),
  offset: 0
})

const attrs = useAttrs()
const toasts = ref<ToastT[]>([])
const heights = ref<HeightT[]>([])
const expanded = ref(false)
const interacting = ref(false)
const coords = computed(() => props.position.split('-'))
const listRef = ref<HTMLOListElement | null>(null)
const hotkeyLabel = props.hotkey
  .join('+')
  .replace(/Key/g, '')
  .replace(/Digit/g, '')

function removeToast(toast: ToastT) {
  toasts.value = toasts.value.filter(({ id }) => id !== toast.id)
}

onMounted(() => {
  const unsubscribe = ToastState.subscribe((toast) => {
    if ((toast as ToastToDismiss).dismiss) {
      toasts.value = toasts.value.map((t) =>
        t.id === toast.id ? { ...t, delete: true } : t
      )
      return
    }

    toasts.value = [toast, ...toasts.value]
  })

  onUnmounted(() => {
    unsubscribe()
  })
})

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

  document.addEventListener('keydown', handleKeyDown)

  onInvalidate(() => {
    document.removeEventListener('keydown', handleKeyDown)
  })
})
</script>
