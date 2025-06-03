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
    <n-card v-if="groupedEvents.length > 0" class="events-card grouped-events-card" size="small">
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
                  <n-text style="font-size: 14px; line-height: 1.3;">{{ event.title }}</n-text>
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
import { ref, computed, watch } from 'vue'
import { ChevronBack, ChevronForward, Time, Calendar } from '@vicons/ionicons5'
import { useThemeVars } from 'naive-ui'
import { useI18n } from 'vue-i18n'
import { useSettingsStore } from '../../store/settings'

const props = defineProps({
  selectedDate: Date,
  todayEvents: Array,
  upcomingEvents: Array
})

const emit = defineEmits(['date-select', 'event-select'])

// Composables
const { t, locale } = useI18n()
const settingsStore = useSettingsStore()

const currentDate = ref(new Date())

// Agregar las variables de tema
const themeVars = useThemeVars()

// Definir el mismo color verde consistente
const APP_GREEN = '#63e2b7'
const APP_GREEN_HOVER = '#7fe7c4'

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
  return [...props.todayEvents, ...props.upcomingEvents].some(event => 
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
  const events = [...props.todayEvents, ...props.upcomingEvents]
  const grouped = {}
  const today = new Date()

  events.forEach(event => {
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
</script>

<style scoped>
.calendar-sidebar {
  display: flex;
  flex-direction: column;
  gap: 12px;
  height: 100%;
  overflow: hidden;
  min-height: 0;
}

.calendar-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-left: 0;
}

/* Remover los estilos hardcodeados y usar variables de tema */
.calendar-header :deep(.n-text) {
  font-size: 1rem !important;
  font-weight: 600 !important;
  color: v-bind('themeVars.textColor1') !important;
  letter-spacing: 0.02em !important;
  text-transform: capitalize !important;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif !important;
}

.mini-calendar-card {
  flex-shrink: 0;
}

.mini-calendar-card :deep(.n-card__content) {
  padding-left: 0 !important;
}

.mini-calendar-card :deep(.n-card__header) {
  padding-left: 0 !important;
}

.mini-calendar-container {
  padding: 4px;
  padding-left: 0;
}

.day-header {
  text-align: center;
  padding: 2px;
}

.calendar-day-btn {
  position: relative;
}

.calendar-day-btn.other-month {
  opacity: 0.4;
}

.event-indicator {
  position: absolute;
  bottom: 2px;
  right: 2px;
  width: 6px;
  height: 6px;
  background-color: v-bind('APP_GREEN');
  border-radius: 50%;
  border: 1px solid white;
}

.events-card {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.events-card :deep(.n-card__content) {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  padding: 0 !important;
}

.events-card :deep(.n-card__header) {
  padding-left: 0 !important;
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
  padding: 16px;
}

.upcoming-events-card {
  flex: 2;
  min-height: 250px;
}

.upcoming-events-card :deep(.n-scrollbar) {
  max-height: 400px !important;
}

.events-scroll-container {
  max-height: calc(40vh - 100px);
  min-height: 200px;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 16px;
  margin: -16px;
  margin-left: -16px;
  padding-right: 8px;
}

.events-scroll-container::-webkit-scrollbar {
  width: 6px;
}

.events-scroll-container::-webkit-scrollbar-track {
  background: transparent;
}

.events-scroll-container::-webkit-scrollbar-thumb {
  background: #d1d5db;
  border-radius: 3px;
}

.events-scroll-container::-webkit-scrollbar-thumb:hover {
  background: #9ca3af;
}

.event-card {
  transition: transform 0.2s ease;
}

.event-card:hover {
  transform: translateX(2px);
}

.event-card :deep(.n-card__content) {
  padding-left: 12px !important;
}

/* Responsive adjustments */
@media (max-height: 800px) {
  .calendar-sidebar {
    gap: 8px;
  }
  
  .mini-calendar-card {
    flex-shrink: 1;
  }
  
  .events-card :deep(.n-scrollbar) {
    max-height: 150px !important;
  }
}

.grouped-events-card {
  flex: 2;
  min-height: 300px;
}

.day-group {
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 16px;
  margin-bottom: 16px;
}

.day-group:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.day-header-section {
  margin-bottom: 12px;
  padding: 8px 12px;
  background: v-bind('themeVars.cardColor');
  border-radius: 6px;
  border-left: 3px solid v-bind('APP_GREEN');
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.day-label {
  font-size: 13px !important;
  font-weight: 600 !important;
  color: v-bind('APP_GREEN') !important;
  text-transform: uppercase !important;
  letter-spacing: 0.5px !important;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif !important;
}

.clickable-event {
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.clickable-event:hover {
  transform: translateX(4px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.clickable-event:active {
  transform: translateX(2px);
}

.events-header {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
}

.events-icon {
  color: v-bind('APP_GREEN');
  font-size: 18px;
}

.events-title {
  font-size: 15px !important;
  font-weight: 600 !important;
  color: v-bind('themeVars.textColor1') !important;
  letter-spacing: 0.025em !important;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif !important;
}

/* Opcional: agregar un gradiente sutil al header */
.events-card :deep(.n-card__header) {
  background: linear-gradient(135deg, v-bind('themeVars.cardColor') 0%, v-bind('themeVars.bodyColor') 100%);
  border-bottom: 1px solid v-bind('themeVars.borderColor');
  padding-left: 0 !important;
}

/* Botones del calendario mini */
:deep(.n-button--primary-type) {
  --n-color: v-bind('APP_GREEN') !important;
  --n-color-hover: v-bind('APP_GREEN_HOVER') !important;
  --n-color-pressed: v-bind('APP_GREEN') !important;
  --n-border: 1px solid v-bind('APP_GREEN') !important;
  --n-border-hover: 1px solid v-bind('APP_GREEN_HOVER') !important;
  --n-border-pressed: 1px solid v-bind('APP_GREEN') !important;
}
</style> 