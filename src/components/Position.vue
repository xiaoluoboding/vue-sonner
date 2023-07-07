<template>
  <div class="types">
    <h1 class="text-lg font-semibold my-2">Position</h1>
    <p class="text-base my-3">
      You can customize the type of toast you want to render, and pass an
      options object as the second argument.
    </p>
    <div class="mb-4 flex gap-3 overflow-auto">
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
    <div class="code-block relative group">
      <Highlight
        language="javascript"
        className="rounded-md text-xs"
        :autodetect="false"
        :code="renderedCode"
      />
      <button
        aria-label="Copy code"
        title="Copy code"
        class="absolute right-2 top-2 btn-border p-1 hidden group-hover:block"
        @click="handleCopyCode"
      >
        <CheckIcon v-if="showCheckIcon" />
        <CopyIcon v-else />
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import type { PropType } from 'vue'
import { ref, computed } from 'vue'

import { toast } from '../../packages'
import type { Position } from '../../packages/types'
import { useCopyCode } from '~/composables/useCopyCode'
import CopyIcon from '~/components/icons/CopyIcon.vue'
import CheckIcon from '~/components/icons/CheckIcon.vue'

const props = defineProps({
  position: String as PropType<Position>
})

const emit = defineEmits<{
  (e: 'update:position', position: Position): void
}>()

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
const showCheckIcon = ref(false)

const handleChangePosition = (activePosition: Position) => {
  const toastsAmount = document.querySelectorAll('[data-sonner-toast]').length
  emit('update:position', activePosition)

  // No need to show a toast when there is already one
  if (toastsAmount > 0 && props.position !== activePosition) return

  toast('Event has been created', {
    description: 'Monday, January 3rd at 6:00pm'
  })
}

const handleCopyCode = async () => {
  await useCopyCode({ code: renderedCode.value, checkIconRef: showCheckIcon })
  toast('Copied to your clipboard!!!')
}
</script>
