<template>
  <li
    :aria-live="toast.important ? 'assertive' : 'polite'"
    aria-atomic="true"
    role="status"
    tabindex="0"
    ref="toastRef"
    data-sonner-toast=""
    :class="toastClass"
    :data-styled="!Boolean(toast.component || toast?.unstyled || unstyled)"
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
    <template v-if="closeButton && !toast.component">
      <button
        :aria-label="closeButtonAriaLabel || 'Close toast'"
        :data-disabled="disabled"
        data-close-button
        :class="cn(classes?.closeButton, toast?.classes?.closeButton)"
        @click="handleCloseToast"
      >
        <CloseIcon />
      </button>
    </template>

    <template v-if="toast.component">
      <component
        :is="toast.component"
        v-bind="toast.componentProps"
        :onCloseToast="deleteToast"
      />
    </template>

    <template v-else>
      <template v-if="toastType !== 'default' || toast.icon || toast.promise">
        <div data-icon="">
          <template
            v-if="(toast.promise || toastType === 'loading') && !toast.icon"
          >
            <slot name="loading-icon" />
          </template>

          <component :is="toast.icon" v-if="toast.icon" />

          <template v-else>
            <slot name="success-icon" v-if="toastType === 'success'" />
            <slot name="error-icon" v-else-if="toastType === 'error'" />
            <slot name="warning-icon" v-else-if="toastType === 'warning'" />
            <slot name="info-icon" v-else-if="toastType === 'info'" />
          </template>
        </div>
      </template>

      <div data-content="">
        <div data-title="" :class="cn(classes?.title, toast.classes?.title)">
          <template v-if="isStringOfTitle">
            <component :is="toast.title" v-bind="toast.componentProps" />
          </template>
          <template v-else>
            {{ toast.title }}
          </template>
        </div>

        <template v-if="toast.description">
          <div
            data-description=""
            :class="
              cn(
                descriptionClass,
                toast.descriptionClass,
                classes?.description,
                toast.classes?.description
              )
            "
          >
            <template v-if="isStringOfDescription">
              <component
                :is="toast.description"
                v-bind="toast.componentProps"
              />
            </template>
            <template v-else>
              {{ toast.description }}
            </template>
          </div>
        </template>
      </div>
      <template v-if="toast.cancel">
        <button
          :class="cn(classes?.cancelButton, toast.classes?.cancelButton)"
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
          :class="cn(classes?.actionButton, toast.classes?.actionButton)"
          data-button
          @click="
            (event) => {
              toast.action?.onClick(event)
              if (event.defaultPrevented) return
              deleteToast()
            }
          "
        >
          {{ toast.action.label }}
        </button>
      </template>
    </template>
  </li>
</template>

<script lang="ts" setup>
import './styles.css'

import { computed, onMounted, onUnmounted, ref, watchEffect } from 'vue'
import type { ToastProps, HeightT, ToastT } from './types'
import CloseIcon from './assets/CloseIcon.vue'
import { useIsDocumentHidden } from './hooks'

// Default lifetime of a toasts (in ms)
const TOAST_LIFETIME = 4000

// Default gap between toasts
const GAP = 14

const SWIPE_THRESHOLD = 20

const TIME_BEFORE_UNMOUNT = 200

const emit = defineEmits<{
  (e: 'update:heights', heights: HeightT[]): void
  (e: 'removeToast', toast: ToastT): void
}>()

const props = defineProps<ToastProps>()

const mounted = ref(false)
const removed = ref(false)
const swiping = ref(false)
const swipeOut = ref(false)
const offsetBeforeRemove = ref(0)
const initialHeight = ref(0)
const dragStartTime = ref<Date | null>(null)
const toastRef = ref<HTMLLIElement | null>(null)
const isFront = computed(() => props.index === 0)
const isVisible = computed(() => props.index + 1 <= props.visibleToasts)
const toastType = computed(() => props.toast.type)
const dismissible = computed(() => props.toast.dismissible !== false)
const toastClass = computed(() => {
  return props.cn(
    props.classes?.toast,
    props.toast?.classes?.toast,
    props.classes?.default,
    props.classes?.[props.toast.type || 'default'],
    props.toast?.classes?.[props.toast.type || 'default']
  )
})

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
const isStringOfTitle = typeof props.toast.title !== 'string'
const isStringOfDescription = typeof props.toast.description !== 'string'

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
const disabled = computed(() => toastType.value === 'loading')

onMounted(() => {
  if (!mounted.value) return

  const toastNode = toastRef.value
  const originalHeight = toastNode?.style.height
  toastNode!.style.height = 'auto'
  const newHeight = toastNode!.getBoundingClientRect().height
  toastNode!.style.height = originalHeight as string

  initialHeight.value = newHeight

  let newHeightArr
  const alreadyExists = props.heights.find(
    (height) => height.toastId === props.toast.id
  )

  if (!alreadyExists) {
    newHeightArr = [
      {
        toastId: props.toast.id,
        height: newHeight,
        position: props.toast.position
      },
      ...props.heights
    ]
  } else {
    newHeightArr = props.heights.map((height) =>
      height.toastId === props.toast.id
        ? { ...height, height: newHeight }
        : height
    )
  }

  emit('update:heights', newHeightArr as HeightT[])
})

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

const handleCloseToast = () => {
  if (disabled.value || !dismissible.value) {
    return
  }

  deleteToast()
  props.toast.onDismiss?.(props.toast)
}

const onPointerDown = (event: PointerEvent) => {
  if (disabled.value || !dismissible.value) return
  dragStartTime.value = new Date()
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

  const timeTaken = new Date().getTime() - dragStartTime!.value!.getTime()
  const velocity = Math.abs(swipeAmount) / timeTaken

  // Remove only if treshold is met
  if (Math.abs(swipeAmount) >= SWIPE_THRESHOLD || velocity > 0.11) {
    offsetBeforeRemove.value = offset.value
    props.toast.onDismiss?.(props.toast)
    deleteToast()
    swipeOut.value = true
    return
  }

  toastRef.value?.style.setProperty('--swipe-amount', '0px')
  swiping.value = false
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
    (props.toast.promise && toastType.value === 'loading') ||
    props.toast.duration === Infinity ||
    props.toast.type === 'loading'
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
