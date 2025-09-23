<template>
  <li
    tabindex="0"
    ref="toastRef"
    :class="
      cn(
        props.class,
        toastClass,
        classes?.toast,
        toast.classes?.toast,
        // @ts-ignore
        classes?.[toastType],
        // @ts-ignore
        toast?.classes?.[toastType],
      )
    "
    data-sonner-toast=""
    :data-rich-colors="toast.richColors ?? defaultRichColors"
    :data-styled="!Boolean(toast.component || toast?.unstyled || unstyled)"
    :data-mounted="mounted"
    :data-promise="Boolean(toast.promise)"
    :data-swiped="swiped"
    :data-removed="removed"
    :data-visible="isVisible"
    :data-y-position="y"
    :data-x-position="x"
    :data-index="index"
    :data-front="isFront"
    :data-swiping="swiping"
    :data-dismissible="dismissible"
    :data-type="toastType"
    :data-invert="toast.invert || invert"
    :data-swipe-out="swipeOut"
    :data-swipe-direction="swipeOutDirection"
    :data-expanded="Boolean(expanded || (expandByDefault && mounted))"
    :data-testid="toast.testId"
    :style="{
      '--index': index,
      '--toasts-before': index,
      '--z-index': toasts.length - index,
      '--offset': `${removed ? offsetBeforeRemove : offset}px`,
      '--initial-height': expandByDefault ? 'auto' : `${initialHeight}px`,
      ...style,
      ...props.toast.style,
    }"
    @dragend="handleDragEnd"
    @pointerdown="onPointerDown"
    @pointerup="onPointerUp"
    @pointermove="onPointerMove"
  >
    <template v-if="closeButton && !toast.component && toastType !== 'loading'">
      <button
        :aria-label="closeButtonAriaLabel || 'Close toast'"
        :data-disabled="disabled"
        data-close-button="true"
        :data-close-button-position="closeButtonPosition"
        :class="cn(classes?.closeButton, toast?.classes?.closeButton)"
        @click="handleCloseToast"
      >
        <template v-if="icons?.close">
          <component :is="icons?.close" />
        </template>
        <template v-else>
          <slot name="close-icon" />
        </template>
      </button>
    </template>

    <template v-if="toast.component">
      <component
        :is="toast.component"
        v-bind="toast.componentProps"
        :onCloseToast="handleCloseToast"
        :isPaused="$props.expanded || $props.interacting || isDocumentHidden"
      />
    </template>

    <template v-else>
      <template v-if="toastType !== 'default' || toast.icon || toast.promise">
        <div data-icon="" :class="cn(classes?.icon, toast?.classes?.icon)">
          <component :is="toast.icon" v-if="toast.icon" />
          <template v-else>
            <slot v-if="toastType === 'loading'" name="loading-icon" />
            <slot v-else-if="toastType === 'success'" name="success-icon" />
            <slot v-else-if="toastType === 'error'" name="error-icon" />
            <slot v-else-if="toastType === 'warning'" name="warning-icon" />
            <slot v-else-if="toastType === 'info'" name="info-icon" />
          </template>
        </div>
      </template>

      <div data-content="" :class="cn(classes?.content, toast?.classes?.content)">
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
                toastDescriptionClass,
                classes?.description,
                toast.classes?.description,
              )
            "
          >
            <template v-if="isStringOfDescription">
              <component :is="toast.description" v-bind="toast.componentProps" />
            </template>
            <template v-else>
              {{ toast.description }}
            </template>
          </div>
        </template>
      </div>
      <template v-if="toast.cancel">
        <button
          :style="toast.cancelButtonStyle || cancelButtonStyle"
          :class="cn(classes?.cancelButton, toast.classes?.cancelButton)"
          data-button
          data-cancel
          @click="
            (event) => {
              if (!isAction(toast.cancel!)) return;
              if (!dismissible) return;
              toast.cancel.onClick?.(event);
              deleteToast();
            }
"
        >
          {{ isAction(toast.cancel) ? toast.cancel?.label : toast.cancel }}
        </button>
      </template>
      <template v-if="toast.action">
        <button
          :style="toast.actionButtonStyle || actionButtonStyle"
          :class="cn(classes?.actionButton, toast.classes?.actionButton)"
          data-button
          data-action
          @click="
            (event) => {
              if (!isAction(toast.action!)) return;
              toast.action.onClick?.(event);
              if (event.defaultPrevented) return;
              deleteToast();
            }
          "
        >
          {{ isAction(toast.action) ? toast.action?.label : toast.action }}
        </button>
      </template>
    </template>
  </li>
</template>

<script lang="ts" setup>
import {
  computed,
  onBeforeUnmount,
  onMounted,
  ref,
  watch,
  watchEffect,
  nextTick
} from 'vue'
import { type HeightT, type ToastProps, type ToastT, isAction } from './types'
import { useIsDocumentHidden, cn, getDefaultSwipeDirections } from './hooks'
import { SWIPE_THRESHOLD, TIME_BEFORE_UNMOUNT, TOAST_LIFETIME } from './constant';

const props = defineProps<ToastProps>()

const emit = defineEmits<{
  (e: 'update:heights', heights: HeightT[]): void
  (e: 'update:height', height: HeightT): void
  (e: 'removeToast', toast: ToastT): void
}>()


// State
const swipeDirection = ref<'x' | 'y' | null>(null);
const swipeOutDirection = ref<'left' | 'right' | 'up' | 'down' | null>(null);
const mounted = ref(false)
const removed = ref(false)
const swiping = ref(false)
const swipeOut = ref(false)
const swiped = ref(false)
const offsetBeforeRemove = ref(0)
const initialHeight = ref(0)
const remainingTime = ref(
  props.toast.duration || props.duration || TOAST_LIFETIME
)
const dragStartTime = ref<Date | null>(null)
const toastRef = ref<HTMLLIElement | null>(null)
const isFront = computed(() => props.index === 0)
const isVisible = computed(() => props.index + 1 <= props.visibleToasts)
const toastType = computed(() => props.toast.type)
const dismissible = computed(() => props.toast.dismissible !== false)
const toastClass = computed(() => props.toast.class || '')
const toastDescriptionClass = computed(() => props.descriptionClass || '')

const heightIndex = computed(() => {
  // Only calculate the index of toasts in the same position
  const currentPosition = props.toast.position || props.position
  const samePositionHeights = props.heights.filter(h => h.position === currentPosition)
  const index = samePositionHeights.findIndex((height) => height.toastId === props.toast.id)
  return index >= 0 ? index : 0
})

const toastsHeightBefore = computed(() => {
  // Only calculate the height of toasts in the same position and before the current toast
  const currentPosition = props.toast.position || props.position
  const samePositionHeights = props.heights.filter(h => h.position === currentPosition)
  
  return samePositionHeights.reduce((prev, curr, reducerIndex) => {
    // Calculate offset up until current toast
    if (reducerIndex >= heightIndex.value) {
      return prev
    }

    return prev + curr.height
  }, 0)
})

const offset = computed(() => heightIndex.value * props.gap! + toastsHeightBefore.value || 0)

const closeButton = computed(() => props.toast.closeButton ?? props.closeButton)
const duration = computed(
  () => props.toast.duration || props.duration || TOAST_LIFETIME
)

const closeTimerStartTimeRef = ref(0)
const lastCloseTimerStartTimeRef = ref(0)
const pointerStartRef = ref<{ x: number; y: number } | null>(null)
const coords = computed(() => props.position.split('-'))
const y = computed(() => coords.value[0])
const x = computed(() => coords.value[1])
const isStringOfTitle = computed(() => typeof props.toast.title !== 'string')
const isStringOfDescription = computed(() => typeof props.toast.description !== 'string')
const { isDocumentHidden } = useIsDocumentHidden()
const disabled = computed(() => toastType.value && toastType.value === 'loading')

onMounted(() => {
  mounted.value = true
  remainingTime.value = duration.value
})

// Use watchEffect to monitor mounted state changes and ensure height calculation after DOM rendering
watchEffect(async () => {
  if (!mounted.value || !toastRef.value) return

  // Wait for DOM update to complete
  await nextTick()
  
  const toastNode = toastRef.value
  const originalHeight = toastNode.style.height
  toastNode.style.height = 'auto'
  const newHeight = toastNode.getBoundingClientRect().height
  toastNode.style.height = originalHeight as string

  initialHeight.value = newHeight

  // Simplified: only report current toast's height information
  emit('update:height', {
    toastId: props.toast.id,
    height: newHeight,
    position: props.toast.position || props.position
  })
})

function deleteToast() {
  // Save the offset for the exit swipe animation
  removed.value = true
  offsetBeforeRemove.value = offset.value
  
  // No longer directly manipulate heights array, let Toaster component handle it uniformly after receiving removeToast event
  setTimeout(() => {
    emit('removeToast', props.toast)
  }, TIME_BEFORE_UNMOUNT)
}

function handleCloseToast() {
  if (disabled.value || !dismissible.value) return {}
  deleteToast()
  props.toast.onDismiss?.(props.toast)
}

function onPointerDown(event: PointerEvent) {
  if (event.button === 2) return; // Return early on right click
  if (disabled.value || !dismissible.value) return;
  dragStartTime.value = new Date();
  offsetBeforeRemove.value = offset.value;
  // Ensure we maintain correct pointer capture even when going outside of the toast (e.g. when swiping)
  (event.target as HTMLElement).setPointerCapture(event.pointerId);
  if ((event.target as HTMLElement).tagName === 'BUTTON') return;
  swiping.value = true;
  pointerStartRef.value = { x: event.clientX, y: event.clientY };
}

function onPointerUp() {
  if (swipeOut.value || !dismissible.value) return
  pointerStartRef.value = null

  const swipeAmountX = Number(
    toastRef.value?.style.getPropertyValue('--swipe-amount-x').replace('px', '') || 0,
  );
  const swipeAmountY = Number(
    toastRef.value?.style.getPropertyValue('--swipe-amount-y').replace('px', '') || 0,
  );
  const timeTaken = new Date().getTime() - (dragStartTime.value?.getTime() || 0);

  const swipeAmount = swipeDirection.value === 'x' ? swipeAmountX : swipeAmountY;
  const velocity = Math.abs(swipeAmount) / timeTaken;

  if (Math.abs(swipeAmount) >= SWIPE_THRESHOLD || velocity > 0.11) {
    offsetBeforeRemove.value = offset.value

    props.toast.onDismiss?.(props.toast);

    if (swipeDirection.value === 'x') {
      swipeOutDirection.value = swipeAmountX > 0 ? 'right' : 'left';

    } else {
      swipeOutDirection.value = swipeAmountY > 0 ? 'down' : 'up';
    }

    deleteToast();
    swipeOut.value = true;

    return;
  } else {
    toastRef.value?.style.setProperty('--swipe-amount-x', `0px`);
    toastRef.value?.style.setProperty('--swipe-amount-y', `0px`);
  }
  swiped.value = false;
  swiping.value = false;
  swipeDirection.value = null;
}

function onPointerMove(event: PointerEvent) {
  if (!pointerStartRef.value || !dismissible.value) return

  const isHighlighted = window?.getSelection()?.toString()?.length ?? 0 > 0

  if (isHighlighted) return;

  const yDelta = event.clientY - pointerStartRef.value.y;
  const xDelta = event.clientX - pointerStartRef.value.x;

  const swipeDirections = props.swipeDirections ?? getDefaultSwipeDirections(props.position);

  if (!swipeDirection.value && (Math.abs(xDelta) > 1 || Math.abs(yDelta) > 1)) {
    swipeDirection.value = Math.abs(xDelta) > Math.abs(yDelta) ? 'x' : 'y';
  }

  let swipeAmount = { x: 0, y: 0 };

  const getDampening = (delta: number) => {
    const factor = Math.abs(delta) / 20;

    return 1 / (1.5 + factor);
  }

  // Only apply swipe in the locked direction
  if (swipeDirection.value === 'y') {
    // Handle vertical swipes
    if (swipeDirections.includes('top') || swipeDirections.includes('bottom')) {
      if ((swipeDirections.includes('top') && yDelta < 0) || (swipeDirections.includes('bottom') && yDelta > 0)) {
        swipeAmount.y = yDelta;
      } else {
        // Smoothly transition to dampened movement
        const dampenedDelta = yDelta * getDampening(yDelta);
        // Ensure we don't jump when transitioning to dampened movement
        swipeAmount.y = Math.abs(dampenedDelta) < Math.abs(yDelta) ? dampenedDelta : yDelta;
      }
    }
  } else if (swipeDirection.value === 'x') {
    // Handle horizontal swipes
    if (swipeDirections.includes('left') || swipeDirections.includes('right')) {
      if ((swipeDirections.includes('left') && xDelta < 0) || (swipeDirections.includes('right') && xDelta > 0)) {
        swipeAmount.x = xDelta;
      } else {
        // Smoothly transition to dampened movement
        const dampenedDelta = xDelta * getDampening(xDelta);
        // Ensure we don't jump when transitioning to dampened movement
        swipeAmount.x = Math.abs(dampenedDelta) < Math.abs(xDelta) ? dampenedDelta : xDelta;
      }
    }
  }

  if (Math.abs(swipeAmount.x) > 0 || Math.abs(swipeAmount.y) > 0) {
    swiped.value = true;
  }

  // Apply transform using both x and y values
  toastRef.value?.style.setProperty('--swipe-amount-x', `${swipeAmount.x}px`);
  toastRef.value?.style.setProperty('--swipe-amount-y', `${swipeAmount.y}px`);
}

// Lifecycle hooks
onMounted(() => {
  mounted.value = true

  if (!toastRef.value) return

  const height = toastRef.value.getBoundingClientRect().height
  initialHeight.value = height

  const newHeights = [
    { toastId: props.toast.id, height, position: props.toast.position! },
    ...props.heights
  ]
  emit('update:heights', newHeights)
})

onBeforeUnmount(() => {
  // Notify Toaster to remove corresponding height record when component unmounts
  if (toastRef.value) {
    emit('removeToast', props.toast)
  }
})

// Watchers
watchEffect((onInvalidate) => {
  if (
    (props.toast.promise && toastType.value === 'loading') ||
    props.toast.duration === Infinity ||
    props.toast.type === 'loading'
  ) {
    return
  }

  let timeoutId: ReturnType<typeof setTimeout>

  const pauseTimer = () => {
    if (lastCloseTimerStartTimeRef.value < closeTimerStartTimeRef.value) {
      const elapsedTime = new Date().getTime() - closeTimerStartTimeRef.value
      remainingTime.value = remainingTime.value - elapsedTime
    }
    lastCloseTimerStartTimeRef.value = new Date().getTime()
  }

  const startTimer = () => {
    if (remainingTime.value === Infinity) return
    closeTimerStartTimeRef.value = new Date().getTime()
    timeoutId = setTimeout(() => {
      props.toast.onAutoClose?.(props.toast)
      deleteToast()
    }, remainingTime.value)
  }

  if (
    props.expanded ||
    props.interacting ||
    isDocumentHidden.value
  ) {
    pauseTimer()
  } else {
    startTimer()
  }

  onInvalidate(() => {
    clearTimeout(timeoutId)
  })
})

watch(
  () => props.toast.delete,
  (value) => {
    if (value !== undefined && value) { 
      deleteToast()
      props.toast.onDismiss?.(props.toast)
    }
  },
  { deep: true }
)

function handleDragEnd() {
  swiping.value = false;
  swipeDirection.value = null;
  pointerStartRef.value = null;
}
</script>
