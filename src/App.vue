<template>
  <div class="bg-neutral-50 dark:bg-neutral-900">
    <div class="container mx-auto max-w-2xl relative">
      <header class="py-20 flex-center flex-col">
        <Hero />
      </header>

      <main
        class="grid grid-cols-1 gap-8 text-xs 2xl:text-sm text-primary pb-20"
      >
        <Installation />
        <Usage />
        <Types />
        <Position
          :position="position"
          @change="(newVal: Position) => (position = newVal)"
        />
        <Expand
          :expand="expand"
          @change="(newVal: boolean) => expand = newVal"
        />
        <Others
          @setRichColors="richColors = true"
          @setCloseButton="closeButton = true"
        />
      </main>

      <Footer />
    </div>
    <Toaster
      :position="position"
      :expand="expand"
      :rich-colors="richColors"
      :close-button="closeButton"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { toggleDarkmode, isDark } from '~/composables/useDarkmode'
import { Toaster } from '../packages'
import type { Position } from '../packages/types'

const expand = ref(false)
const position = ref<Position>('top-right')
const richColors = ref(false)
const closeButton = ref(false)
</script>

<style>
html,
body,
#app {
  height: 100%;
  width: 100%;
}
</style>
