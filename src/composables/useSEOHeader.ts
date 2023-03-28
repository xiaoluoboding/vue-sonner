import { useHead } from '@vueuse/head'

const useSEOHeader = () => {
  // all your favourites, fully typed
  useHead({
    title: 'Vue Sonner',
    titleTemplate: (title) =>
      `${title} | An opinionated toast component for Vue.`,
    meta: [
      {
        property: 'description',
        content: 'An opinionated toast component for Vue.'
      },
      {
        property: 'og:title',
        content: 'Vue Sonner'
      },
      {
        property: 'og:description',
        content: 'An opinionated toast component for Vue.'
      },
      { property: 'og:image', content: 'https://vue-sonner.vercel.app/og.png' },
      { property: 'og:url', content: 'https://vue-sonner.vercel.app' },
      { property: 'og:site_name', content: 'Vue Sonner' },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '900' },
      {
        property: 'og:image:alt',
        content: 'An opinionated toast component for Vue.'
      },
      { property: 'twitter:site', content: 'Vue Sonner' },
      {
        property: 'twitter:title',
        content: 'Vue Sonner'
      },
      { property: 'twitter:card', content: 'summary_large_image' },
      {
        property: 'twitter:description',
        content: 'An opinionated toast component for Vue.'
      },
      {
        property: 'twitter:image:src',
        content: 'https://vue-sonner.vercel.app/og.png'
      }
    ]
  })
}
export { useSEOHeader }
