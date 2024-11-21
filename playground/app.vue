<template>
  <div>
    <Toaster position="top-center" />

    <button @click="$toast('Render a toast')">Render a toast</button>
  </div>
</template>

<script setup>
// alternatively, you can also use it here
const { $toast } = useNuxtApp()
</script>
