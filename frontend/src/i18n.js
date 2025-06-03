import { createI18n } from 'vue-i18n'
import es from './locales/es.json'
import en from './locales/en.json'

// Obtener idioma guardado localmente o usar español por defecto
const getStoredLanguage = () => {
  return localStorage.getItem('user-language') || 'es'
}

const i18n = createI18n({
  legacy: false,
  locale: getStoredLanguage(),
  fallbackLocale: 'en',
  messages: {
    es,
    en
  }
})

export default i18n