import {
  defineNuxtModule,
  addPlugin,
  addComponent,
  createResolver
} from '@nuxt/kit'

import type { NuxtModule } from '@nuxt/schema'

// Define module options interface
interface ModuleOptions {
  // Add your module options here if needed
}

const module: NuxtModule<ModuleOptions> = defineNuxtModule<ModuleOptions>({
  meta: {
    name: 'vue-sonner',
    configKey: 'VueSonner',
    compatibility: {
      nuxt: '^3.0.0'
    }
  },
  // Explicitly type the setup function
  setup(options: ModuleOptions, nuxt) {
    const resolver = createResolver(import.meta.url)

    // Do not add the extension since the `.ts` will be transpiled to `.mjs` after `npm run prepack`
    addPlugin({
      src: resolver.resolve('./runtime/plugin'),
      mode: 'client'
    })

    addComponent({
      name: 'Toaster',
      filePath: resolver.resolve('../packages/Toaster.vue')
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
