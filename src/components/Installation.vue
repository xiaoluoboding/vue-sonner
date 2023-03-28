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
        class="absolute right-2 top-2 p-1 rounded-md border border-neutral-100"
        @click="handleCopyCode"
      >
        <div style="opacity: 1; transform: none">
          <svg
            viewBox="0 0 24 24"
            width="14"
            height="14"
            stroke="currentColor"
            stroke-width="1.5"
            stroke-linecap="round"
            stroke-linejoin="round"
            fill="none"
            shape-rendering="geometricPrecision"
          >
            <path
              d="M8 17.929H6c-1.105 0-2-.912-2-2.036V5.036C4 3.91 4.895 3 6 3h8c1.105 0 2 .911 2 2.036v1.866m-6 .17h8c1.105 0 2 .91 2 2.035v10.857C20 21.09 19.105 22 18 22h-8c-1.105 0-2-.911-2-2.036V9.107c0-1.124.895-2.036 2-2.036z"
            ></path>
          </svg>
        </div>
      </button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useClipboard } from '@vueuse/core'
import { toast } from '../../packages'
const code = `pnpm install vue-sonner`
const { copy, copied } = useClipboard({
  source: code
})

const handleCopyCode = async () => {
  await copy(code)
  toast.success('Copied')
}
</script>
