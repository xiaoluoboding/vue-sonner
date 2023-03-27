<template>
  <div class="types">
    <h1 class="text-lg font-semibold my-2">Expand</h1>
    <p class="text-base my-3">
      You can change the amount of toasts visible through the
      <code class="text-xs !bg-neutral-200/66 p-1 rounded-md"
        >visibleToasts</code
      >
      prop.
    </p>
    <div class="mb-4 flex gap-3">
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
    <Highlight
      language="javascript"
      class=""
      :autodetect="false"
      :code="renderedCode"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, computed } from 'vue'

import { toast } from '../../packages'

const props = defineProps({
  expand: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['change'])

const renderedCode = computed(() => {
  return `<Toaster expand="${props.expand}" />`
})

const handleChangeExpand = (isExpand: boolean) => {
  emit('change', isExpand)

  toast('Event has been created', {
    description: 'Monday, January 3rd at 6:00pm'
  })
}
</script>
