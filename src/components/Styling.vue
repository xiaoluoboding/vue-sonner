<template>
  <div class="types">
    <h1 class="text-lg font-semibold my-2">Styling</h1>
    <p class="text-base my-3">
      You can style your toasts globally with the
      <code class="text-xs !bg-neutral-200/66 p-1 mx-1 rounded-md">
        toastOptions
      </code>
      prop in the Toaster component.
    </p>
    <div class="mb-4 flex gap-3 overflow-auto">
      <button
        class="btn-default"
        :class="{
          'bg-neutral-200/50 border-neutral-400/50': currentAction === 'all'
        }"
        @click="(e) => handleClick('all')"
      >
        For all toasts
      </button>
      <button
        class="btn-default"
        :class="{
          'bg-neutral-200/50 border-neutral-400/50':
            currentAction === 'individual'
        }"
        @click="(e) => handleClick('individual')"
      >
        For individual toast
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
import { ref, computed } from 'vue'

import { toast } from '../../packages'
import { useCopyCode } from '~/composables/useCopyCode'
import CopyIcon from '~/components/icons/CopyIcon.vue'
import CheckIcon from '~/components/icons/CheckIcon.vue'

const currentAction = ref('all')
const showCheckIcon = ref(false)

const renderedCode = computed(() => {
  return currentAction.value === 'all'
    ? `<Toaster
  :toastOptions="{
    style: { background: '#fda4af' },
    class: 'my-toast',
    descriptionClass: 'my-toast-description'
  }"
/>`
    : `toast('Event has been created', {
  style: {
    background: '#6ee7b7'
  },
  class: 'my-toast',
  descriptionClass: 'my-toast-description'
})`
})

const handleClick = (action: string) => {
  currentAction.value = action
  toast('Event has been created', {
    style: {
      background: currentAction.value === 'all' ? '#fda4af' : '#6ee7b7'
    },
    class: 'my-toast',
    descriptionClass: 'my-toast-description'
  })
}

const handleCopyCode = async () => {
  await useCopyCode({ code: renderedCode.value, checkIconRef: showCheckIcon })
  toast('Copied to your clipboard!!!')
}
</script>
