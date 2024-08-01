<script setup lang="ts">
defineProps<{ message: string }>()
</script>

<template>
  <div v-html="message" />
</template>
