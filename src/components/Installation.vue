<template>
  <div class="installation">
    <h1 class="text-lg font-semibold my-3">Installation</h1>
    <div class="code-block relative">
      <Highlight
        language="javascript"
        className="rounded-md text-xs"
        :autodetect="false"
        :code="code"
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
import { ref } from 'vue';
import CheckIcon from '~/assets/CheckIcon.vue';
import CopyIcon from '~/assets/CopyIcon.vue';
import { useCopyCode } from '~/composables/useCopyCode';

const code = `pnpm install vue-sonner`

const showCheckIcon = ref(false)

const handleCopyCode = async () => {
  await useCopyCode({ code, checkIconRef: showCheckIcon })
}
</script>
