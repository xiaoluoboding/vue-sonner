import { createApp } from 'vue'
import { createHead } from '@vueuse/head'
import App from './App.vue'

import 'uno.css'
import '@unocss/reset/tailwind.css'
import highlight from '~/plugins/highlight'

const app = createApp(App)
const head = createHead()

app.use(head)
app.use(highlight)
app.mount('#app')
