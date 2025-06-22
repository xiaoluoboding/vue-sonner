import { defineConfig } from 'tsdown'
import Vue from 'unplugin-vue/rolldown'
import styleInject from '@senojs/rollup-plugin-style-inject'

export default defineConfig({
  // Entry point for the UMD build
  entry: ['src/plugin.umd.ts'],

  // Use specific tsconfig for build output
  tsconfig: './tsconfig.build.json',

  // Output as UMD format (for browser global usage)
  format: ['umd'],

  // Compile for browser runtime
  platform: 'browser',

  // Global variable name used in <script> tag
  globalName: 'VueSonner',

  // Use modern JavaScript
  target: 'ESNext',

  // Output options
  sourcemap: false,
  minify: true,
  clean: true,

  // Treat 'vue' as external (consumer must provide it)
  external: ['vue'],

  plugins: [
    // Transforms Vue SFC files
    Vue({ isProduction: true }),

    // Inject styles into <head> at runtime instead of emitting a .css file
    //
    // 📝 I tried many modern plugins like:
    // - rollup-plugin-style-inject
    // - rollup-plugin-styles
    // - other Vue rollup integrations
    //
    // None of them could:
    // - inline CSS into the UMD .js file
    // - avoid emitting a separate .css file
    //
    // ✅ This older plugin (`@senojs/rollup-plugin-style-inject`) still works perfectly.
    // It inlines <style> tags into the final JS bundle, making distribution simple.
    styleInject({
      insertAt: 'top'
    }),
  ],

  outputOptions: {
    // Bundle location and file name
    dir: 'dist/umd',
    entryFileNames: 'vue-sonner.umd.prod.js',

    // Define globals for UMD build
    globals: {
      vue: 'Vue'
    }
  }
})
