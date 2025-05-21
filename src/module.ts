import {
  defineNuxtModule,
  addComponent,
  addPlugin,
  createResolver
} from '@nuxt/kit'

interface ModuleOptions {
  /**
   * Whether to include the default CSS
   * @default true
   */
  css?: boolean
}

export default defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'vue-sonner',
    configKey: 'vueSonner',
    compatibility: {
      nuxt: '^3.0.0'
    }
  },
  defaults: {
    css: true
  },
  setup(moduleOptions, nuxt) {
    const { resolve } = createResolver(import.meta.url)

    addComponent({
      name: 'Toaster',
      export: 'Toaster',
      filePath: 'vue-sonner',
      mode: 'client'
    })

    addPlugin({
      src: resolve('./runtime/plugin'),
      mode: 'client'
    })

    if (moduleOptions.css) {
      nuxt.options.css.push('vue-sonner/index.css')
    }

    if (!nuxt.options.build.transpile) nuxt.options.build.transpile = []
    const transpileList = ['vue-sonner']
    transpileList.forEach((pkgName) => {
      if (!nuxt.options.build.transpile.includes(pkgName))
        nuxt.options.build.transpile.push(pkgName)
    })
  }
})
