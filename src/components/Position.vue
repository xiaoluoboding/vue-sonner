<template>
  <div class="types">
    <h1 class="text-lg font-semibold my-2">Position</h1>
    <p class="text-base my-3">
      You can customize the type of toast you want to render, and pass an
      options object as the second argument.
    </p>
    <div class="mb-4 flex gap-3">
      <button
        v-for="position in positions"
        :key="position"
        class="btn-default"
        :class="{
          'bg-neutral-200/50 border-neutral-400/50': props.position === position
        }"
        @click="() => handleChangePosition(position)"
      >
        {{ position }}
      </button>
    </div>
    <Highlight
      language="javascript"
      class=""
      :autodetect="false"
      :code="renderedCode"
    />
  </div>
</template>

<script lang="ts" setup>
import type { PropType } from 'vue'
import { ref, computed } from 'vue'

import { toast } from '../../packages'
import type { Position } from '../../packages/types'

const props = defineProps({
  position: String as PropType<Position>
})

const emit = defineEmits(['change'])

const positions = [
  'top-left',
  'top-center',
  'top-right',
  'bottom-left',
  'bottom-center',
  'bottom-right'
] as const

const renderedCode = computed(() => {
  return `<Toaster position="${props.position}" />`
})

const handleChangePosition = (activePosition: Position) => {
  const toastsAmount = document.querySelectorAll('[data-sonner-toast]').length
  emit('change', activePosition)

  // No need to show a toast when there is already one
  if (toastsAmount > 0 && props.position !== activePosition) return

  toast('Event has been created', {
    description: 'Monday, January 3rd at 6:00pm'
  })
}
</script>
