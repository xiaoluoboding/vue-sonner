<template>
  <div>
    <ClientOnly>
      <Toaster position="top-center" />
    </ClientOnly>

    <button @click="$toast('Render a toast')">Render a toast</button>
  </div>
</template>

<script setup>
// alternatively, you can also use it here
const { $toast } = useNuxtApp()
</script>
