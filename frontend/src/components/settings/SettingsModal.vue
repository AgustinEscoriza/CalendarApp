<script setup>
import { ref, watch, computed } from 'vue'
import { useSettingsStore } from '../../store/settings'
import { useI18n } from 'vue-i18n'
import { 
  NModal, 
  NCard, 
  NForm, 
  NFormItem, 
  NSelect, 
  NInput, 
  NSwitch, 
  NButton, 
  NDivider,
  useMessage 
} from 'naive-ui'

// Props y emits
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:show'])

// Composables
const settingsStore = useSettingsStore()
const { t, locale } = useI18n()
const message = useMessage()

// Estados locales del formulario
const formData = ref({
  language: '',
  timezone: '',
  location: '',
  timeFormat: '',
  darkMode: false
})

const loading = ref(false)

// Computed para el modal
const showModal = computed({
  get: () => props.show,
  set: (value) => emit('update:show', value)
})

// Opciones para los selects (ahora dinámicas)
const languageOptions = computed(() => [
  { label: t('settings.languageSpanish'), value: 'es' },
  { label: t('settings.languageEnglish'), value: 'en' }
])

const timezoneOptions = computed(() => [
  { label: t('settings.timezones.buenosAires'), value: 'America/Argentina/Buenos_Aires' },
  { label: t('settings.timezones.saoPaulo'), value: 'America/Sao_Paulo' },
  { label: t('settings.timezones.newYork'), value: 'America/New_York' },
  { label: t('settings.timezones.losAngeles'), value: 'America/Los_Angeles' },
  { label: t('settings.timezones.london'), value: 'Europe/London' },
  { label: t('settings.timezones.paris'), value: 'Europe/Paris' },
  { label: t('settings.timezones.madrid'), value: 'Europe/Madrid' },
  { label: t('settings.timezones.tokyo'), value: 'Asia/Tokyo' },
  { label: t('settings.timezones.sydney'), value: 'Australia/Sydney' }
])

const timeFormatOptions = computed(() => [
  { label: t('settings.timeFormat24'), value: '24h' },
  { label: t('settings.timeFormat12'), value: '12h' }
])

// Inicializar formulario con configuraciones actuales
const initializeForm = () => {
  const currentSettings = settingsStore.currentSettings
  formData.value = {
    language: currentSettings.language,
    timezone: currentSettings.timezone,
    location: currentSettings.location || '',
    timeFormat: currentSettings.timeFormat,
    darkMode: currentSettings.darkMode
  }
}

// Watcher para inicializar cuando se abre el modal
watch(() => props.show, (newValue) => {
  if (newValue) {
    initializeForm()
  }
})

// Métodos
const onSave = async () => {
  loading.value = true
  try {
    await settingsStore.updateUserSettings(formData.value)
    
    // El idioma se sincronizará automáticamente a través del watcher en App.vue
    
    message.success(t('settings.saveSuccess'))
    showModal.value = false
  } catch (error) {
    console.error('Error saving settings:', error)
    message.error(t('settings.saveError'))
  } finally {
    loading.value = false
  }
}

const onCancel = () => {
  showModal.value = false
}

const onDarkModeChange = (value) => {
  formData.value.darkMode = value
  // Aplicar cambio inmediatamente para preview
  document.documentElement.classList.toggle('dark', value)
}

// Inicializar formulario cuando el componente se monta
initializeForm()
</script>

<template>
  <n-modal 
    v-model:show="showModal" 
    preset="card" 
    :style="{ width: '500px' }"
    :title="t('settings.title')"
    :closable="true"
    :mask-closable="false"
    :auto-focus="false"
  >
    <n-form 
      ref="formRef"
      :model="formData"
      label-placement="top"
      require-mark-placement="right-hanging"
    >
      <!-- Sección Idioma -->
      <n-form-item :label="t('settings.language')" path="language">
        <n-select 
          v-model:value="formData.language"
          :options="languageOptions"
          :placeholder="t('settings.languagePlaceholder')"
        />
      </n-form-item>

      <!-- Sección Zona Horaria -->
      <n-form-item :label="t('settings.timezone')" path="timezone">
        <n-select 
          v-model:value="formData.timezone"
          :options="timezoneOptions"
          :placeholder="t('settings.timezonePlaceholder')"
          filterable
        />
      </n-form-item>

      <!-- Sección Ubicación -->
      <n-form-item :label="t('settings.location')" path="location">
        <n-input 
          v-model:value="formData.location"
          :placeholder="t('settings.locationPlaceholder')"
          clearable
        />
      </n-form-item>

      <!-- Sección Formato de Hora -->
      <n-form-item :label="t('settings.timeFormat')" path="timeFormat">
        <n-select 
          v-model:value="formData.timeFormat"
          :options="timeFormatOptions"
          :placeholder="t('settings.timeFormatPlaceholder')"
        />
      </n-form-item>

      <n-divider />

      <!-- Sección Dark Mode -->
      <n-form-item :label="t('settings.darkMode')">
        <div style="display: flex; align-items: center; gap: 12px;">
          <n-switch 
            v-model:value="formData.darkMode"
            @update:value="onDarkModeChange"
          />
          <span style="font-size: 14px; color: var(--text-color-2);">
            {{ formData.darkMode ? t('settings.darkModeOn') : t('settings.darkModeOff') }}
          </span>
        </div>
      </n-form-item>
    </n-form>

    <template #action>
      <div style="display: flex; gap: 12px; justify-content: flex-end;">
        <n-button @click="onCancel" :disabled="loading">
          {{ t('settings.cancel') }}
        </n-button>
        <n-button 
          type="primary" 
          @click="onSave"
          :loading="loading"
        >
          {{ t('settings.save') }}
        </n-button>
      </div>
    </template>
  </n-modal>
</template>

<style scoped>
/* Estilos personalizados si son necesarios */
:deep(.n-form-item-label) {
  font-weight: 500;
}

:deep(.n-divider) {
  margin: 20px 0;
}
</style>
