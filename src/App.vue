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
import { useHead } from '@vueuse/head'
// import { toggleDarkmode, isDark } from '~/composables/useDarkmode'
import { Toaster } from '../packages'
import type { Position } from '../packages/types'

const expand = ref(false)
const position = ref<Position>('top-right')
const richColors = ref(false)
const closeButton = ref(false)

// all your favourites, fully typed
useHead({
  title: 'Vue Sonner',
  titleTemplate: (title) =>
    `${title} | An opinionated toast component for Vue.`,
  meta: [
    { name: 'description', content: 'An opinionated toast component for Vue.' },
    {
      name: 'og:title',
      content: 'Vue Sonner'
    },
    {
      name: 'og:description',
      content: 'An opinionated toast component for Vue.'
    },
    { name: 'og:image', content: 'https://vue-sonner.vercel.app/og.png' },
    { name: 'og:url', content: 'https://vue-sonner.vercel.app' },
    { name: 'og:site_name', content: 'Vue Sonner' },
    { name: 'og:image:width', content: '1200' },
    { name: 'og:image:height', content: '900' },
    {
      name: 'og:image:alt',
      content: 'An opinionated toast component for Vue.'
    },
    { name: 'twitter:site', content: 'Vue Sonner' },
    {
      name: 'twitter:title',
      content: 'Vue Sonner'
    },
    { name: 'twitter:card', content: 'summary_large_image' },
    {
      name: 'twitter:description',
      content: 'An opinionated toast component for Vue.'
    },
    {
      name: 'twitter:image:src',
      content: 'https://vue-sonner.vercel.app/og.png'
    }
  ]
})
</script>
