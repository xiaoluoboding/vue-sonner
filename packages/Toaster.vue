<template>
  <!-- Remove item from normal navigation flow, only available via hotkey -->
  <section :aria-label="`${containerAriaLabel} ${hotkeyLabel}`" :tabIndex="-1">
    <template v-for="(pos, index) in possiblePositions" :key="pos">
      <ol
        ref="listRef"
        data-sonner-toaster
        :class="class"
        :dir="dir === 'auto' ? getDocumentDirection() : dir"
        :tabIndex="-1"
        :data-theme="theme"
        :data-rich-colors="richColors"
        :data-y-position="pos.split('-')[0]"
        :data-x-position="pos.split('-')[1]"
        :style="
          {
            '--front-toast-height': `${heights[0]?.height}px`,
            '--offset': typeof offset === 'number' ? `${offset}px` : offset || VIEWPORT_OFFSET,
            '--width': `${TOAST_WIDTH}px`,
            '--gap': `${GAP}px`,
            ...style,
            ...(attrs as Record<string, Record<string, any>>).style,
          }
        "
        @blur="onBlur"
        @focus="onFocus"
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
        @pointerdown="onPointerDown"
        @pointerup="interacting = false"
        v-bind="$attrs"
      >
        <template
          v-for="(toast, idx) in toasts.filter(
            (toast) =>
              (!toast.position && index === 0) || toast.position === position
          )"
          :key="toast.id"
        >
          <Toast
            :index="idx"
            :toast="toast"
            :duration="toastOptions?.duration ?? duration"
            :class="toastOptions?.class"
            :descriptionClass="toastOptions?.descriptionClass"
            :invert="invert"
            :visibleToasts="visibleToasts"
            :closeButton="toastOptions?.closeButton ?? closeButton"
            :interacting="interacting"
            :position="position"
            :style="toastOptions?.style"
            :unstyled="toastOptions?.unstyled"
            :classes="toastOptions?.classes"
            :cancelButtonStyle="toastOptions?.cancelButtonStyle"
            :actionButtonStyle="toastOptions?.actionButtonStyle"
            :toasts="toasts"
            :expandByDefault="expand"
            :gap="gap"
            :expanded="expanded"
            :pauseWhenPageIsHidden="pauseWhenPageIsHidden"
            :cn="cnFunction"
            v-model:heights="heights"
            @removeToast="removeToast"
          >
            <template #loading-icon>
              <slot name="loading-icon">
                <LoaderIcon :visible="toast.type === 'loading'" />
              </slot>
            </template>

            <template #success-icon>
              <slot name="success-icon">
                <SuccessIcon />
              </slot>
            </template>

            <template #error-icon>
              <slot name="error-icon">
                <ErrorIcon />
              </slot>
            </template>

            <template #warning-icon>
              <slot name="warning-icon">
                <WarningIcon />
              </slot>
            </template>

            <template #info-icon>
              <slot name="info-icon">
                <InfoIcon />
              </slot>
            </template>
          </Toast>
        </template>
      </ol>
    </template>
  </section>
</template>

<script lang="ts">
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

const isClient =
  typeof window !== 'undefined' && typeof document !== 'undefined'
</script>

<script lang="ts" setup>
import { computed, ref, watch, watchEffect, useAttrs, nextTick } from 'vue'
import type {
  ToasterProps,
  HeightT,
  Position,
  ToastT,
  ToastToDismiss
} from './types'
import { ToastState } from './state'
import Toast from './Toast.vue'
import LoaderIcon from './assets/Loader.vue'
import SuccessIcon from './assets/SuccessIcon.vue'
import InfoIcon from './assets/InfoIcon.vue'
import WarningIcon from './assets/WarningIcon.vue'
import ErrorIcon from './assets/ErrorIcon.vue'

defineOptions({
  name: 'Toaster',
  inheritAttrs: false
})

function _cn(...classes: (string | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}

function getDocumentDirection(): ToasterProps['dir'] {
  if (typeof window === 'undefined') return 'ltr'
  if (typeof document === 'undefined') return 'ltr' // For Fresh purpose

  const dirAttribute = document.documentElement.getAttribute('dir')

  if (dirAttribute === 'auto' || !dirAttribute) {
    return window.getComputedStyle(document.documentElement)
      .direction as ToasterProps['dir']
  }

  return dirAttribute as ToasterProps['dir']
}

const props = withDefaults(defineProps<ToasterProps>(), {
  invert: false,
  position: 'bottom-right',
  hotkey: () => ['altKey', 'KeyT'],
  expand: false,
  closeButton: false,
  class: '',
  offset: VIEWPORT_OFFSET,
  theme: 'light',
  richColors: false,
  duration: TOAST_LIFETIME,
  style: () => ({}),
  visibleToasts: VISIBLE_TOASTS_AMOUNT,
  toastOptions: () => ({}),
  dir: 'auto',
  gap: GAP,
  containerAriaLabel: 'Notifications',
  pauseWhenPageIsHidden: false
})

const attrs = useAttrs()
const toasts = ref<ToastT[]>([])
const possiblePositions = computed(() => {
  const posList = toasts.value
    .filter((toast) => toast.position)
    .map((toast) => toast.position) as Position[]
  return posList.length > 0
    ? Array.from(new Set([props.position].concat(posList)))
    : [props.position]
})
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

const cnFunction = computed(() => props.cn || _cn)
const listRef = ref<HTMLOListElement[] | HTMLOListElement | null>(null)
const lastFocusedElementRef = ref<HTMLElement | null>(null)
const isFocusWithinRef = ref(false)

const hotkeyLabel = props.hotkey
  .join('+')
  .replace(/Key/g, '')
  .replace(/Digit/g, '')

function removeToast(toast: ToastT) {
  toasts.value = toasts.value.filter(({ id }) => id !== toast.id)
}

const onBlur = (event: FocusEvent | any) => {
  if (
    isFocusWithinRef.value &&
    !event.currentTarget?.contains?.(event.relatedTarget)
  ) {
    isFocusWithinRef.value = false
    if (lastFocusedElementRef.value) {
      lastFocusedElementRef.value.focus({ preventScroll: true })
      lastFocusedElementRef.value = null
    }
  }
}

const onFocus = (event: FocusEvent | any) => {
  const isNotDismissible =
    event.target instanceof HTMLElement &&
    event.target.dataset.dismissible === 'false'

  if (isNotDismissible) return

  if (!isFocusWithinRef.value) {
    isFocusWithinRef.value = true
    lastFocusedElementRef.value = event.relatedTarget as HTMLElement
  }
}

const onPointerDown = (event: PointerEvent) => {
  if (event.target) {
    const isNotDismissible =
      event.target instanceof HTMLElement &&
      event.target.dataset.dismissible === 'false'

    if (isNotDismissible) return
  }
  interacting.value = false
}

watchEffect((onInvalidate) => {
  const unsubscribe = ToastState.subscribe((toast) => {
    if ((toast as ToastToDismiss).dismiss) {
      toasts.value = toasts.value.map((t) =>
        t.id === toast.id ? { ...t, delete: true } : t
      )
      return
    }

    nextTick(() => {
      const indexOfExistingToast = toasts.value.findIndex(
        (t) => t.id === toast.id
      )

      // Update the toast if it already exists
      if (indexOfExistingToast !== -1) {
        toasts.value.splice(indexOfExistingToast, 1, toast)
        // toasts.value = [
        //   ...toasts.value.slice(0, indexOfExistingToast),
        //   { ...toasts.value[indexOfExistingToast], ...toast },
        //   ...toasts.value.slice(indexOfExistingToast + 1)
        // ]
      } else {
        toasts.value = [toast, ...toasts.value]
      }
    })
  })

  onInvalidate(() => {
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

watch(
  () => listRef.value,
  () => {
    if (listRef.value) {
      return () => {
        if (lastFocusedElementRef.value) {
          lastFocusedElementRef.value.focus({ preventScroll: true })
          lastFocusedElementRef.value = null
          isFocusWithinRef.value = false
        }
      }
    }
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

    const listRefItem = Array.isArray(listRef.value) ? listRef.value[0] : listRef.value

    if (isHotkeyPressed) {
      expanded.value = true
      listRefItem?.focus()
    }

    const isItemActive = document.activeElement === listRef.value || listRefItem?.contains(document.activeElement)

    if (event.code === 'Escape' && isItemActive) {
      expanded.value = false
    }
  }

  if (!isClient) return

  document.addEventListener('keydown', handleKeyDown)

  onInvalidate(() => {
    document.removeEventListener('keydown', handleKeyDown)
  })
})
</script>
