<template>
  <!-- Remove item from normal navigation flow, only available via hotkey -->
  <section
    :aria-label="`${containerAriaLabel} ${hotkeyLabel}`"
    :tabIndex="-1"
    aria-live="polite"
    aria-relevant="additions text"
    aria-atomic="false"
  >
    <template v-for="(pos, index) in possiblePositions" :key="pos">
      <ol
        ref="listRef"
        data-sonner-toaster
        :data-sonner-theme="actualTheme"
        :class="props.class"
        :dir="dir === 'auto' ? getDocumentDirection() : dir"
        :tabIndex="-1"
        :data-theme="theme"
        :data-rich-colors="richColors"
        :data-y-position="pos.split('-')[0]"
        :data-x-position="pos.split('-')[1]"
        :style="{
          '--front-toast-height': `${heights[0]?.height || 0}px`,
          '--width': `${TOAST_WIDTH}px`,
          '--gap': `${gap}px`,
          ...style,
          ...((attrs as Record<string, Record<string, any>>).style as any),
          ...assignOffset(offset, mobileOffset),
        }"
        v-bind="$attrs"
        @blur="onBlur"
        @focus="onFocus"
        @mouseenter="handleMouseEnter"
        @mousemove="handleMouseEnter"
        @mouseleave="handleMouseLeave"
        @dragend="handleDragEnd"
        @pointerdown="onPointerDown"
        @pointerup="handlePointerUp"
      >
        <template v-for="(toast, idx) in filteredToasts(pos, index)" :key="toast.id">
          <Toast
            :heights="heights"
            :icons="icons"
            :index="idx"
            :toast="toast"
            :defaultRichColors="richColors"
            :duration="toastOptions?.duration ?? duration"
            :class="toastOptions?.class ?? ''"
            :descriptionClass="toastOptions?.descriptionClass"
            :invert="invert"
            :visibleToasts="visibleToasts"
            :closeButton="toastOptions?.closeButton ?? closeButton"
            :interacting="interacting"
            :position="pos"
            :closeButtonPosition="toastOptions?.closeButtonPosition ?? closeButtonPosition"
            :style="toastOptions?.style"
            :unstyled="toastOptions?.unstyled"
            :classes="toastOptions?.classes"
            :cancelButtonStyle="toastOptions?.cancelButtonStyle"
            :actionButtonStyle="toastOptions?.actionButtonStyle"
            :close-button-aria-label="toastOptions?.closeButtonAriaLabel"
            :toasts="toastsByPosition[pos]"
            :expandByDefault="expand"
            :gap="gap"
            :expanded="expanded[pos] || false"
            :swipeDirections="props.swipeDirections"
            @update:heights="updateHeights"
            @update:height="updateHeight"
            @removeToast="removeToast"
          >
            <template #close-icon>
              <slot name="close-icon">
                <CloseIcon />
              </slot>
            </template>

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
const isClient =
  typeof window !== 'undefined' && typeof document !== 'undefined'

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
</script>

<script lang="ts" setup>
import {
  computed,
  nextTick,
  ref,
  useAttrs,
  watch,
  watchEffect
} from 'vue'
import type {
  HeightT,
  Position,
  ToastT,
  ToastToDismiss,
  ToasterProps
} from './types'
import { ToastState } from './state'
import Toast from './Toast.vue'
import CloseIcon from './assets/CloseIcon.vue'
import LoaderIcon from './assets/Loader.vue'
import SuccessIcon from './assets/SuccessIcon.vue'
import InfoIcon from './assets/InfoIcon.vue'
import WarningIcon from './assets/WarningIcon.vue'
import ErrorIcon from './assets/ErrorIcon.vue'
import { assignOffset } from './hooks'
import { GAP, MOBILE_VIEWPORT_OFFSET, TOAST_WIDTH, VIEWPORT_OFFSET, VISIBLE_TOASTS_AMOUNT, TIME_BEFORE_UNMOUNT } from './constant'

defineOptions({
  name: 'Toaster',
  inheritAttrs: false
})

const props = withDefaults(defineProps<ToasterProps>(), {
  invert: false,
  position: 'bottom-right',
  closeButtonPosition: 'top-left',
  hotkey: () => ['altKey', 'KeyT'],
  expand: false,
  closeButton: false,
  class: '',
  offset: VIEWPORT_OFFSET,
  mobileOffset: MOBILE_VIEWPORT_OFFSET,
  theme: 'light',
  richColors: false,
  visibleToasts: VISIBLE_TOASTS_AMOUNT,
  toastOptions: () => ({}),
  dir: 'auto',
  gap: GAP,
  containerAriaLabel: 'Notifications',
})

const attrs = useAttrs()
const toasts = ref<ToastT[]>([])

const filteredToastsById = computed(() => {
  if (props.id) {
    return toasts.value.filter((toast) => toast.toasterId === props.id);
  }
  return toasts.value.filter((toast) => !toast.toasterId);
});

function filteredToasts(pos: string, index: number) {
  return filteredToastsById.value.filter(
    (toast) => (!toast.position && index === 0) || toast.position === pos
  )
}
const possiblePositions = computed(() => {
  const posList = filteredToastsById.value
    .filter((toast) => toast.position)
    .map((toast) => toast.position) as Position[]
  return posList.length > 0
    ? Array.from(new Set([props.position].concat(posList)))
    : [props.position]
})

const toastsByPosition = computed(() => {
  const result: Record<string, ToastT[]> = {}
  possiblePositions.value.forEach((pos) => {
    result[pos] = toasts.value.filter(t => t.position === pos)
  })
  return result
})

const heights = ref<HeightT[]>([])
const expanded = ref<Record<string, boolean>>({})
const interacting = ref(false)

// Initialize expanded state for each position
watchEffect(() => {
  possiblePositions.value.forEach(pos => {
    if (!(pos in expanded.value)) {
      expanded.value[pos] = false
    }
  })
})
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

const listRef = ref<HTMLOListElement[] | HTMLOListElement | null>(null)
const lastFocusedElementRef = ref<HTMLElement | null>(null)
const isFocusWithinRef = ref(false)

const hotkeyLabel = props.hotkey
  .join('+')
  .replace(/Key/g, '')
  .replace(/Digit/g, '')

function removeToast(toastToRemove: ToastT) {
  if (!toasts.value.find((toast) => toast.id === toastToRemove.id)?.delete) {
    ToastState.dismiss(toastToRemove.id)
  }

  // First remove toast
  toasts.value = toasts.value.filter(({ id }) => id !== toastToRemove.id)

  // Delay cleaning heights to give animation time to complete
  setTimeout(() => {
    // Ensure toast has been actually removed before cleaning heights
    if (!toasts.value.find(t => t.id === toastToRemove.id)) {
      heights.value = heights.value.filter(h => h.toastId !== toastToRemove.id)
    }
  }, TIME_BEFORE_UNMOUNT + 50) // Slightly delay to ensure animation completion
}

function onBlur(event: FocusEvent | any) {
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

function onFocus(event: FocusEvent | any) {
  const isNotDismissible =
    event.target instanceof HTMLElement &&
    event.target.dataset.dismissible === 'false'

  if (isNotDismissible) return

  if (!isFocusWithinRef.value) {
    isFocusWithinRef.value = true
    lastFocusedElementRef.value = event.relatedTarget as HTMLElement
  }
}

function onPointerDown(event: PointerEvent) {
  if (event.target) {
    const isNotDismissible =
      event.target instanceof HTMLElement &&
      event.target.dataset.dismissible === 'false'

    if (isNotDismissible) return
  }
  interacting.value = true
}

watchEffect((onInvalidate) => {
  const unsubscribe = ToastState.subscribe((toast) => {
    if ((toast as ToastToDismiss).dismiss) {
      requestAnimationFrame(() => {
        toasts.value = toasts.value.map((t) => t.id === toast.id ? { ...t, delete: true } : t)
      })
      return
    }

    nextTick(() => {
    const indexOfExistingToast = toasts.value.findIndex(
        (t) => t.id === toast.id
      )

      // Update the toast if it already exists
      if (indexOfExistingToast !== -1) {
        toasts.value = [
          ...toasts.value.slice(0, indexOfExistingToast),
          { ...toasts.value[indexOfExistingToast], ...toast },
          ...toasts.value.slice(indexOfExistingToast + 1)
        ]
      } else {
        toasts.value = [toast, ...toasts.value]
      }
    })
  })

  onInvalidate(unsubscribe)
})

watchEffect((onInvalidate) => {
  // Guard: skip if running in a non-browser environment (e.g. SSR)
  if (typeof window === 'undefined') return

  /**
   * If the theme prop is explicitly set (e.g., 'light' or 'dark'),
   * use it directly and stop watching for system preference.
   */
  if (props.theme !== 'system') {
    actualTheme.value = props.theme
    return
  }

  /**
   * Handle "system" theme:
   * Watch the user's OS-level color scheme preference and
   * apply 'dark' or 'light' accordingly.
   */
  const darkMediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

  /**
   * Helper function to update the actualTheme value
   * based on current media query match.
   *
   * @param {boolean} matches - true if dark mode is preferred
   */
  const updateTheme = (matches: boolean) => {
    actualTheme.value = matches ? 'dark' : 'light'
  }

  // Apply initial system preference
  updateTheme(darkMediaQuery.matches)

  /**
   * Media query listener for changes to system preference
   * Compatible with modern browsers and legacy Safari.
   */
  const handler = (event: MediaQueryListEvent | MediaQueryList) => {
    updateTheme(event.matches)
  }

  try {
    // ✅ Standard method (Chrome, Firefox, etc.)
    darkMediaQuery.addEventListener('change', handler)
  } catch {
    // 🐞 Safari fallback
    darkMediaQuery.addListener(handler)
  }

  // Cleanup listener on component unmount or dependency change
  onInvalidate(() => {
    try {
      darkMediaQuery.removeEventListener('change', handler)
    } catch {
      darkMediaQuery.removeListener(handler)
    }
  })
})

watchEffect(() => {
  if (listRef.value && lastFocusedElementRef.value) {
    lastFocusedElementRef.value.focus({ preventScroll: true })
    lastFocusedElementRef.value = null
    isFocusWithinRef.value = false
  }
})

watchEffect(() => {
  // Ensure expanded is always false when no toasts are present / only one left
  if (toasts.value.length <= 1) {
    // Reset all positions to false
    Object.keys(expanded.value).forEach(pos => {
      expanded.value[pos] = false
    })
  }
})

watchEffect((onInvalidate) => {
  function handleKeyDown(event: KeyboardEvent) {
    const isHotkeyPressed = props.hotkey.every(
      (key) => (event as any)[key] || event.code === key
    )

    const listRefItem = Array.isArray(listRef.value)
      ? listRef.value[0]
      : listRef.value

    if (isHotkeyPressed) {
      // Expand all positions when hotkey is pressed
      possiblePositions.value.forEach(pos => {
        expanded.value[pos] = true
      })
      listRefItem?.focus()
    }

    const isItemActive =
      document.activeElement === listRef.value ||
      listRefItem?.contains(document.activeElement)

    if (event.code === 'Escape' && isItemActive) {
      // Collapse all positions when escape is pressed
      possiblePositions.value.forEach(pos => {
        expanded.value[pos] = false
      })
    }
  }

  if (!isClient) return

  document.addEventListener('keydown', handleKeyDown)

  onInvalidate(() => {
    document.removeEventListener('keydown', handleKeyDown)
  })
})

function handleMouseEnter(event: MouseEvent) { 
  const target = event.currentTarget as HTMLElement
  const position = target.getAttribute('data-y-position') + '-' + target.getAttribute('data-x-position')
  expanded.value[position] = true 
}
function handleMouseLeave(event: MouseEvent) { 
  if (!interacting.value) {
    const target = event.currentTarget as HTMLElement
    const position = target.getAttribute('data-y-position') + '-' + target.getAttribute('data-x-position')
    expanded.value[position] = false 
  }
}
function handleDragEnd() { 
  // Reset all positions to false when drag ends
  Object.keys(expanded.value).forEach(pos => {
    expanded.value[pos] = false
  })
}
function handlePointerUp() { interacting.value = false }
function updateHeights(h: HeightT[]) { heights.value = h }
function updateHeight(h: HeightT) {
  const index = heights.value.findIndex(item => item.toastId === h.toastId)
  if (index !== -1) {
    heights.value[index] = h
  } else {
    // Insert by position grouping, keeping toasts of the same position contiguous
    const samePositionIndex = heights.value.findIndex(item => item.position === h.position)
    if (samePositionIndex !== -1) {
      // Insert at the first position of the same position
      heights.value.splice(samePositionIndex, 0, h)
    } else {
      // If no same position exists, add to the beginning
      heights.value.unshift(h)
    }
  }
}
</script>

<style>
html[dir='ltr'],
[data-sonner-toaster][dir='ltr'] {
  --toast-icon-margin-start: -3px;
  --toast-icon-margin-end: 4px;
  --toast-svg-margin-start: -1px;
  --toast-svg-margin-end: 0px;
  --toast-button-margin-start: auto;
  --toast-button-margin-end: 0;
}

html[dir='rtl'],
[data-sonner-toaster][dir='rtl'] {
  --toast-icon-margin-start: 4px;
  --toast-icon-margin-end: -3px;
  --toast-svg-margin-start: 0px;
  --toast-svg-margin-end: -1px;
  --toast-button-margin-start: 0;
  --toast-button-margin-end: auto;
}

[data-sonner-toaster] {
  position: fixed;
  width: var(--width);
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Helvetica Neue, Arial,
    Noto Sans, sans-serif, Apple Color Emoji, Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji;
  --gray1: hsl(0, 0%, 99%);
  --gray2: hsl(0, 0%, 97.3%);
  --gray3: hsl(0, 0%, 95.1%);
  --gray4: hsl(0, 0%, 93%);
  --gray5: hsl(0, 0%, 90.9%);
  --gray6: hsl(0, 0%, 88.7%);
  --gray7: hsl(0, 0%, 85.8%);
  --gray8: hsl(0, 0%, 78%);
  --gray9: hsl(0, 0%, 56.1%);
  --gray10: hsl(0, 0%, 52.3%);
  --gray11: hsl(0, 0%, 43.5%);
  --gray12: hsl(0, 0%, 9%);
  --border-radius: 8px;
  box-sizing: border-box;
  padding: 0;
  margin: 0;
  list-style: none;
  outline: none;
  z-index: 999999999;
  transition: transform 400ms ease;
}

@media (hover: none) and (pointer: coarse) {
  [data-sonner-toaster][data-lifted='true'] {
    transform: none;
  }
}

[data-sonner-toaster][data-x-position='right'] {
  right: var(--offset-right);
}

[data-sonner-toaster][data-x-position='left'] {
  left: var(--offset-left);
}

[data-sonner-toaster][data-x-position='center'] {
  left: 50%;
  transform: translateX(-50%);
}

[data-sonner-toaster][data-y-position='top'] {
  top: var(--offset-top);
}

[data-sonner-toaster][data-y-position='bottom'] {
  bottom: var(--offset-bottom);
}

[data-sonner-toast] {
  --y: translateY(100%);
  --lift-amount: calc(var(--lift) * var(--gap));
  z-index: var(--z-index);
  position: absolute;
  opacity: 0;
  transform: var(--y);
  touch-action: none;
  transition: transform 400ms, opacity 400ms, height 400ms, box-shadow 200ms;
  box-sizing: border-box;
  outline: none;
  overflow-wrap: anywhere;
}

[data-sonner-toast][data-styled='true'] {
  padding: 16px;
  background: var(--normal-bg);
  border: 1px solid var(--normal-border);
  color: var(--normal-text);
  border-radius: var(--border-radius);
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1);
  width: var(--width);
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 6px;
}

[data-sonner-toast]:focus-visible {
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1), 0 0 0 2px rgba(0, 0, 0, 0.2);
}

[data-sonner-toast][data-y-position='top'] {
  top: 0;
  --y: translateY(-100%);
  --lift: 1;
  --lift-amount: calc(1 * var(--gap));
}

[data-sonner-toast][data-y-position='bottom'] {
  bottom: 0;
  --y: translateY(100%);
  --lift: -1;
  --lift-amount: calc(var(--lift) * var(--gap));
}

[data-sonner-toast][data-styled='true'] [data-description] {
  font-weight: 400;
  line-height: 1.4;
  color: #3f3f3f;
}

[data-rich-colors='true'][data-sonner-toast][data-styled='true'] [data-description] {
  color: inherit;
}

[data-sonner-toaster][data-sonner-theme='dark'] [data-description] {
  color: hsl(0, 0%, 91%);
}

[data-sonner-toast][data-styled='true'] [data-title] {
  font-weight: 500;
  line-height: 1.5;
  color: inherit;
}

[data-sonner-toast][data-styled='true'] [data-icon] {
  display: flex;
  height: 16px;
  width: 16px;
  position: relative;
  justify-content: flex-start;
  align-items: center;
  flex-shrink: 0;
  margin-left: var(--toast-icon-margin-start);
  margin-right: var(--toast-icon-margin-end);
}

[data-sonner-toast][data-promise='true'] [data-icon] > svg {
  opacity: 0;
  transform: scale(0.8);
  transform-origin: center;
  animation: sonner-fade-in 300ms ease forwards;
}

[data-sonner-toast][data-styled='true'] [data-icon] > * {
  flex-shrink: 0;
}

[data-sonner-toast][data-styled='true'] [data-icon] svg {
  margin-left: var(--toast-svg-margin-start);
  margin-right: var(--toast-svg-margin-end);
}

[data-sonner-toast][data-styled='true'] [data-content] {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

[data-sonner-toast][data-styled='true'] [data-button] {
  border-radius: 4px;
  padding-left: 8px;
  padding-right: 8px;
  height: 24px;
  font-size: 12px;
  color: var(--normal-bg);
  background: var(--normal-text);
  margin-left: var(--toast-button-margin-start);
  margin-right: var(--toast-button-margin-end);
  border: none;
  font-weight: 500;
  cursor: pointer;
  outline: none;
  display: flex;
  align-items: center;
  flex-shrink: 0;
  transition: opacity 400ms, box-shadow 200ms;
}

[data-sonner-toast][data-styled='true'] [data-button]:focus-visible {
  box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.4);
}

[data-sonner-toast][data-styled='true'] [data-button]:first-of-type {
  margin-left: var(--toast-button-margin-start);
  margin-right: var(--toast-button-margin-end);
}

[data-sonner-toast][data-styled='true'] [data-cancel] {
  color: var(--normal-text);
  background: rgba(0, 0, 0, 0.08);
}

[data-sonner-toaster][data-sonner-theme='dark'] [data-sonner-toast][data-styled='true'] [data-cancel] {
  background: rgba(255, 255, 255, 0.3);
}

[data-sonner-toaster] [data-close-button-position='top-left'] {
  --toast-close-button-left: 0;
  --toast-close-button-right: unset;
  --toast-close-button-top: 0;
  --toast-close-button-bottom: unset;
  --toast-close-button-transform: translate(-35%, -35%);
}

[data-sonner-toaster] [data-close-button-position='top-right'] {
  --toast-close-button-left: unset;
  --toast-close-button-right: 0;
  --toast-close-button-top: 0;
  --toast-close-button-bottom: unset;
  --toast-close-button-transform: translate(35%, -35%);
}

[data-sonner-toaster] [data-close-button-position='bottom-left'] {
  --toast-close-button-left: 0;
  --toast-close-button-right: unset;
  --toast-close-button-top: unset;
  --toast-close-button-bottom: 0;
  --toast-close-button-transform: translate(-35%, 35%);
}

[data-sonner-toaster] [data-close-button-position='bottom-right'] {
  --toast-close-button-left: unset;
  --toast-close-button-right: 0;
  --toast-close-button-top: unset;
  --toast-close-button-bottom: 0;
  --toast-close-button-transform: translate(35%, 35%);
}

[data-sonner-toast][data-styled='true'] [data-close-button] {
  position: absolute;
  left: var(--toast-close-button-left);
  right: var(--toast-close-button-right);
  top: var(--toast-close-button-top);
  bottom: var(--toast-close-button-bottom);
  height: 20px;
  width: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
  color: var(--gray12);
  background: var(--normal-bg);
  border: 1px solid var(--gray4);
  transform: var(--toast-close-button-transform);
  border-radius: 50%;
  cursor: pointer;
  z-index: 1;
  transition: opacity 100ms, background 200ms, border-color 200ms;
}

[data-sonner-toast][data-styled='true'] [data-close-button]:focus-visible {
  box-shadow: 0px 4px 12px rgba(0, 0, 0, 0.1), 0 0 0 2px rgba(0, 0, 0, 0.2);
}

[data-sonner-toast][data-styled='true'] [data-disabled='true'] {
  cursor: not-allowed;
}

[data-sonner-toast][data-styled='true']:hover [data-close-button]:hover {
  background: var(--gray2);
  border-color: var(--gray5);
}

[data-sonner-toast][data-swiping='true']::before {
  content: '';
  position: absolute;
  left: -100%;
  right: -100%;
  height: 100%;
  z-index: -1;
}

[data-sonner-toast][data-y-position='top'][data-swiping='true']::before {
  bottom: 50%;
  transform: scaleY(3) translateY(50%);
}

[data-sonner-toast][data-y-position='bottom'][data-swiping='true']::before {
  top: 50%;
  transform: scaleY(3) translateY(-50%);
}

[data-sonner-toast][data-swiping='false'][data-removed='true']::before {
  content: '';
  position: absolute;
  inset: 0;
  transform: scaleY(2);
}

[data-sonner-toast][data-expanded='true']::after {
  content: '';
  position: absolute;
  left: 0;
  height: calc(var(--gap) + 1px);
  bottom: 100%;
  width: 100%;
}

[data-sonner-toast][data-mounted='true'] {
  --y: translateY(0);
  opacity: 1;
}

[data-sonner-toast][data-expanded='false'][data-front='false'] {
  --scale: var(--toasts-before) * 0.05 + 1;
  --y: translateY(calc(var(--lift-amount) * var(--toasts-before))) scale(calc(-1 * var(--toasts-before) * 0.05 + 1));
  height: var(--front-toast-height);
}

[data-sonner-toast] > * {
  transition: opacity 400ms;
}

[data-sonner-toast][data-x-position='right'] {
  right: 0;
}

[data-sonner-toast][data-x-position='left'] {
  left: 0;
}

[data-sonner-toast][data-expanded='false'][data-front='false'][data-styled='true'] > * {
  opacity: 0;
}

[data-sonner-toast][data-visible='false'] {
  opacity: 0;
  pointer-events: none;
}

[data-sonner-toast][data-mounted='true'][data-expanded='true'] {
  --y: translateY(calc(var(--lift) * var(--offset)));
  height: var(--initial-height);
}

[data-sonner-toast][data-removed='true'][data-front='true'][data-swipe-out='false'] {
  --y: translateY(calc(var(--lift) * -100%));
  opacity: 0;
}

[data-sonner-toast][data-removed='true'][data-front='false'][data-swipe-out='false'][data-expanded='true'] {
  --y: translateY(calc(var(--lift) * var(--offset) + var(--lift) * -100%));
  opacity: 0;
}

[data-sonner-toast][data-removed='true'][data-front='false'][data-swipe-out='false'][data-expanded='false'] {
  --y: translateY(40%);
  opacity: 0;
  transition: transform 500ms, opacity 200ms;
}

[data-sonner-toast][data-removed='true'][data-front='false']::before {
  height: calc(var(--initial-height) + 20%);
}

[data-sonner-toast][data-swiping='true'] {
  transform: var(--y) translateY(var(--swipe-amount-y, 0px)) translateX(var(--swipe-amount-x, 0px));
  transition: none;
}

[data-sonner-toast][data-swiped='true'] {
  user-select: none;
}

[data-sonner-toast][data-swipe-out='true'][data-y-position='bottom'],
[data-sonner-toast][data-swipe-out='true'][data-y-position='top'] {
  animation-duration: 200ms;
  animation-timing-function: ease-out;
  animation-fill-mode: forwards;
}

[data-sonner-toast][data-swipe-out='true'][data-swipe-direction='left'] {
  animation-name: swipe-out-left;
}

[data-sonner-toast][data-swipe-out='true'][data-swipe-direction='right'] {
  animation-name: swipe-out-right;
}

[data-sonner-toast][data-swipe-out='true'][data-swipe-direction='up'] {
  animation-name: swipe-out-up;
}

[data-sonner-toast][data-swipe-out='true'][data-swipe-direction='down'] {
  animation-name: swipe-out-down;
}

@keyframes swipe-out-left {
  from {
    transform: var(--y) translateX(var(--swipe-amount-x));
    opacity: 1;
  }

  to {
    transform: var(--y) translateX(calc(var(--swipe-amount-x) - 100%));
    opacity: 0;
  }
}

@keyframes swipe-out-right {
  from {
    transform: var(--y) translateX(var(--swipe-amount-x));
    opacity: 1;
  }

  to {
    transform: var(--y) translateX(calc(var(--swipe-amount-x) + 100%));
    opacity: 0;
  }
}

@keyframes swipe-out-up {
  from {
    transform: var(--y) translateY(var(--swipe-amount-y));
    opacity: 1;
  }

  to {
    transform: var(--y) translateY(calc(var(--swipe-amount-y) - 100%));
    opacity: 0;
  }
}

@keyframes swipe-out-down {
  from {
    transform: var(--y) translateY(var(--swipe-amount-y));
    opacity: 1;
  }

  to {
    transform: var(--y) translateY(calc(var(--swipe-amount-y) + 100%));
    opacity: 0;
  }
}

@media (max-width: 600px) {
  [data-sonner-toaster] {
    position: fixed;
    right: var(--mobile-offset-right);
    left: var(--mobile-offset-left);
    width: 100%;
  }

  [data-sonner-toaster][dir='rtl'] {
    left: calc(var(--mobile-offset-left) * -1);
  }

  [data-sonner-toaster] [data-sonner-toast] {
    left: 0;
    right: 0;
    width: calc(100% - var(--mobile-offset-left) * 2);
  }

  [data-sonner-toaster][data-x-position='left'] {
    left: var(--mobile-offset-left);
  }

  [data-sonner-toaster][data-y-position='bottom'] {
    bottom: calc(var(--mobile-offset-bottom) + max(env(safe-area-inset-bottom), 0px));
  }

  [data-sonner-toaster][data-y-position='top'] {
    top: calc(var(--mobile-offset-top) + max(env(safe-area-inset-top), 0px));
  }

  [data-sonner-toaster][data-x-position='center'] {
    left: var(--mobile-offset-left);
    right: var(--mobile-offset-right);
    transform: none;
  }
}

[data-sonner-toaster][data-sonner-theme='light'] {
  --normal-bg: #fff;
  --normal-border: var(--gray4);
  --normal-text: var(--gray12);

  --success-bg: hsl(143, 85%, 96%);
  --success-border: hsl(145, 92%, 87%);
  --success-text: hsl(140, 100%, 27%);

  --info-bg: hsl(208, 100%, 97%);
  --info-border: hsl(221, 91%, 93%);
  --info-text: hsl(210, 92%, 45%);

  --warning-bg: hsl(49, 100%, 97%);
  --warning-border: hsl(49, 91%, 84%);
  --warning-text: hsl(31, 92%, 45%);

  --error-bg: hsl(359, 100%, 97%);
  --error-border: hsl(359, 100%, 94%);
  --error-text: hsl(360, 100%, 45%);
}

[data-sonner-toaster][data-sonner-theme='light'] [data-sonner-toast][data-invert='true'] {
  --normal-bg: #000;
  --normal-border: hsl(0, 0%, 20%);
  --normal-text: var(--gray1);
}

[data-sonner-toaster][data-sonner-theme='dark'] [data-sonner-toast][data-invert='true'] {
  --normal-bg: #fff;
  --normal-border: var(--gray3);
  --normal-text: var(--gray12);
}

[data-sonner-toaster][data-sonner-theme='dark'] {
  --normal-bg: #000;
  --normal-bg-hover: hsl(0, 0%, 12%);
  --normal-border: hsl(0, 0%, 20%);
  --normal-border-hover: hsl(0, 0%, 25%);
  --normal-text: var(--gray1);

  --success-bg: hsl(150, 100%, 6%);
  --success-border: hsl(147, 100%, 12%);
  --success-text: hsl(150, 86%, 65%);

  --info-bg: hsl(215, 100%, 6%);
  --info-border: hsl(223, 43%, 17%);
  --info-text: hsl(216, 87%, 65%);

  --warning-bg: hsl(64, 100%, 6%);
  --warning-border: hsl(60, 100%, 9%);
  --warning-text: hsl(46, 87%, 65%);

  --error-bg: hsl(358, 76%, 10%);
  --error-border: hsl(357, 89%, 16%);
  --error-text: hsl(358, 100%, 81%);
}

[data-sonner-toaster][data-sonner-theme='dark'] [data-sonner-toast] [data-close-button] {
  background: var(--normal-bg);
  border-color: var(--normal-border);
  color: var(--normal-text);
}

[data-sonner-toaster][data-sonner-theme='dark'] [data-sonner-toast] [data-close-button]:hover {
  background: var(--normal-bg-hover);
  border-color: var(--normal-border-hover);
}

[data-rich-colors='true'][data-sonner-toast][data-type='success'] {
  background: var(--success-bg);
  border-color: var(--success-border);
  color: var(--success-text);
}

[data-rich-colors='true'][data-sonner-toast][data-type='success'] [data-close-button] {
  background: var(--success-bg);
  border-color: var(--success-border);
  color: var(--success-text);
}

[data-rich-colors='true'][data-sonner-toast][data-type='info'] {
  background: var(--info-bg);
  border-color: var(--info-border);
  color: var(--info-text);
}

[data-rich-colors='true'][data-sonner-toast][data-type='info'] [data-close-button] {
  background: var(--info-bg);
  border-color: var(--info-border);
  color: var(--info-text);
}

[data-rich-colors='true'][data-sonner-toast][data-type='warning'] {
  background: var(--warning-bg);
  border-color: var(--warning-border);
  color: var(--warning-text);
}

[data-rich-colors='true'][data-sonner-toast][data-type='warning'] [data-close-button] {
  background: var(--warning-bg);
  border-color: var(--warning-border);
  color: var(--warning-text);
}

[data-rich-colors='true'][data-sonner-toast][data-type='error'] {
  background: var(--error-bg);
  border-color: var(--error-border);
  color: var(--error-text);
}

[data-rich-colors='true'][data-sonner-toast][data-type='error'] [data-close-button] {
  background: var(--error-bg);
  border-color: var(--error-border);
  color: var(--error-text);
}

.sonner-loading-wrapper {
  --size: 16px;
  height: var(--size);
  width: var(--size);
  position: absolute;
  inset: 0;
  z-index: 10;
}

.sonner-loading-wrapper[data-visible='false'] {
  transform-origin: center;
  animation: sonner-fade-out 0.2s ease forwards;
}

.sonner-spinner {
  position: relative;
  top: 50%;
  left: 50%;
  height: var(--size);
  width: var(--size);
}

.sonner-loading-bar {
  animation: sonner-spin 1.2s linear infinite;
  background: var(--gray11);
  border-radius: 6px;
  height: 8%;
  left: -10%;
  position: absolute;
  top: -3.9%;
  width: 24%;
}

.sonner-loading-bar:nth-child(1) {
  animation-delay: -1.2s;
  transform: rotate(0.0001deg) translate(146%);
}

.sonner-loading-bar:nth-child(2) {
  animation-delay: -1.1s;
  transform: rotate(30deg) translate(146%);
}

.sonner-loading-bar:nth-child(3) {
  animation-delay: -1s;
  transform: rotate(60deg) translate(146%);
}

.sonner-loading-bar:nth-child(4) {
  animation-delay: -0.9s;
  transform: rotate(90deg) translate(146%);
}

.sonner-loading-bar:nth-child(5) {
  animation-delay: -0.8s;
  transform: rotate(120deg) translate(146%);
}

.sonner-loading-bar:nth-child(6) {
  animation-delay: -0.7s;
  transform: rotate(150deg) translate(146%);
}

.sonner-loading-bar:nth-child(7) {
  animation-delay: -0.6s;
  transform: rotate(180deg) translate(146%);
}

.sonner-loading-bar:nth-child(8) {
  animation-delay: -0.5s;
  transform: rotate(210deg) translate(146%);
}

.sonner-loading-bar:nth-child(9) {
  animation-delay: -0.4s;
  transform: rotate(240deg) translate(146%);
}

.sonner-loading-bar:nth-child(10) {
  animation-delay: -0.3s;
  transform: rotate(270deg) translate(146%);
}

.sonner-loading-bar:nth-child(11) {
  animation-delay: -0.2s;
  transform: rotate(300deg) translate(146%);
}

.sonner-loading-bar:nth-child(12) {
  animation-delay: -0.1s;
  transform: rotate(330deg) translate(146%);
}

@keyframes sonner-fade-in {
  0% {
    opacity: 0;
    transform: scale(0.8);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

@keyframes sonner-fade-out {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  100% {
    opacity: 0;
    transform: scale(0.8);
  }
}

@keyframes sonner-spin {
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0.15;
  }
}

@media (prefers-reduced-motion) {
  [data-sonner-toast],
  [data-sonner-toast] > *,
  .sonner-loading-bar {
    transition: none !important;
    animation: none !important;
  }
}

.sonner-loader {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  transform-origin: center;
  transition: opacity 200ms, transform 200ms;
}

.sonner-loader[data-visible='false'] {
  opacity: 0;
  transform: scale(0.8) translate(-50%, -50%);
}
</style>
