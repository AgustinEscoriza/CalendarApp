<template>
  <div class="calendar-sidebar">
    <!-- Mini Calendar -->
    <n-card class="mini-calendar-card" size="small">
      <template #header>
        <div class="calendar-header">
          <n-text strong class="month-title">{{ currentMonth }}</n-text>
          <n-button-group size="small">
            <n-button @click="goToPreviousMonth" quaternary circle size="small">
              <template #icon>
                <n-icon><ChevronBack /></n-icon>
              </template>
            </n-button>
            <n-button @click="goToNextMonth" quaternary circle size="small">
              <template #icon>
                <n-icon><ChevronForward /></n-icon>
              </template>
            </n-button>
          </n-button-group>
        </div>
      </template>
      
      <!-- Calendar Grid -->
      <div class="mini-calendar-container">
        <n-grid :cols="7" x-gap="2" y-gap="1">
          <!-- Day headers -->
          <n-gi v-for="day in dayHeaders" :key="day">
            <div class="day-header">
              <n-text depth="2" style="font-size: 12px; font-weight: 600;">{{ day }}</n-text>
            </div>
          </n-gi>
          
          <!-- Calendar days -->
          <n-gi v-for="date in calendarDates" :key="date.key">
            <n-button
              size="small"
              :type="getDateButtonType(date)"
              :quaternary="!date.isSelected && !date.isToday"
              :secondary="date.isSelected && !date.isToday"
              @click="selectDate(date.date)"
              :class="['calendar-day-btn', {
                'other-month': !date.isCurrentMonth,
                'has-events': date.hasEvents
              }]"
              style="width: 100%; height: 24px; font-size: 11px;"
            >
              {{ date.day }}
              <div v-if="date.hasEvents" class="event-indicator"></div>
            </n-button>
          </n-gi>
        </n-grid>
      </div>
    </n-card>

    <!-- Events grouped by day -->
    <n-card v-if="groupedEvents.length > 0" class="events-card" size="small">
      <template #header>
        <div class="events-header">
          <n-icon class="events-icon">
            <Calendar />
          </n-icon>
          <n-text strong class="events-title">{{ t('calendar.upcomingEvents') }}</n-text>
        </div>
      </template>
      
      <div class="events-scroll-container">
        <n-space vertical size="medium">
          <div v-for="dayGroup in groupedEvents" :key="dayGroup.date" class="day-group">
            <!-- Day header -->
            <div class="day-header-section">
              <n-text strong class="day-label">
                {{ dayGroup.dayLabel }}
              </n-text>
            </div>
            
            <!-- Events for this day -->
            <n-card
              v-for="event in dayGroup.events" 
              :key="event.id"
              size="small"
              hoverable
              class="event-card clickable-event"
              :style="{ borderLeft: `4px solid ${event.backgroundColor || '#3788d8'}` }"
              @click="selectEvent(event)"
            >
              <n-thing>
                <template #header>
                  <div class="event-header">
                    <n-text style="font-size: 14px; line-height: 1.3;">{{ event.title }}</n-text>
                    <!-- Weather Info -->
                    <div v-if="eventWeather[event.id]" class="event-weather">
                      <img 
                        :src="getWeatherIconUrl(eventWeather[event.id].icon)" 
                        :alt="eventWeather[event.id].description"
                        class="weather-icon"
                      />
                      <n-text style="font-size: 13px; font-weight: 600;">
                        {{ eventWeather[event.id].temp }}°
                      </n-text>
                    </div>
                  </div>
                </template>
                <template #description>
                  <n-text depth="3" style="font-size: 12px;">
                    <n-icon style="margin-right: 4px;"><Time /></n-icon>
                    {{ formatEventTime(event) }}
                  </n-text>
                </template>
              </n-thing>
            </n-card>
          </div>
        </n-space>
      </div>
    </n-card>
  </div>
</template>

<script setup>
import '../../styles/calendar-sidebar.css'
import { ref, computed, watch, onMounted } from 'vue'
import { ChevronBack, ChevronForward, Time, Calendar } from '@vicons/ionicons5'
import { useThemeVars } from 'naive-ui'
import { useI18n } from 'vue-i18n'
import { useSettingsStore } from '../../store/settings'
import { useWeather } from '../../services/useWeather'

const props = defineProps({
  selectedDate: Date,
  todayEvents: Array,
  upcomingEvents: Array
})

const emit = defineEmits(['date-select', 'event-select'])

// Composables
const { t, locale } = useI18n()
const settingsStore = useSettingsStore()
const { getWeatherForDate, getWeatherIconUrl } = useWeather()

const currentDate = ref(new Date())
const eventWeather = ref({})

// Agregar las variables de tema
const themeVars = useThemeVars()

// Headers de días dinámicos - comenzando en lunes
const dayHeaders = computed(() => {
  return locale.value === 'en' 
    ? ['M', 'T', 'W', 'T', 'F', 'S', 'S']  // Lunes a domingo en inglés
    : ['L', 'M', 'M', 'J', 'V', 'S', 'D']  // Lunes a domingo en español
})

const currentMonth = computed(() => {
  const localeCode = locale.value === 'es' ? 'es-ES' : 'en-US'
  return currentDate.value.toLocaleDateString(localeCode, {
    month: 'long',
    year: 'numeric'
  })
})

const getDateButtonType = (date) => {
  if (date.isToday) return 'primary'
  if (date.isSelected) return 'info'
  return 'default'
}

const calendarDates = computed(() => {
  const year = currentDate.value.getFullYear()
  const month = currentDate.value.getMonth()
  
  const firstDayOfMonth = new Date(year, month, 1)
  const lastDayOfMonth = new Date(year, month + 1, 0)
  const firstDayOfWeek = firstDayOfMonth.getDay()
  const daysInMonth = lastDayOfMonth.getDate()
  
  const dates = []
  
  // Días del mes anterior
  const prevMonth = new Date(year, month - 1, 0)
  for (let i = firstDayOfWeek - 1; i >= 0; i--) {
    const day = prevMonth.getDate() - i
    dates.push({
      day,
      date: new Date(year, month - 1, day),
      isCurrentMonth: false,
      isToday: false,
      isSelected: false,
      hasEvents: false,
      key: `prev-${day}`
    })
  }
  
  // Días del mes actual
  for (let day = 1; day <= daysInMonth; day++) {
    const date = new Date(year, month, day)
    const today = new Date()
    dates.push({
      day,
      date,
      isCurrentMonth: true,
      isToday: isSameDay(date, today),
      isSelected: isSameDay(date, props.selectedDate),
      hasEvents: hasEventsOnDate(date),
      key: `current-${day}`
    })
  }
  
  // Días del mes siguiente
  const totalCells = 42 // 6 semanas * 7 días
  const remainingCells = totalCells - dates.length
  for (let day = 1; day <= remainingCells; day++) {
    dates.push({
      day,
      date: new Date(year, month + 1, day),
      isCurrentMonth: false,
      isToday: false,
      isSelected: false,
      hasEvents: false,
      key: `next-${day}`
    })
  }
  
  return dates
})

const goToPreviousMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() - 1, 1)
}

const goToNextMonth = () => {
  currentDate.value = new Date(currentDate.value.getFullYear(), currentDate.value.getMonth() + 1, 1)
}

const selectDate = (date) => {
  emit('date-select', date)
}

const isSameDay = (date1, date2) => {
  if (!date1 || !date2) return false
  return date1.toDateString() === date2.toDateString()
}

const hasEventsOnDate = (date) => {
  return [...(props.todayEvents || []), ...(props.upcomingEvents || [])].some(event => 
    isSameDay(new Date(event.start), date)
  )
}

const formatEventTime = (event) => {
  const start = new Date(event.start)
  const end = event.end ? new Date(event.end) : null
  
  // Usar configuración de formato de hora del usuario
  const timeFormat = settingsStore.currentTimeFormat
  const formatOptions = timeFormat === '12h' 
    ? { hour: '2-digit', minute: '2-digit', hour12: true }
    : { hour: '2-digit', minute: '2-digit', hour12: false }
  
  const localeCode = locale.value === 'es' ? 'es-ES' : 'en-US'
  
  const startTime = start.toLocaleTimeString(localeCode, formatOptions)
  
  if (end) {
    const endTime = end.toLocaleTimeString(localeCode, formatOptions)
    return `${startTime} - ${endTime}`
  }
  
  return startTime
}

const formatEventDate = (event) => {
  const date = new Date(event.start)
  const localeCode = locale.value === 'es' ? 'es-ES' : 'en-US'
  return date.toLocaleDateString(localeCode, {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  })
}

// Sincronizar el mini calendario con la fecha seleccionada
watch(() => props.selectedDate, (newDate) => {
  if (newDate && newDate.getMonth() !== currentDate.value.getMonth()) {
    currentDate.value = new Date(newDate.getFullYear(), newDate.getMonth(), 1)
  }
})

const groupedEvents = computed(() => {
  const allEvents = [...(props.todayEvents || []), ...(props.upcomingEvents || [])]
  const uniqueEvents = allEvents.reduce((acc, event) => {
    if (!acc.find(e => e.id === event.id)) {
      acc.push(event)
    }
    return acc
  }, [])
  
  const grouped = {}
  const today = new Date()

  uniqueEvents.forEach(event => {
    const eventDate = new Date(event.start)
    const dateKey = eventDate.toDateString()
    
    if (!grouped[dateKey]) {
      const isToday = isSameDay(eventDate, today)
      let dayLabel
      
      if (isToday) {
        dayLabel = t('calendar.today')
      } else {
        const localeCode = locale.value === 'es' ? 'es-ES' : 'en-US'
        dayLabel = eventDate.toLocaleDateString(localeCode, {
          weekday: 'long'
        }).toUpperCase()
      }
      
      grouped[dateKey] = {
        date: eventDate,
        dayLabel: dayLabel,
        events: []
      }
    }
    grouped[dateKey].events.push(event)
  })

  return Object.values(grouped)
    .sort((a, b) => a.date - b.date)
    .map(group => ({
      ...group,
      events: group.events.sort((a, b) => new Date(a.start) - new Date(b.start))
    }))
})

// Función para manejar click en evento
const selectEvent = (event) => {
  emit('event-select', event)
}

// Función para cargar clima de los eventos
const loadEventWeather = async () => {
  const allEvents = [...(props.todayEvents || []), ...(props.upcomingEvents || [])]
  
  // Limpiar clima anterior
  eventWeather.value = {}
  
  for (const event of allEvents) {
    try {
      const eventDate = new Date(event.start)
      const weather = await getWeatherForDate(eventDate)
      eventWeather.value[event.id] = weather
    } catch (error) {
      console.error(`Error loading weather for event ${event.id}:`, error)
    }
  }
}

// Cargar clima cuando cambian los eventos
watch([() => props.todayEvents, () => props.upcomingEvents], loadEventWeather, { immediate: true })

onMounted(() => {
  loadEventWeather()
})
</script>

<style scoped>
/* Estilos específicos del tema que necesitan v-bind */
.calendar-header :deep(.n-text) {
  font-size: 1rem !important;
  font-weight: 600 !important;
  color: v-bind('themeVars.textColor1') !important;
  letter-spacing: 0.02em !important;
  text-transform: capitalize !important;
  font-family: var(--font-family-system) !important;
}

.mini-calendar-card :deep(.n-card__content),
.mini-calendar-card :deep(.n-card__header) {
  padding-left: 0 !important;
}

.day-header-section {
  background: v-bind('themeVars.cardColor');
}

.events-title {
  color: v-bind('themeVars.textColor1') !important;
}

.events-card :deep(.n-card__content) {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 0 !important;
  overflow: hidden;
}

.events-card :deep(.n-card__header) {
  padding-left: 0 !important;
  flex-shrink: 0;
  background: linear-gradient(135deg, v-bind('themeVars.cardColor') 0%, v-bind('themeVars.bodyColor') 100%);
  border-bottom: 1px solid v-bind('themeVars.borderColor');
}

.events-card :deep(.n-scrollbar) {
  flex: 1;
  min-height: 0;
  height: 100% !important;
  max-height: none !important;
}

.events-card :deep(.n-scrollbar-container) {
  height: 100% !important;
  max-height: none !important;
}

.events-card :deep(.n-scrollbar-content) {
  padding: var(--spacing-lg);
}

.event-card :deep(.n-card__content) {
  padding-left: var(--spacing-md) !important;
}

/* Botones del calendario mini */
:deep(.n-button--primary-type) {
  --n-color: var(--app-green) !important;
  --n-color-hover: var(--app-green-hover) !important;
  --n-color-pressed: var(--app-green-dark) !important;
  --n-border: 1px solid var(--app-green) !important;
  --n-border-hover: 1px solid var(--app-green-hover) !important;
  --n-border-pressed: 1px solid var(--app-green-dark) !important;
}

/* Weather styles */
.event-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.event-weather {
  display: flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
}

.weather-icon {
  width: 24px;
  height: 24px;
  object-fit: contain;
}
</style> 