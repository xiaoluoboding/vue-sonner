import { defineConfig } from 'tsdown'
import Vue from 'unplugin-vue/rolldown'

export default defineConfig({
  entry: ['./src/packages/index.ts'],
  outDir: './lib',
  platform: 'neutral',
  plugins: [Vue({ isProduction: true })],
  external: ['vue'],
  dts: { vue: true },
})
