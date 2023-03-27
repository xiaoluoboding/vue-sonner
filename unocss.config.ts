import { defineConfig, presetUno, presetAttributify } from 'unocss'

export default defineConfig({
  presets: [presetUno(), presetAttributify()],
  shortcuts: [
    {
      'flex-center': 'flex justify-center items-center',
      'flex-col-center': 'flex flex-col justify-center items-center',
      'flex-between': 'flex justify-between items-center',
      'text-neon':
        'text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-emerald-700 dark:to-emerald-300 '
    }
  ]
})
