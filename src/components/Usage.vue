<template>
  <div class="usage">
    <h1 class="text-lg font-semibold my-2">Usage</h1>
    <p class="text-base my-3">Render the toaster in the root of your app.</p>
    <Highlight :autodetect="false" language="xml" :code="code" />
  </div>
</template>

<script lang="ts" setup>
const code = `<!-- App.vue -->
<template>
  <!-- ... -->
  <Toaster />
  <button onClick={() => toast('My first toast')}>
    Give me a toast
  </button>
</template>

<script lang="ts" setup>
import { Toaster, toast } from 'vue'
<\/script>
`
</script>
