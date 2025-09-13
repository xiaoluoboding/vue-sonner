<template>
  <div class="types">
    <h1 class="text-lg font-semibold my-2">Close Button Position</h1>
    <p class="text-base my-3">
      You can customize the position of the close button, If you haven't 
      set the position, it defaults to 
      <code class="text-xs !bg-neutral-200/66 p-1 mx-1 rounded-md">
        top-left
      </code>
      .
    </p>
    <div class="mb-4 flex gap-3 overflow-auto">
      <button
        v-for="position in positions"
        :key="position"
        class="btn-default"
        :class="{
          'bg-neutral-200/50 border-neutral-400/50': props.closeButtonPosition === position
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
import { ref, computed, watch } from 'vue'

import { toast, useVueSonner } from '@/packages'
import type { CloseButtonPosition } from '@/packages/types'
import { useCopyCode } from '~/composables/useCopyCode'
import CopyIcon from '~/components/icons/CopyIcon.vue'
import CheckIcon from '~/components/icons/CheckIcon.vue'

const props = defineProps({
  closeButtonPosition: String as PropType<CloseButtonPosition>
})

const emit = defineEmits<{
  (e: 'update:closeButtonPosition', position: CloseButtonPosition): void
}>()

const positions = [
  'top-left',
  'top-right',
  'bottom-left',
  'bottom-right'
] as const

const renderedCode = computed(() => {
  return `<Toaster closeButton="true" closeButtonPosition="${props.closeButtonPosition}" />`
})
const showCheckIcon = ref(false)

const handleChangePosition = (activePosition: CloseButtonPosition) => {
  toast.dismiss()
  emit('update:closeButtonPosition', activePosition)

  toast('Event has been created', {
    description: 'Monday, January 3rd at 6:00pm',
    closeButton: true,
    closeButtonPosition: 'bottom-right'
  })
}

const handleCopyCode = async () => {
  await useCopyCode({ code: renderedCode.value, checkIconRef: showCheckIcon })
  toast('Copied to your clipboard!!!')
}
</script>
