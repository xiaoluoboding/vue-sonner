import { defineConfig, UserConfig } from 'vite'
import { resolve } from 'path'
import vue from '@vitejs/plugin-vue'
import dts from 'vite-plugin-dts'
import RollupTs from 'rollup-plugin-typescript2'
import UnoCSS from 'unocss/vite'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import Components from 'unplugin-vue-components/vite'
import { libInjectCss } from 'vite-plugin-lib-inject-css'

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  let userConfig: UserConfig = {}

  // console.log(command)
  // console.log(mode)

  const commonPlugins = [
    vue(),
    // dts({
    //   include: './packages',
    //   insertTypesEntry: true
    // }),
    RollupTs({
      check: false,
      include: ['packages/**/*.ts'],
      tsconfigOverride: {
        compilerOptions: {
          outDir: 'lib',
          sourceMap: false,
          declaration: true,
          declarationMap: false
        }
      },
      exclude: ['vite.config.ts']
    }),
    UnoCSS(),
    Components({
      resolvers: [
        IconsResolver({
          prefix: ''
        })
      ]
    }),
    Icons()
  ]

  if (mode === 'lib') {
    userConfig.build = {
      lib: {
        entry: resolve(__dirname, 'packages/index.ts'),
        name: 'VueSonner',
        fileName: 'vue-sonner'
      },
      outDir: 'lib',
      emptyOutDir: true,
      sourcemap: false,
      cssCodeSplit: true,
      rollupOptions: {
        external: ['vue'],
        output: {
          globals: {
            vue: 'Vue'
          }
        }
      }
    }
    userConfig.plugins = [...commonPlugins, libInjectCss()]
  }

  return {
    resolve: {
      alias: {
        '@': resolve(__dirname, '/packages'),
        '~': resolve(__dirname, '/src')
      }
    },
    plugins: [...commonPlugins],
    ...userConfig
  }
})
