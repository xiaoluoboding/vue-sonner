<template>
  <div class="installation">
    <h1 class="text-lg font-semibold my-3">Installation</h1>
    <Highlight :autodetect="false" language="javascript" :code="code" />
  </div>
</template>

<script lang="ts" setup>
const code = `pnpm install vue-sonner
// or
yarn add vue-sonner
`
</script>
