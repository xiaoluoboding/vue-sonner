<template>
  <div className="sonner-loading-wrapper" :data-visible="visible">
    <div className="sonner-spinner">
      <template v-for="bar in bars" :key="`spinner-bar-${bar}`">
        <div className="sonner-loading-bar" />
      </template>
    </div>
  </div>
</template>

<script lang="ts" setup>
const bars = Array(12).fill(0)

defineProps({
  visible: Boolean
})
</script>
