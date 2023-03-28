import { useHead } from '@vueuse/head'

const useSEOHeader = () => {
  // all your favourites, fully typed
  useHead({
    title: 'Vue Sonner',
    titleTemplate: (title) =>
      `${title} | An opinionated toast component for Vue.`,
    meta: [
      {
        name: 'description',
        content: 'An opinionated toast component for Vue.'
      },
      {
        name: 'og:title',
        content: 'Vue Sonner'
      },
      {
        name: 'og:description',
        content: 'An opinionated toast component for Vue.'
      },
      { property: 'og:image', content: 'https://vue-sonner.vercel.app/og.png' },
      { property: 'og:url', content: 'https://vue-sonner.vercel.app' },
      { property: 'og:site_name', content: 'Vue Sonner' },
      { name: 'og:image:width', content: '1200' },
      { name: 'og:image:height', content: '900' },
      {
        name: 'og:image:alt',
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
