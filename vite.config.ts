import { defineConfig, UserConfig } from 'vite'
import { URL, fileURLToPath } from 'node:url'
import { resolve } from 'node:path'
import vue from '@vitejs/plugin-vue'
import UnoCSS from 'unocss/vite'
import Icons from 'unplugin-icons/vite'
import IconsResolver from 'unplugin-icons/resolver'
import Components from 'unplugin-vue-components/vite'
import CleanCSS from 'clean-css'

const cleanCssInstance = new CleanCSS({})
function minify(code: string) {
  return cleanCssInstance.minify(code).styles
}

let cssCodeStr = ''

export default defineConfig(({ command, mode }) => {
  let userConfig: UserConfig = {}

  const commonPlugins = [
    vue(),
    UnoCSS(),
    Components({
      dirs: ['app/components'],
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
        entry: {
          'vue-sonner': resolve(__dirname, 'src/packages/index.ts'),
          'manual-css': resolve(__dirname, 'src/packages/index.ts')
        },
        fileName: (format, entryName) => {
          if (entryName === 'vue-sonner') {
            return `vue-sonner.${format === 'es' ? 'js' : format}`
          }
          if (entryName === 'manual-css') {
            return `vue-sonner.manual.${format === 'es' ? 'js' : format}`
          }
        },
        formats: ['es', 'cjs']
      },
      outDir: 'lib',
      emptyOutDir: true,
      cssCodeSplit: true,
      sourcemap: true,
      rollupOptions: {
        external: ['vue'],
        output: [
          {
            format: 'cjs',
            assetFileNames: 'style.css'
          },
          {
            format: 'es',
            preserveModules: false,
            assetFileNames: 'style.css'
          }
        ]
      }
    }
    userConfig.plugins = [
      ...commonPlugins,
      {
        name: 'inline-css',
        buildStart() {
          cssCodeStr = ''
        },
        transform(code, id) {
          const isCSS = (path: string) => /\.css$/.test(path)
          if (!isCSS(id)) return

          const minifiedCss = minify(code)
          cssCodeStr += minifiedCss
          return {
            code: minifiedCss,
            map: { mappings: '' }
          }
        },
        renderChunk(code, chunk) {
          if (!chunk.isEntry) return null

          if (chunk.name === 'vue-sonner') {
            return {
              code: `\
              function __insertCSSVueSonner(code) {
                if (!code || typeof document == 'undefined') return
                
                function insertCSS() {
  
                  let head = document.head || document.getElementsByTagName('head')[0]
                  if (!head) return
                  let style = document.createElement('style')
                  style.type = 'text/css'
                  head.appendChild(style)
                  style.styleSheet ? (style.styleSheet.cssText = code) : style.appendChild(document.createTextNode(code))
                }
  
                if (document.readyState === 'loading') {
                  document.addEventListener('DOMContentLoaded', insertCSS)
                } else {
                  insertCSS()
                }
              }\n
              __insertCSSVueSonner(${JSON.stringify(cssCodeStr)})
              \n ${code}`,
              map: { mappings: '' }
            }
          }
          return {
            code,
            map: { mappings: '' }
          }
        }
      }
    ]
  }

  return {
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '~': fileURLToPath(new URL('./app', import.meta.url))
      }
    },
    plugins: [...commonPlugins],
    ...userConfig
  }
})
