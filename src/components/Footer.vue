<template>
  <footer
    class="mt-16 pb-4 w-full flex-center text-primary"
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
</template>
