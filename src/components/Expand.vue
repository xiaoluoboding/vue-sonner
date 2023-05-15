<template>
  <div class="types">
    <h1 class="text-lg font-semibold my-2">Expand</h1>
    <p class="text-base my-3">
      You can change the number of visible toasts through the
      <code class="text-xs !bg-neutral-200/66 p-1 rounded-md">
        visibleToasts
      </code>
      prop, the default is 3 toasts.
    </p>
    <div class="mb-4 flex gap-3 overflow-auto">
      <button
        class="btn-default"
        :class="{
          'bg-neutral-200/50 border-neutral-400/50': props.expand
        }"
        @click="() => handleChangeExpand(true)"
      >
        Expand
      </button>
      <button
        class="btn-default"
        :class="{
          'bg-neutral-200/50 border-neutral-400/50': !props.expand
        }"
        @click="() => handleChangeExpand(false)"
      >
        Default
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
        class="absolute right-2 top-2 btn-border p-1"
        @click="handleCopyCode"
      >
        <CheckIcon v-if="showCheckIcon" />
        <CopyIcon v-else />
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

import { toast } from '../../packages'
import { useCopyCode } from '~/composables/useCopyCode'
import CopyIcon from '~/components/icons/CopyIcon.vue'
import CheckIcon from '~/components/icons/CheckIcon.vue'

const props = defineProps({
  expand: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['change'])

const renderedCode = computed(() => {
  return `<Toaster :expand="${props.expand}" />`
})
const showCheckIcon = ref(false)

const handleChangeExpand = (isExpand: boolean) => {
  emit('change', isExpand)

  toast('Event has been created', {
    description: 'Monday, January 3rd at 6:00pm'
  })
}

const handleCopyCode = async () => {
  await useCopyCode({ code: renderedCode.value, checkIconRef: showCheckIcon })
}
</script>
