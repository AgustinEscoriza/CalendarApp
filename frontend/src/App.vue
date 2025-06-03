<template>
  <n-config-provider :theme="theme" :locale="naiveLocale" :date-locale="naiveDateLocale">
    <n-loading-bar-provider>
      <n-message-provider>
        <n-dialog-provider>
          <n-notification-provider>
            <router-view />
          </n-notification-provider>
        </n-dialog-provider>
      </n-message-provider>
    </n-loading-bar-provider>
  </n-config-provider>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { 
  NConfigProvider, 
  NLoadingBarProvider,
  NMessageProvider, 
  NDialogProvider, 
  NNotificationProvider,
  darkTheme
} from 'naive-ui'
import { useSettingsStore } from './store/settings'

const { locale } = useI18n()
const settingsStore = useSettingsStore()

// Configuración de tema basada en las configuraciones del usuario
const theme = computed(() => {
  return settingsStore.isDarkMode ? darkTheme : null
})

// Watcher para sincronizar el idioma desde settings y guardarlo en localStorage
watch(
  () => settingsStore.currentLanguage,
  (newLanguage) => {
    if (newLanguage && locale.value !== newLanguage) {
      locale.value = newLanguage
      // Guardar en localStorage para persistencia
      localStorage.setItem('user-language', newLanguage)
    }
  },
  { immediate: true }
)

// Watcher adicional para cambios directos en locale (por si se cambia desde otro lugar)
watch(
  () => locale.value,
  (newLocale) => {
    if (newLocale) {
      localStorage.setItem('user-language', newLocale)
    }
  }
)

// Cargar configuraciones al iniciar la aplicación
onMounted(async () => {
  try {
    await settingsStore.fetchSettings()
    // Asegurar que el idioma se sincroniza después de cargar
    const userLanguage = settingsStore.currentLanguage
    if (userLanguage && locale.value !== userLanguage) {
      locale.value = userLanguage
      localStorage.setItem('user-language', userLanguage)
    }
  } catch (error) {
    console.error('Error loading settings:', error)
    // En caso de error, usar el idioma guardado en localStorage
    const storedLanguage = localStorage.getItem('user-language')
    if (storedLanguage && locale.value !== storedLanguage) {
      locale.value = storedLanguage
    }
  }
})
</script>

<style scoped>
body {
  background: #f5f5f5;
}
</style>
