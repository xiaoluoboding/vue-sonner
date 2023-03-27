<template>
  <div class="w-full h-full">
    <div class="container mx-auto max-w-5xl relative">
      <nav class="h-20 py-4 flex-between text-[var(--app-text)]">
        <div class="font-semibold text-xl flex-center gap-2">
          <Logo class="h-6 w-6" />
          Vue Sonner
        </div>
        <div class="flex-center gap-4">
          <button
            class="opacity-50 hover:opacity-100 transition"
            @click="(e) => toggleDarkmode()"
          >
            <MoonIcon class="w-6 h-6" v-if="isDark" />
            <SunIcon class="w-6 h-6" v-else />
          </button>
          <a
            class="opacity-50 hover:opacity-100 transition"
            href="https://github.com/xiaoluoboding/vue-sonner"
          >
            <carbon:logo-github class="h-6 w-6" />
          </a>
        </div>
      </nav>
      <header class="py-20">
        <div class="font-extrabold">
          <span class="text-6xl text-neon">
            An opinionated toast component
          </span>
          <div class="text-6xl text-[var(--app-text)]">for Vue</div>
        </div>
        <div
          class="text-2xl font-semibold text-slate-700 py-4 dark:text-slate-200"
        >
          It's customizable, but styled by default. Comes with a swipe to
          dismiss animation.
        </div>
      </header>

      <main class="grid grid-cols-1 gap-8 text-xs 2xl:text-sm">Sonner</main>

      <footer
        class="mt-16 w-full flex-center text-[var(--app-text)]"
        text="slate-900 dark:slate-300 opacity-60 sm"
      >
        <div class="copyright flex flex-col justify-center items-center">
          <p>
            Code with ❤ & ☕️ by
            <a class="text-neon" href="https://github.com/xiaoluoboding">
              @xiaoluoboding
            </a>
            <span> © {{ new Date().getFullYear() }}</span>
          </p>
          <p class="flex items-center space-x-1">
            <carbon:logo-twitter class="text-emerald-500" />
            <span>
              <a
                href="https://twitter.com/xiaoluoboding"
                class="text-neon"
                target="_blank"
              >
                Follow me on Twitter
              </a>
            </span>
            <span class="px-2 text-emerald-300">|</span>
            <carbon:cafe class="text-emerald-500" />
            <span>
              <a
                href="https://www.buymeacoffee.com/xlbd"
                target="_blank"
                class="text-neon"
              >
                Buy me a coffee
              </a>
            </span>
            <span class="px-2 text-emerald-300">|</span>
            <mdi:heart class="text-emerald-500" />
            <span>
              <a
                href="https://github.com/sponsors/xiaoluoboding"
                target="_blank"
                class="text-neon"
              >
                Sponsor me on GitHub
              </a>
            </span>
          </p>
        </div>
      </footer>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { toggleDarkmode, isDark } from '~/composables/useDarkmode'
</script>
