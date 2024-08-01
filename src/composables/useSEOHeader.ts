import { useHead, useSeoMeta } from '@vueuse/head'

function useSEOHeader() {
  useHead({
    title: 'Vue Sonner',
    titleTemplate: title =>
      `${title} | An opinionated toast component for Vue.`,
    meta: [
      {
        name: 'author',
        content: '@xiaoluoboding',
      },
      {
        name: 'description',
        content: 'An opinionated toast component for Vue.',
      },
    ],
  })
  useSeoMeta({
    title: 'Vue Sonner',
    description: 'An opinionated toast component for Vue.',
    ogDescription: 'An opinionated toast component for Vue.',
    ogTitle: 'Vue Sonner',
    ogImage: 'https://vue-sonner.vercel.app/og.png',
    ogImageHeight: '882',
    ogImageWidth: '1686',
    twitterCard: 'summary_large_image',
    twitterImage: 'https://vue-sonner.vercel.app/og.png',
    twitterTitle: 'Vue Sonner',
    twitterDescription: 'An opinionated toast component for Vue.',
  })
}
export { useSEOHeader }
