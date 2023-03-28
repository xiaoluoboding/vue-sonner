<template>
  <li
    :aria-live="toast.important ? 'assertive' : 'polite'"
    aria-atomic
    role="status"
    tabindex="0"
    ref="toastRef"
    data-sonner-toast=""
    :class="toastClass"
    :data-styled="!Boolean(toast.jsx)"
    :data-mounted="mounted"
    :data-promise="Boolean(toast.promise)"
    :data-removed="removed"
    :data-visible="isVisible"
    :data-y-position="coords[0]"
    :data-x-position="coords[1]"
    :data-index="props.index"
    :data-front="isFront"
    :data-swiping="swiping"
    :data-type="
      promiseStatus !== 'loading' && promiseStatus ? promiseStatus : toastType
    "
    :data-invert="invert"
    :data-swipe-out="swipeOut"
    :data-expanded="
      Boolean(props.expanded || (props.expandByDefault && mounted))
    "
    :style="{
      '--index': props.index,
      '--toasts-before': props.index,
      '--z-index': toasts.length - props.index,
      '--offset': `${removed ? offsetBeforeRemove : offset}px`,
      '--initial-height': props.expandByDefault ? 'auto' : `${initialHeight}px`,
      ...toast
    }"
    @pointerdown="onPointerDown"
    @pointerup="onPointerUp"
    @pointermove="onPointerMove"
  >
    <template v-if="props.closeButton && !toast.jsx">
      <button
        aria-label="Close toast"
        :data-disabled="disabled"
        data-close-button
        @click="handleCloseToast"
      >
        <CloseIcon />
      </button>
    </template>

    <template v-if="toastType || toast.icon || toast.promise">
      <div data-icon="">
        <template v-if="typeof toast.promise === 'function'">
          <Loader :visible="promiseStatus === 'loading'" />
        </template>
        <!-- <template v-if="toast.icon">
          <component :is="toast.icon" />
        </template> -->
        <SuccessIcon v-if="iconType === 'success'" />
        <ErrorIcon v-if="iconType === 'error'" />
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
        <template v-else>
          <component :is="toast.title" />
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
        data-button=""
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
import type { Component, PropType } from 'vue'
import {
  computed,
  onMounted,
  onUnmounted,
  ref,
  watchEffect,
  shallowRef
} from 'vue'
import './styles.css'
import Loader from './assets/Loader.vue'
import { HeightT, Position, PromiseData, ToastT } from './types'
import SuccessIcon from './assets/SuccessIcon.vue'
// import InfoIcon from '../assets/InfoIcon.vue'
import ErrorIcon from './assets/ErrorIcon.vue'
import CloseIcon from './assets/CloseIcon.vue'
// Default lifetime of a toasts (in ms)
const TOAST_LIFETIME = 4000

// Default gap between toasts
const GAP = 14

const SWIPE_TRESHOLD = 20

const TIME_BEFORE_UNMOUNT = 200

const isPromise = (toast: ToastT): toast is PromiseData & { id: number } =>
  Boolean(toast.promise)

const props = defineProps({
  toast: {
    type: Object as PropType<ToastT>,
    required: true
  },
  toasts: {
    type: Array as PropType<ToastT[]>,
    required: true
  },
  index: {
    type: Number,
    required: true
  },
  expanded: {
    type: Boolean,
    required: true
  },
  invert: {
    type: Boolean,
    required: true
  },
  heights: {
    type: Array as PropType<HeightT[]>,
    required: true
  },
  setHeights: {
    type: Function,
    required: true
  },
  removeToast: {
    type: Function as PropType<(toast: ToastT) => void>,
    required: true
  },
  position: {
    type: String as PropType<Position>,
    required: true
  },
  visibleToasts: {
    type: Number,
    required: true
  },
  expandByDefault: {
    type: Boolean,
    required: true
  },
  closeButton: {
    type: Boolean,
    required: true
  },
  interacting: {
    type: Boolean,
    required: true
  },
  duration: {
    type: Number,
    required: false
  },
  descriptionClass: {
    type: String,
    required: false
  }
})

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
const toastClass = props.toast.className || ''
const toastDescriptionClass = props.toast.descriptionClassName || ''

// Height index is used to calculate the offset as it gets updated before the toast array, which means we can calculate the new layout faster.
const heightIndex = computed(
  () =>
    props.heights.findIndex((height) => height.toastId === props.toast.id) || 0
)
const duration = computed(
  () => props.toast.duration || props.duration || TOAST_LIFETIME
)

const closeTimerStartTimeRef = ref(0)
const offset = ref(0)
const closeTimerRemainingTimeRef = ref(duration)
const lastCloseTimerStartTimeRef = ref(0)
const pointerStartYRef = ref<number | null>(null)
const coords = computed(() => props.position.split('-'))

const toastsHeightBefore = computed(() => {
  return props.heights.reduce((prev, curr, reducerIndex) => {
    // Calculate offset up untill current  toast
    if (reducerIndex >= heightIndex.value) {
      return prev
    }

    return prev + curr.height
  }, 0)
})
const invert = computed(() => props.toast.invert || props.invert)
const disabled = computed(() => promiseStatus.value === 'loading')
const iconType = computed(
  () => promiseStatus.value ?? (props.toast.type || null)
)

const componentTitle = computed(() => {
  return typeof props.toast.title === 'string' && !isPromise(props.toast)
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

onMounted(() => (mounted.value = true))

watchEffect(() => {
  offset.value = heightIndex.value * GAP + toastsHeightBefore.value
})

watchEffect(() => {
  if (props.toast && isPromise(props.toast)) {
    const toastInstance = props.toast
    promiseStatus.value = 'loading'
    const promiseHandler = (promise: Promise<any>) => {
      promise
        .then((data) => {
          if (
            toastInstance.success &&
            typeof toastInstance.success === 'function'
          ) {
            promiseResult.value = toastInstance.success(data)
          }
          promiseStatus.value = 'success'
        })
        .catch((error) => {
          if (
            toastInstance.error &&
            typeof toastInstance.error === 'function'
          ) {
            promiseResult.value = toastInstance.error(error)
          }
          promiseStatus.value = 'error'
        })
    }

    // console.group('Toast begin')
    // console.log(isPromise(props.toast))
    // console.log(props.toast)
    // console.log(props.toast.promise instanceof Promise)
    // console.log(typeof props.toast.promise === 'function')
    // console.groupEnd()

    if (props.toast.promise instanceof Promise) {
      promiseHandler(props.toast.promise as any)
    } else if (typeof props.toast.promise === 'function') {
      promiseHandler(props.toast?.promise?.())
    }
  }
})

function handleCloseToast() {
  if (!disabled.value) {
    deleteToast()
    props.toast.onDismiss?.(props.toast)
  }
}

function deleteToast() {
  // Save the offset for the exit swipe animation
  removed.value = true
  offsetBeforeRemove.value = offset.value
  // emit('update:heights', props.heights.filter((height) => height.toastId !== props.toast.id))
  props.setHeights(
    props.heights.filter((height) => height.toastId !== props.toast.id)
  )

  setTimeout(() => {
    props.removeToast(props.toast)
  }, TIME_BEFORE_UNMOUNT)
}

const onPointerDown = (event: PointerEvent) => {
  if (disabled) return
  offsetBeforeRemove.value = offset.value
  // Ensure we maintain correct pointer capture even when going outside of the toast (e.g. when swiping)
  ;(event.target as HTMLElement).setPointerCapture(event.pointerId)
  if ((event.target as HTMLElement).tagName === 'BUTTON') return
  swiping.value = true
  pointerStartYRef.value = event.clientY
}

const onPointerUp = (event: PointerEvent) => {
  if (swipeOut.value) return
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
  pointerStartYRef.value = null
  swiping.value = true
}

const onPointerMove = (event: PointerEvent) => {
  if (!pointerStartYRef.value) return

  const yPosition = event.clientY - pointerStartYRef.value

  const isAllowedToSwipe =
    coords.value[0] === 'top' ? yPosition < 0 : yPosition > 0
  // We don't want to swipe to the left and vice versa depending on toast position
  if (!isAllowedToSwipe) {
    toastRef.value?.style.setProperty('--swipe-amount', '0px')
    return
  }

  toastRef.value?.style.setProperty('--swipe-amount', `${yPosition}px`)
}

watchEffect((onInvalidate) => {
  if (
    (props.toast.promise && promiseStatus.value === 'loading') ||
    props.toast.duration === Infinity
  )
    return
  let timeoutId: NodeJS.Timeout

  // Pause the timer on each hover
  const pauseTimer = () => {
    if (lastCloseTimerStartTimeRef.value < closeTimerStartTimeRef.value) {
      // Get the elapsed time since the timer started
      const elapsedTime = new Date().getTime() - closeTimerStartTimeRef.value

      // @ts-expect-error: TODO: Yes
      closeTimerRemainingTimeRef.value =
        closeTimerRemainingTimeRef.value - elapsedTime
    }

    lastCloseTimerStartTimeRef.value = new Date().getTime()
  }

  const startTimer = () => {
    closeTimerStartTimeRef.value = new Date().getTime()
    // Let the toast know it has started
    timeoutId = setTimeout(() => {
      props.toast.onAutoClose?.(props.toast)
      deleteToast()
    }, closeTimerRemainingTimeRef.value)
  }

  if (props.expanded || props.interacting) {
    pauseTimer()
  } else {
    startTimer()
  }

  onInvalidate(() => {
    clearTimeout(timeoutId)
  })
})

onMounted(() => {
  if (toastRef.value) {
    const height = toastRef.value.getBoundingClientRect().height
    // Add toast height tot heights array after the toast is mounted
    initialHeight.value = height
    // emit('update:heights', [{ toastId: props.toast.id, height }, ...props.heights])
    props.setHeights([{ toastId: props.toast.id, height }, ...props.heights])
  }
})

onUnmounted(() => {
  if (toastRef.value) {
    // emit('update:heights', props.heights.filter((height) => height.toastId !== props.toast.id))
    props.setHeights(
      props.heights.filter((height) => height.toastId !== props.toast.id)
    )
  }
})

watchEffect(() => {
  if (props.toast.delete) {
    deleteToast()
  }
})
</script>
