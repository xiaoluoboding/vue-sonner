<template>
  <div class="bg-neutral-100/66 dark:bg-neutral-900 px-4">
    <div class="container mx-auto max-w-full sm:max-w-2xl relative">
      <header class="py-20 flex-center flex-col">
        <Hero />
      </header>

      <main
        class="grid grid-cols-1 gap-8 text-xs 2xl:text-sm text-primary pb-20"
      >
        <Installation />
        <Usage />
        <Types />
        <Position v-model:position="position" />
        <Expand v-model:expand="expand" />
        <Theming @setTheme="(newTheme: Theme) => (theme = newTheme)" />
        <Styling />
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
      :theme="theme"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
// import { toggleDarkmode, isDark } from '~/composables/useDarkmode'
import { Toaster } from '@/packages'
import type { Position, Theme } from '@/packages/types'
import { useSEOHeader } from '~/composables/useSEOHeader'

useSEOHeader()

const expand = ref(false)
const position = ref<Position>('top-right')
const richColors = ref(false)
const closeButton = ref(false)
const theme = ref<Theme>('light')
</script>
