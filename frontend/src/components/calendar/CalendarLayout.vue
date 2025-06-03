<template>
  <div class="calendar-layout" :class="{ 'dark-theme': settingsStore.isDarkMode }" :data-theme="settingsStore.isDarkMode ? 'dark' : 'light'">
    <!-- Header -->
    <div class="calendar-header">
      <div class="header-left">
        <n-button-group>
          <n-button @click="goToToday">{{ t('calendar.navigation.today') }}</n-button>
          <n-button @click="goToPrevious">{{ t('calendar.navigation.previous') }}</n-button>
          <n-button @click="goToNext">{{ t('calendar.navigation.next') }}</n-button>
        </n-button-group>
        <h2 class="current-period">{{ currentPeriod }}</h2>
      </div>
      <div class="header-right">
        <n-button-group>
          <n-button 
            :type="currentView === 'dayGridMonth' ? 'primary' : 'default'" 
            @click="changeView('dayGridMonth')"
            :style="currentView === 'dayGridMonth' ? customPrimaryButtonStyle : {}"
          >
            {{ t('calendar.views.month') }}
          </n-button>
          <n-button 
            :type="currentView === 'timeGridWeek' ? 'primary' : 'default'" 
            @click="changeView('timeGridWeek')"
            :style="currentView === 'timeGridWeek' ? customPrimaryButtonStyle : {}"
          >
            {{ t('calendar.views.week') }}
          </n-button>
          <n-button 
            :type="currentView === 'timeGridDay' ? 'primary' : 'default'" 
            @click="changeView('timeGridDay')"
            :style="currentView === 'timeGridDay' ? customPrimaryButtonStyle : {}"
          >
            {{ t('calendar.views.day') }}
          </n-button>
        </n-button-group>
        <n-button type="primary" @click="showCreateEvent = true" quaternary circle :style="customPrimaryButtonStyle">
          <template #icon>
            <n-icon><Add /></n-icon>
          </template>
        </n-button>
        <n-button @click="showSettingsModal = true" quaternary circle>
          <template #icon>
            <n-icon><Settings /></n-icon>
          </template>
        </n-button>
        <n-button @click="handleLogout" type="error" quaternary circle>
          <template #icon>
            <n-icon><LogOut /></n-icon>
          </template>
        </n-button>
      </div>
    </div>

    <!-- Main Content --> 
    <div class="calendar-main">
      <!-- Sidebar -->
      <div class="calendar-sidebar">
        <CalendarSidebar 
          :selected-date="selectedDate"
          :today-events="todayEvents"
          :upcoming-events="upcomingEvents"
          @date-select="handleDateSelect"
          @event-select="handleEventSelect"
        />
      </div>

      <!-- Calendar Area -->
      <div class="calendar-content" :data-theme="settingsStore.isDarkMode ? 'dark' : 'light'">
        <FullCalendar
          ref="fullCalendar"
          :options="calendarOptions"
          @date-select="handleDateSelect"
          @event-click="handleEventClick"
        />
      </div>
    </div>

    <!-- Event Modal -->
    <EventModal 
      v-model:show="showCreateEvent"
      :event="selectedEvent"
      @save="handleEventSave"
      @delete="handleEventDelete"
    />
    
    <!-- Settings Modal -->
    <SettingsModal v-model:show="showSettingsModal" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { NButton, NButtonGroup, useThemeVars, darkTheme, NIcon } from 'naive-ui'
import { Settings, Add, LogOut } from '@vicons/ionicons5'
import FullCalendar from '@fullcalendar/vue3'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import esLocale from '@fullcalendar/core/locales/es'
import { getEvents, createEvent, updateEvent, deleteEvent } from '../../services/events'
import { useAuthStore } from '../../store/auth'
import { useSettingsStore } from '../../store/settings'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import CalendarSidebar from './CalendarSidebar.vue'
import EventModal from '../event/EventModal.vue'
import SettingsModal from '../settings/SettingsModal.vue'

import {
  formatTimeRange,
  isSameDay,
  toISOString,
  getTodayEvents,
  getUpcomingEvents,
  getDefaultEventDates
} from '../../utils/dateUtils'

// Importar estilos modulares
import '../../styles/calendar-layout.css'
import '../../styles/calendar-events.css'
import '../../styles/calendar-dark-theme.css'
import '../../styles/utility-classes.css'

const { t, locale } = useI18n()
const auth = useAuthStore()
const settingsStore = useSettingsStore()
const router = useRouter()

const fullCalendar = ref(null)
const events = ref([])
const selectedDate = ref(new Date())
const selectedEvent = ref(null)
const showCreateEvent = ref(false)
const showSettingsModal = ref(false)
const currentView = ref('timeGridWeek')
const loading = ref(true)

const themeVars = useThemeVars()

// Definir el color verde claro consistente
const APP_GREEN = '#63e2b7'
const APP_GREEN_HOVER = '#7fe7c4'
const APP_GREEN_DARK = '#52c3a1'

// Funciones de formateo dinámicas que respetan el locale
const formatDisplayDate = (date) => {
  if (!date) return ''
  const localeCode = locale.value === 'es' ? 'es-ES' : 'en-US'
  return new Date(date).toLocaleDateString(localeCode, {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

const formatMonthYear = (date) => {
  if (!date) return ''
  const localeCode = locale.value === 'es' ? 'es-ES' : 'en-US'
  return new Date(date).toLocaleDateString(localeCode, {
    month: 'long',
    year: 'numeric'
  })
}

const eventColors = computed(() => ({
  primary: themeVars.value.primaryColor,
  success: themeVars.value.successColor,
  warning: themeVars.value.warningColor,
  error: themeVars.value.errorColor,
  info: themeVars.value.infoColor
}))

const calendarOptions = computed(() => ({
  plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
  initialView: currentView.value,
  locale: locale.value === 'es' ? esLocale : undefined,
  firstDay: 1,
  headerToolbar: false,
  height: '100%',
  slotMinTime: '00:00:00',
  slotMaxTime: '23:59:59',
  allDaySlot: false,
  slotDuration: '01:00:00',
  slotLabelInterval: '01:00:00',
  slotMinHeight: 60,
  slotLabelFormat: {
    hour: 'numeric',
    minute: '2-digit',
    omitZeroMinute: false,
    meridiem: settingsStore.currentTimeFormat === '12h'
  },
  events: events.value,
  selectable: true,
  selectMirror: true,
  dayMaxEvents: true,
  weekends: true,
  editable: true,
  droppable: true,
  eventResizableFromStart: true,
  select: handleDateRangeSelect,
  eventClick: handleEventClick,
  eventDrop: handleEventDrop,
  eventResize: handleEventResize,
  nowIndicator: true,
  businessHours: {
    daysOfWeek: [1, 2, 3, 4, 5], // Lunes a viernes
    startTime: '00:00',
    endTime: '23:00',
  },
  scrollTime: '08:00:00',
  scrollTimeReset: false
}))

const currentPeriod = computed(() => {
  if (!fullCalendar.value) return ''
  
  const calendarApi = fullCalendar.value.getApi()
  const view = calendarApi.view
  
  if (view.type === 'timeGridWeek') {
    const start = view.currentStart
    const end = new Date(view.currentEnd.getTime() - 1) // Restar 1 día
    return `${formatDisplayDate(start)} - ${formatDisplayDate(end)}`
  } else if (view.type === 'dayGridMonth') {
    return formatMonthYear(view.currentStart)
  } else {
    return formatDisplayDate(view.currentStart)
  }
})

const todayEvents = computed(() => getTodayEvents(events.value))
const upcomingEvents = computed(() => getUpcomingEvents(events.value))

// Métodos del calendario
const goToToday = () => {
  fullCalendar.value.getApi().today()
}

const goToPrevious = () => {
  fullCalendar.value.getApi().prev()
}

const goToNext = () => {
  fullCalendar.value.getApi().next()
}

const changeView = (view) => {
  currentView.value = view
  fullCalendar.value.getApi().changeView(view)
}

const handleDateSelect = (date) => {
  selectedDate.value = date
  fullCalendar.value.getApi().gotoDate(date)
}

const handleDateRangeSelect = (selectInfo) => {
  selectedEvent.value = {
    start: selectInfo.start,
    end: selectInfo.end
  }
  showCreateEvent.value = true
}

const handleEventClick = (clickInfo) => {
  selectedEvent.value = {
    id: clickInfo.event.id,
    title: clickInfo.event.title,
    start: clickInfo.event.start,
    end: clickInfo.event.end,
    description: clickInfo.event.extendedProps.description
  }
  showCreateEvent.value = true
}

const handleEventSave = async (eventData) => {
  try {
    const backendData = {
      title: eventData.title,
      description: eventData.description,
      startDate: toISOString(eventData.start),
      endDate: toISOString(eventData.end)
    }
    
    if (eventData.id) {
      const response = await updateEvent(eventData.id, backendData)
      const index = events.value.findIndex(e => e.id === eventData.id)
      if (index !== -1) {
        events.value[index] = {
          id: response.data.id,
          title: response.data.title,
          start: response.data.startDate,
          end: response.data.endDate,
          description: response.data.description,
          backgroundColor: '#3788d8',
          borderColor: '#3788d8'
        }
      }
      
      updateFullCalendarEvent(eventData.id, response.data)
    } else {
      // Crear nuevo evento
      const response = await createEvent(backendData)
      
      const newEvent = createEventWithTheme({
        id: response.data.id,
        title: response.data.title,
        start: response.data.startDate,
        end: response.data.endDate,
        description: response.data.description
      }, 'primary')
      
      events.value.push(newEvent)
      fullCalendar.value.getApi().addEvent(newEvent)
    }
    
    showCreateEvent.value = false
    selectedEvent.value = null
  } catch (error) {
    console.error(t('calendar.errors.saveEvent'), error)
  }
}

const handleEventDelete = async (eventId) => {
  try {
    await deleteEvent(eventId)
    
    events.value = events.value.filter(e => e.id !== eventId)
    
    const calendarApi = fullCalendar.value.getApi()
    const fcEvent = calendarApi.getEventById(eventId)
    if (fcEvent) {
      fcEvent.remove()
    }
    
    showCreateEvent.value = false
    selectedEvent.value = null
  } catch (error) {
    console.error(t('calendar.errors.deleteEvent'), error)
  }
}

const handleEventDrop = async (dropInfo) => {
  try {
    const eventData = {
      title: dropInfo.event.title,
      description: dropInfo.event.extendedProps.description,
      startDate: toISOString(dropInfo.event.start),
      endDate: toISOString(dropInfo.event.end || dropInfo.event.start)
    }
    
    await updateEvent(dropInfo.event.id, eventData)
    updateLocalEvent(dropInfo.event.id, eventData)
    
  } catch (error) {
    console.error(t('calendar.errors.moveEvent'), error)
    dropInfo.revert()
  }
}

const handleEventResize = async (resizeInfo) => {
  try {
    const eventData = {
      title: resizeInfo.event.title,
      description: resizeInfo.event.extendedProps.description,
      startDate: toISOString(resizeInfo.event.start),
      endDate: toISOString(resizeInfo.event.end || resizeInfo.event.start)
    }
    
    await updateEvent(resizeInfo.event.id, eventData)
    updateLocalEvent(resizeInfo.event.id, eventData)
    
  } catch (error) {
    console.error(t('calendar.errors.resizeEvent'), error)
    resizeInfo.revert()
  }
}

const handleLogout = () => {
  auth.logout()
  router.push('/login')
}

const updateFullCalendarEvent = (eventId, eventData) => {
  const calendarApi = fullCalendar.value.getApi()
  const fcEvent = calendarApi.getEventById(eventId)
  if (fcEvent) {
    fcEvent.setProp('title', eventData.title)
    fcEvent.setStart(eventData.startDate)
    fcEvent.setEnd(eventData.endDate)
    fcEvent.setExtendedProp('description', eventData.description)
  }
}

const updateLocalEvent = (eventId, eventData) => {
  const index = events.value.findIndex(e => e.id === eventId)
  if (index !== -1) {
    events.value[index] = {
      ...events.value[index],
      title: eventData.title,
      start: eventData.startDate,
      end: eventData.endDate,
      description: eventData.description
    }
  }
}

// Estilo personalizado para botones primarios
const customPrimaryButtonStyle = computed(() => ({
  '--n-color': APP_GREEN,
  '--n-color-hover': APP_GREEN_HOVER,
  '--n-color-pressed': APP_GREEN_DARK,
  '--n-color-focus': APP_GREEN,
  '--n-border': `1px solid ${APP_GREEN}`,
  '--n-border-hover': `1px solid ${APP_GREEN_HOVER}`,
  '--n-border-pressed': `1px solid ${APP_GREEN_DARK}`,
  '--n-border-focus': `1px solid ${APP_GREEN}`,
  backgroundColor: APP_GREEN,
  borderColor: APP_GREEN,
  color: 'white'
}))

const createEventWithTheme = (eventData, type = 'primary') => {
  return {
    ...eventData,
    backgroundColor: APP_GREEN,
    borderColor: APP_GREEN,
    textColor: '#101014' // Texto oscuro para contraste con verde claro
  }
}

// Función para manejar selección de evento desde sidebar
const handleEventSelect = (event) => {
  selectedEvent.value = {
    id: event.id,
    title: event.title,
    start: event.start,
    end: event.end,
    description: event.description
  }
  showCreateEvent.value = true
}

// Cargar eventos al montar
onMounted(async () => {
  try {
    const response = await getEvents()
    events.value = response.data.map(event => createEventWithTheme({
      id: event.id,
      title: event.title,
      start: event.startDate,
      end: event.endDate,
      description: event.description
    }, 'primary'))
  } catch (error) {
    console.error(t('calendar.errors.loadEvents'), error)
  } finally {
    loading.value = false
  }
})

// Watcher para actualizar FullCalendar cuando cambie el idioma
watch(
  () => locale.value,
  () => {
    if (fullCalendar.value) {
      const calendarApi = fullCalendar.value.getApi()
      // Forzar re-render del calendario con nuevo locale
      calendarApi.render()
    }
  }
)

// Agregar watcher para sincronizar el tema
watch(
  () => settingsStore.isDarkMode,
  (isDark) => {
    if (fullCalendar.value) {
      const calendarEl = fullCalendar.value.$el
      calendarEl.setAttribute('data-theme', isDark ? 'dark' : 'light')
    }
  },
  { immediate: true }
)
</script>

<style scoped>
/* Solo estilos que necesitan v-bind() del tema */
.calendar-layout {
  background-color: v-bind('themeVars.bodyColor');
}

.calendar-header {
  background: v-bind('themeVars.cardColor');
  border-bottom: 1px solid v-bind('themeVars.borderColor');
  box-shadow: v-bind('themeVars.boxShadow1');
}

.calendar-sidebar {
  background: v-bind('themeVars.cardColor');
  border-right: 1px solid v-bind('themeVars.borderColor');
}

.calendar-content {
  background: v-bind('themeVars.cardColor');
}

.current-period {
  color: v-bind('themeVars.textColor1');
}

:deep(.fc-daygrid-event),
:deep(.fc-timegrid-event) {
  background-color: v-bind('APP_GREEN') !important;
  border-color: v-bind('APP_GREEN') !important;
}

:deep(.fc-event:hover) {
  background-color: v-bind('APP_GREEN_HOVER') !important;
  border-color: v-bind('APP_GREEN_HOVER') !important;
}

.calendar-layout.dark-theme :deep(.fc-event) {
  background-color: v-bind('APP_GREEN') !important;
  border-color: v-bind('APP_GREEN') !important;
}

.calendar-layout.dark-theme :deep(.fc-event:hover) {
  background-color: v-bind('APP_GREEN_HOVER') !important;
  border-color: v-bind('APP_GREEN_HOVER') !important;
}
</style> 