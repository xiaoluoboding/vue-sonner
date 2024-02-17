<template>
  <li
    :aria-live="toast.important ? 'assertive' : 'polite'"
    aria-atomic
    role="status"
    tabindex="0"
    ref="toastRef"
    data-sonner-toast=""
    :class="toastClass"
    :data-styled="!isTitleComponent"
    :data-mounted="mounted"
    :data-promise="Boolean(toast.promise)"
    :data-removed="removed"
    :data-visible="isVisible"
    :data-y-position="y"
    :data-x-position="x"
    :data-index="index"
    :data-front="isFront"
    :data-swiping="swiping"
    :data-dismissible="dismissible"
    :data-type="toastType"
    :data-invert="invert"
    :data-swipe-out="swipeOut"
    :data-expanded="Boolean(expanded || (expandByDefault && mounted))"
    :style="{
      '--index': index,
      '--toasts-before': index,
      '--z-index': toasts.length - index,
      '--offset': `${removed ? offsetBeforeRemove : offset}px`,
      '--initial-height': expandByDefault ? 'auto' : `${initialHeight}px`,
      ...style,
      ...toastStyle
    }"
    @pointerdown="onPointerDown"
    @pointerup="onPointerUp"
    @pointermove="onPointerMove"
  >
    <template v-if="closeButton && !isTitleComponent">
      <button
        :aria-label="closeButtonAriaLabel || 'Close toast'"
        :data-disabled="disabled"
        data-close-button
        :class="cn(classNames?.closeButton, toast?.classNames?.closeButton)"
        @click="handleCloseToast"
      >
        <CloseIcon />
      </button>
    </template>

    <template v-if="toastType || toast.icon || toast.promise">
      <div data-icon="">
        <template
          v-if="typeof toast.promise === 'function' || toastType === 'loading'"
        >
          <Loader
            :visible="promiseStatus === 'loading' || toastType === 'loading'"
          />
        </template>
        <SuccessIcon v-if="iconType === 'success'" />
        <InfoIcon v-else-if="iconType === 'info'" />
        <WarningIcon v-else-if="iconType === 'warning'" />
        <ErrorIcon v-else-if="iconType === 'error'" />
      </div>
    </template>

    <div data-content="">
      <div data-title="">
        <template v-if="typeof toast.title === 'string'">
          {{ toast.title }}
        </template>
        <template v-else-if="toast.title === undefined || toast.title === null">
          {{ promiseTitle }}
        </template>
        <template v-else-if="isTitleComponent">
          <component
            :is="toast.title"
            @closeToast="
              () => {
                deleteToast()
                if (toast.cancel?.onClick) {
                  toast.cancel.onClick()
                }
              }
            "
          />
        </template>
      </div>
      <template v-if="toast.description">
        <div
          data-description=""
          :class="descriptionClass + toastDescriptionClass"
        >
          {{ toast.description }}
        </div>
      </template>
    </div>
    <template v-if="toast.cancel">
      <button
        data-button
        data-cancel
        @click="
          () => {
            deleteToast()
            if (toast.cancel?.onClick) {
              toast.cancel.onClick()
            }
          }
        "
      >
        {{ toast.cancel.label }}
      </button>
    </template>
    <template v-if="toast.action">
      <button
        data-button
        @click="
          () => {
            deleteToast()
            toast.action?.onClick()
          }
        "
      >
        {{ toast.action.label }}
      </button>
    </template>
  </li>
</template>

<script lang="ts" setup>
import './styles.css'

import type { CSSProperties, Component } from 'vue'
import { computed, onMounted, onUnmounted, ref, watchEffect } from 'vue'
import Loader from './assets/Loader.vue'
import type {
  CnFunction,
  HeightT,
  Position,
  PromiseData,
  ToastClassnames,
  ToastT
} from './types'
import SuccessIcon from './assets/SuccessIcon.vue'
import InfoIcon from './assets/InfoIcon.vue'
import WarningIcon from './assets/WarningIcon.vue'
import ErrorIcon from './assets/ErrorIcon.vue'
import CloseIcon from './assets/CloseIcon.vue'
import { useIsDocumentHidden } from './hooks'

interface ToastProps {
  toast: ToastT
  toasts: ToastT[]
  index: number
  expanded: boolean
  invert: boolean
  heights: HeightT[]
  gap?: number
  position: Position
  visibleToasts: number
  expandByDefault: boolean
  closeButton: boolean
  interacting: boolean
  duration?: number
  descriptionClass?: string
  style?: CSSProperties
  cancelButtonStyle?: CSSProperties
  actionButtonStyle?: CSSProperties
  unstyled?: boolean
  descriptionClassName?: string
  classNames?: ToastClassnames
  // icons?: ToastIcons;
  closeButtonAriaLabel?: string
  pauseWhenPageIsHidden: boolean
  cn: CnFunction
}

// Default lifetime of a toasts (in ms)
const TOAST_LIFETIME = 4000

// Default gap between toasts
const GAP = 14

const SWIPE_TRESHOLD = 20

const TIME_BEFORE_UNMOUNT = 200

const isPromise = (toast: ToastT): toast is PromiseData & { id: number } =>
  Boolean(toast.promise)

const emit = defineEmits<{
  (e: 'update:heights', heights: HeightT[]): void
  (e: 'removeToast', toast: ToastT): void
}>()

const props = defineProps<ToastProps>()

const mounted = ref(false)
const removed = ref(false)
const swiping = ref(false)
const swipeOut = ref(false)
const promiseStatus = ref<'loading' | 'success' | 'error' | null>(null)
const offsetBeforeRemove = ref(0)
const initialHeight = ref(0)
const promiseResult = ref<string | Component | null>(null)
const toastRef = ref<HTMLLIElement | null>(null)
const isFront = computed(() => props.index === 0)
const isVisible = computed(() => props.index + 1 <= props.visibleToasts)
const toastType = computed(() => props.toast.type)
const dismissible = computed(() => props.toast.dismissible !== false)
const toastClass = computed(() => {
  return props.cn(
    props.classNames?.toast,
    props.toast?.classNames?.toast,
    props.classNames?.default,
    props.classNames?.[props.toast.type || 'default'],
    props.toast?.classNames?.[props.toast.type || 'default']
  )
})
const toastDescriptionClass = props.toast.descriptionClassName || ''
const toastStyle = props.toast.style || {}

// Height index is used to calculate the offset as it gets updated before the toast array, which means we can calculate the new layout faster.
const heightIndex = computed(
  () =>
    props.heights.findIndex((height) => height.toastId === props.toast.id) || 0
)
const closeButton = computed(() => props.toast.closeButton ?? props.closeButton)
const duration = computed(
  () => props.toast.duration || props.duration || TOAST_LIFETIME
)

const closeTimerStartTimeRef = ref(0)
const offset = ref(0)
const remainingTime = ref(duration.value)
const lastCloseTimerStartTimeRef = ref(0)
const pointerStartRef = ref<{ x: number; y: number } | null>(null)
const coords = computed(() => props.position.split('-'))
const y = computed(() => coords.value[0])
const x = computed(() => coords.value[1])

const toastsHeightBefore = computed(() => {
  return props.heights.reduce((prev, curr, reducerIndex) => {
    // Calculate offset up untill current  toast
    if (reducerIndex >= heightIndex.value) {
      return prev
    }

    return prev + curr.height
  }, 0)
})
const isDocumentHidden = useIsDocumentHidden()
const invert = computed(() => props.toast.invert || props.invert)
const disabled = computed(() => promiseStatus.value === 'loading')
const iconType = computed(
  () => promiseStatus.value ?? (props.toast.type || null)
)

const isTitleComponent = computed(() => {
  return !isPromise(props.toast) && typeof props.toast.title === 'object'
})

const promiseTitle = computed(() => {
  if (!isPromise(props.toast)) return null

  switch (promiseStatus.value) {
    case 'loading':
      return props.toast.loading
    case 'success':
      return typeof props.toast.success === 'function'
        ? promiseResult.value
        : props.toast.success
    case 'error':
      return typeof props.toast.error === 'function'
        ? promiseResult.value
        : props.toast.error
    default:
      return null
  }
})

const handleCloseToast = () => {
  if (!disabled.value || dismissible.value) {
    deleteToast()
    props.toast.onDismiss?.(props.toast)
  }
}

const deleteToast = () => {
  // Save the offset for the exit swipe animation
  removed.value = true
  offsetBeforeRemove.value = offset.value
  const newHeights = props.heights.filter(
    (height) => height.toastId !== props.toast.id
  )
  emit('update:heights', newHeights)

  setTimeout(() => {
    emit('removeToast', props.toast)
  }, TIME_BEFORE_UNMOUNT)
}

const onPointerDown = (event: PointerEvent) => {
  if (disabled) return
  offsetBeforeRemove.value = offset.value
  // Ensure we maintain correct pointer capture even when going outside of the toast (e.g. when swiping)
  ;(event.target as HTMLElement).setPointerCapture(event.pointerId)
  if ((event.target as HTMLElement).tagName === 'BUTTON') return
  swiping.value = true
  pointerStartRef.value = { x: event.clientX, y: event.clientY }
}

const onPointerUp = (event: PointerEvent) => {
  if (swipeOut.value) return
  pointerStartRef.value = null

  const swipeAmount = Number(
    toastRef.value?.style
      .getPropertyValue('--swipe-amount')
      .replace('px', '') || 0
  )

  // Remove only if treshold is met
  if (Math.abs(swipeAmount) >= SWIPE_TRESHOLD) {
    offsetBeforeRemove.value = offset.value
    props.toast.onDismiss?.(props.toast)
    deleteToast()
    swipeOut.value = true
    return
  }

  toastRef.value?.style.setProperty('--swipe-amount', '0px')
  swiping.value = true
}

const onPointerMove = (event: PointerEvent) => {
  if (!pointerStartRef.value) return

  const yPosition = event.clientY - pointerStartRef.value.y
  const xPosition = event.clientX - pointerStartRef.value.x

  const clamp = coords.value[0] === 'top' ? Math.min : Math.max
  const clampedY = clamp(0, yPosition)
  const swipeStartThreshold = event.pointerType === 'touch' ? 10 : 2
  const isAllowedToSwipe = Math.abs(clampedY) > swipeStartThreshold

  if (isAllowedToSwipe) {
    toastRef.value?.style.setProperty('--swipe-amount', `${yPosition}px`)
  } else if (Math.abs(xPosition) > swipeStartThreshold) {
    // User is swiping in wrong direction so we disable swipe gesture
    // for the current pointer down interaction
    pointerStartRef.value = null
  }
}

watchEffect(() => {
  offset.value = heightIndex.value * GAP + toastsHeightBefore.value
})

watchEffect((onInvalidate) => {
  if (
    (props.toast.promise && promiseStatus.value === 'loading') ||
    props.toast.duration === Infinity
  )
    return
  let timeoutId: ReturnType<typeof setTimeout>

  // Pause the timer on each hover
  const pauseTimer = () => {
    if (lastCloseTimerStartTimeRef.value < closeTimerStartTimeRef.value) {
      // Get the elapsed time since the timer started
      const elapsedTime = new Date().getTime() - closeTimerStartTimeRef.value

      remainingTime.value = remainingTime.value - elapsedTime
    }

    lastCloseTimerStartTimeRef.value = new Date().getTime()
  }

  const startTimer = () => {
    closeTimerStartTimeRef.value = new Date().getTime()
    // Let the toast know it has started
    timeoutId = setTimeout(() => {
      props.toast.onAutoClose?.(props.toast)
      deleteToast()
    }, remainingTime.value)
  }

  if (
    props.expanded ||
    props.interacting ||
    (props.pauseWhenPageIsHidden && isDocumentHidden)
  ) {
    pauseTimer()
  } else {
    startTimer()
  }

  onInvalidate(() => {
    clearTimeout(timeoutId)
  })
})

watchEffect(() => {
  if (props.toast.delete) {
    deleteToast()
  }
})

onMounted(() => {
  if (toastRef.value) {
    const height = toastRef.value.getBoundingClientRect().height
    // Add toast height tot heights array after the toast is mounted
    initialHeight.value = height

    const newHeights = [
      { toastId: props.toast.id, height, position: props.toast.position! },
      ...props.heights
    ]
    emit('update:heights', newHeights)
  }
  mounted.value = true
})

onUnmounted(() => {
  if (toastRef.value) {
    const newHeights = props.heights.filter(
      (height) => height.toastId !== props.toast.id
    )
    emit('update:heights', newHeights)
  }
})
</script>
