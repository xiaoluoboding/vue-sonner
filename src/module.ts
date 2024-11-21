import {
  defineNuxtModule,
  addComponent,
  addPlugin,
  createResolver
} from '@nuxt/kit'

import type { NuxtModule } from '@nuxt/schema'

interface ModuleOptions {}

const module: NuxtModule<ModuleOptions> = defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'vue-sonner',
    configKey: 'VueSonner',
    compatibility: {
      nuxt: '^3.0.0'
    }
  },
  defaults: {},
  setup(options: ModuleOptions, nuxt) {
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

    if (!nuxt.options.build.transpile) nuxt.options.build.transpile = []
    const transpileList = ['vue-sonner']
    transpileList.forEach((pkgName) => {
      if (!nuxt.options.build.transpile.includes(pkgName))
        nuxt.options.build.transpile.push(pkgName)
    })
  }
})

export default module
