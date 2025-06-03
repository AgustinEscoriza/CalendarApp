<template>
  <n-modal v-model:show="show" preset="dialog" :title="t('event.title')">
    <template #header>
      <div>{{ event?.id ? t('event.editTitle') : t('event.createTitle') }}</div>
    </template>
    
    <n-form ref="formRef" :model="formData" :rules="rules" label-placement="top">
      <n-form-item :label="t('event.form.title')" path="title">
        <n-input 
          v-model:value="formData.title" 
          :placeholder="t('event.form.titlePlaceholder')"
          :maxlength="100"
          show-count
        />
      </n-form-item>
      
      <n-form-item :label="t('event.form.description')" path="description">
        <n-input 
          v-model:value="formData.description" 
          type="textarea" 
          :placeholder="t('event.form.descriptionPlaceholder')"
          :rows="3"
          :maxlength="500"
          show-count
        />
      </n-form-item>
      
      <n-grid :cols="2" :x-gap="12">
        <n-gi>
          <n-form-item :label="t('event.form.startDate')" path="startDate">
            <n-date-picker 
              v-model:value="formData.startDate" 
              type="datetime" 
              :format="dateFormat"
              :is-date-disabled="disablePastDates"
              clearable
              :placeholder="t('event.form.startDatePlaceholder')"
              style="width: 100%"
            />
          </n-form-item>
        </n-gi>
        <n-gi>
          <n-form-item :label="t('event.form.endDate')" path="endDate">
            <n-date-picker 
              v-model:value="formData.endDate" 
              type="datetime" 
              :format="dateFormat"
              :is-date-disabled="disablePastDates"
              clearable
              :placeholder="t('event.form.endDatePlaceholder')"
              style="width: 100%"
            />
          </n-form-item>
        </n-gi>
      </n-grid>
    </n-form>
    
    <template #action>
      <div class="modal-actions">
        <div class="left-actions">
          <n-button 
            v-if="event?.id" 
            type="error" 
            @click="handleDelete"
            :loading="deleting"
          >
            {{ t('event.buttons.delete') }}
          </n-button>
        </div>
        <div class="right-actions">
          <n-button @click="handleCancel">{{ t('event.buttons.cancel') }}</n-button>
          <n-button 
            type="primary" 
            @click="handleSave"
            :loading="saving"
          >
            {{ event?.id ? t('event.buttons.update') : t('event.buttons.create') }}
          </n-button>
        </div>
      </div>
    </template>
  </n-modal>
</template>

<script setup>
import { ref, watch, computed } from 'vue'
import { useMessage } from 'naive-ui'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  show: Boolean,
  event: Object
})

const emit = defineEmits(['update:show', 'save', 'delete'])

// Composables
const { t } = useI18n()
const message = useMessage()

const formRef = ref(null)
const saving = ref(false)
const deleting = ref(false)

const formData = ref({
  title: '',
  description: '',
  startDate: null,
  endDate: null
})

// Formato de fecha dinámico según el idioma
const dateFormat = computed(() => t('event.dateFormat'))

// Reglas de validación dinámicas
const rules = computed(() => ({
  title: {
    required: true,
    message: t('event.validation.titleRequired'),
    trigger: ['blur', 'input'],
    validator: (rule, value) => {
      if (!value?.trim()) {
        return new Error(t('event.validation.titleRequired'))
      }
      if (value.trim().length < 3) {
        return new Error(t('event.validation.titleMinLength'))
      }
      return true
    }
  },
  startDate: {
    required: true,
    message: t('event.validation.startDateRequired'),
    trigger: ['blur', 'change'],
    type: 'number',
    validator: (rule, value) => {
      if (!value) {
        return new Error(t('event.validation.startDateRequired'))
      }
      return true
    }
  },
  endDate: {
    required: true,
    message: t('event.validation.endDateRequired'),
    trigger: ['blur', 'change'],
    type: 'number',
    validator: (rule, value) => {
      if (!value) {
        return new Error(t('event.validation.endDateRequired'))
      }
      
      if (formData.value.startDate && value <= formData.value.startDate) {
        return new Error(t('event.validation.endDateAfterStart'))
      }
      
      // Validar que no sea más de 24 horas
      if (formData.value.startDate) {
        const maxDuration = 24 * 60 * 60 * 1000 // 24 horas en ms
        if (value - formData.value.startDate > maxDuration) {
          return new Error(t('event.validation.maxDuration'))
        }
      }
      
      return true
    }
  }
}))

const show = computed({
  get: () => props.show,
  set: (value) => emit('update:show', value)
})

const disablePastDates = (timestamp) => {
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  return timestamp < now.getTime()
}

const handleSave = async () => {
  try {
    saving.value = true
    
    // Validar usando solo NaiveUI
    await formRef.value?.validate()
    
    const eventData = {
      id: props.event?.id,
      title: formData.value.title.trim(),
      description: formData.value.description?.trim() || '',
      start: new Date(formData.value.startDate).toISOString(),
      end: new Date(formData.value.endDate).toISOString()
    }
    
    console.log('Enviando evento:', eventData)
    emit('save', eventData)
    show.value = false
    
  } catch (error) {
    // Manejar tanto errores de validación como otros errores
    console.log('Error:', error)
    
    if (error.length && Array.isArray(error)) {
      // Errores de validación de NaiveUI
      message.warning(t('event.validation.formErrors'))
    } else {
      // Otros errores
      console.error('Error inesperado:', error)
      message.error(t('event.validation.processError'))
    }
  } finally {
    saving.value = false
  }
}

const handleDelete = async () => {
  if (!props.event?.id) return
  
  deleting.value = true
  try {
    emit('delete', props.event.id)
    show.value = false
  } finally {
    deleting.value = false
  }
}

const handleCancel = () => {
  show.value = false
}

const resetForm = () => {
  formData.value = {
    title: '',
    description: '',
    startDate: null,
    endDate: null
  }
  
  // Limpiar errores de validación
  formRef.value?.restoreValidation()
}

const loadEventData = (event) => {
  if (!event) {
    // Nuevo evento - fechas por defecto
    const now = new Date()
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000)
    
    formData.value = {
      title: '',
      description: '',
      startDate: now.getTime(),
      endDate: oneHourLater.getTime()
    }
    return
  }
  
  // Editar evento existente o con fechas preseleccionadas
  formData.value = {
    title: event.title || '',
    description: event.description || '',
    startDate: event.start ? new Date(event.start).getTime() : null,
    endDate: event.end ? new Date(event.end).getTime() : null
  }
}

watch(() => props.event, (newEvent) => {
  if (props.show) {
    loadEventData(newEvent)
  }
}, { immediate: true })

watch(() => props.show, (isShown) => {
  if (isShown) {
    loadEventData(props.event)
  } else {
    // Limpiar formulario al cerrar (con delay para animación)
    setTimeout(() => {
      resetForm()
    }, 300)
  }
})
</script>

<style scoped>
.modal-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.right-actions {
  display: flex;
  gap: 0.5rem;
}
</style> 