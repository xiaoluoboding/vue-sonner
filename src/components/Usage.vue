<template>
  <div class="usage">
    <h1 class="text-lg font-semibold my-2">Usage</h1>
    <p class="text-base my-3">Render the toaster in the root of your app.</p>
    <div class="code-block relative group">
      <Highlight
        className="rounded-md text-xs"
        language="xml"
        :autodetect="false"
        :code="code"
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
import { ref } from 'vue'

import CheckIcon from '~/components/icons/CheckIcon.vue'
import CopyIcon from '~/components/icons/CopyIcon.vue'
import { useCopyCode } from '~/composables/useCopyCode'
import { toast } from '../../packages'

const code = `<!-- App.vue -->
<template>
  <!-- ... -->
  <Toaster />
  <button @click="() => toast('My first toast')">
    Give me a toast
  </button>
</template>

<script lang="ts" setup>
import { Toaster, toast } from 'vue-sonner'
<\/script>
`

const showCheckIcon = ref(false)

const handleCopyCode = async () => {
  await useCopyCode({ code, checkIconRef: showCheckIcon })
  toast('Copied to your clipboard!!!')
}
</script>
