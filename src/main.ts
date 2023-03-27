import { createApp } from 'vue'
import App from './App.vue'

import 'uno.css'
import '@unocss/reset/tailwind.css'
import highlight from '~/plugins/highlight'

const app = createApp(App)

app.use(highlight)
app.mount('#app')
