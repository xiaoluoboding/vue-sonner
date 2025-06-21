// vite.config.prod.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'
import path from 'path'

export default defineConfig({
  plugins: [
    vue(),
    cssInjectedByJsPlugin()
  ],
  build: {
    target: 'es2018', // optional but good for modern JS
    sourcemap: false, // no source maps in production
    minify: 'terser', //  ensure it's minified
    lib: {
      entry: path.resolve(__dirname, 'src/index.ts'),
      name: 'VueSonner',
      fileName: () => 'vue-sonner.umd.prod.js',
      formats: ['umd']
    },
    rollupOptions: {
      external: ['vue'],
      output: {
        globals: {
          vue: 'Vue'
        }
      }
    }
  }
})
