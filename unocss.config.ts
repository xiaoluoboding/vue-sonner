import { defineConfig, presetAttributify, presetUno } from 'unocss'

export default defineConfig({
  presets: [presetUno(), presetAttributify()],
  shortcuts: [
    {
      'flex-center': 'flex justify-center items-center',
      'flex-col-center': 'flex flex-col justify-center items-center',
      'flex-between': 'flex justify-between items-center',
      'text-neon':
        'text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-emerald-700 dark:to-emerald-300',
      'text-primary': 'text-neutral-600 dark:text-neutral-50',
      'btn-primary':
        '!text-neutral-50 bg-emerald-600 !shadow hover:bg-emerald-500',
      'btn-default':
        'py-2 px-3 m-0 whitespace-nowrap bg-neutral-50/80 border border-neutral-200/80 font-semibold cursor-pointer rounded-md text-xs hover:bg-neutral-200/50 hover:border-neutral-400/50',
      'btn-border':
        'py-2 px-3 m-0 whitespace-nowrap bg-transparent border border-neutral-200 font-semibold cursor-pointer rounded-md text-xs hover:bg-neutral-200/50 hover:border-neutral-400/50',
    },
  ],
})
