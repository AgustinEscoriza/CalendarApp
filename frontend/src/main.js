import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import i18n from './i18n'
import naive from './plugins/naive-ui'
import './style.css'
import './styles/fullcalendar-theme.css'
import App from './App.vue'

const app = createApp(App)
app.use(createPinia())
app.use(router)
app.use(i18n)
app.use(naive)
app.mount('#app')
