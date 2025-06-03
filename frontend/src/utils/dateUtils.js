/**
 * Utilidades de fecha para la aplicación de calendario
 * Manejo consistente entre FullCalendar, NaiveUI y Backend
 */

// ===== CONSTANTES =====
export const DATE_FORMATS = {
  DISPLAY_DATE: 'es-ES',
  TIME_12H: { hour: '2-digit', minute: '2-digit', hour12: false },
  DATE_LONG: { day: 'numeric', month: 'long', year: 'numeric' },
  DATE_SHORT: { day: 'numeric', month: 'short' },
  MONTH_YEAR: { month: 'long', year: 'numeric' },
  WEEKDAY_SHORT: { weekday: 'short', month: 'short', day: 'numeric' }
}

// ===== VALIDACIÓN Y CONVERSIÓN =====

/**
 * Convierte cualquier tipo de fecha a objeto Date válido
 * @param {Date|string|number} input - Fecha en cualquier formato
 * @returns {Date|null} - Objeto Date válido o null si es inválido
 */
export const toDate = (input) => {
  if (!input) return null
  
  if (input instanceof Date) {
    return isNaN(input.getTime()) ? null : input
  }
  
  const date = new Date(input)
  return isNaN(date.getTime()) ? null : date
}

/**
 * Convierte fecha a string ISO para el backend
 * @param {Date|string|number} input - Fecha en cualquier formato
 * @returns {string|null} - String ISO o null si es inválido
 */
export const toISOString = (input) => {
  const date = toDate(input)
  return date ? date.toISOString() : null
}

/**
 * Convierte fecha a timestamp para NaiveUI DatePicker
 * @param {Date|string|number} input - Fecha en cualquier formato
 * @returns {number|null} - Timestamp o null si es inválido
 */
export const toTimestamp = (input) => {
  const date = toDate(input)
  return date ? date.getTime() : null
}

// ===== COMPARACIÓN =====

/**
 * Comprueba si dos fechas son el mismo día
 * @param {Date|string|number} date1 
 * @param {Date|string|number} date2 
 * @returns {boolean}
 */
export const isSameDay = (date1, date2) => {
  const d1 = toDate(date1)
  const d2 = toDate(date2)
  
  if (!d1 || !d2) return false
  
  return d1.toDateString() === d2.toDateString()
}

/**
 * Comprueba si una fecha está en un rango
 * @param {Date|string|number} date - Fecha a comprobar
 * @param {Date|string|number} start - Inicio del rango
 * @param {Date|string|number} end - Fin del rango
 * @returns {boolean}
 */
export const isDateInRange = (date, start, end) => {
  const d = toDate(date)
  const s = toDate(start)
  const e = toDate(end)
  
  if (!d || !s || !e) return false
  
  return d >= s && d <= e
}

// ===== FORMATEO PARA DISPLAY =====

/**
 * Formatea fecha para mostrar (ej: "15 de enero de 2024")
 * @param {Date|string|number} input 
 * @returns {string}
 */
export const formatDisplayDate = (input) => {
  const date = toDate(input)
  if (!date) return 'Fecha inválida'
  
  return date.toLocaleDateString(DATE_FORMATS.DISPLAY_DATE, DATE_FORMATS.DATE_LONG)
}

/**
 * Formatea solo el mes y año (ej: "enero 2024")
 * @param {Date|string|number} input 
 * @returns {string}
 */
export const formatMonthYear = (input) => {
  const date = toDate(input)
  if (!date) return 'Fecha inválida'
  
  return date.toLocaleDateString(DATE_FORMATS.DISPLAY_DATE, DATE_FORMATS.MONTH_YEAR)
}

/**
 * Formatea hora para mostrar (ej: "14:30")
 * @param {Date|string|number} input 
 * @returns {string}
 */
export const formatTime = (input) => {
  const date = toDate(input)
  if (!date) return 'Hora inválida'
  
  return date.toLocaleTimeString(DATE_FORMATS.DISPLAY_DATE, DATE_FORMATS.TIME_12H)
}

/**
 * Formatea rango de tiempo (ej: "14:30 - 16:00")
 * @param {Date|string|number} start 
 * @param {Date|string|number} end 
 * @returns {string}
 */
export const formatTimeRange = (start, end) => {
  const startTime = formatTime(start)
  const endTime = formatTime(end)
  
  if (startTime === 'Hora inválida' || endTime === 'Hora inválida') {
    return startTime
  }
  
  return `${startTime} - ${endTime}`
}

/**
 * Formatea fecha corta para eventos (ej: "mié, 15 ene")
 * @param {Date|string|number} input 
 * @returns {string}
 */
export const formatEventDate = (input) => {
  const date = toDate(input)
  if (!date) return 'Fecha inválida'
  
  return date.toLocaleDateString(DATE_FORMATS.DISPLAY_DATE, DATE_FORMATS.WEEKDAY_SHORT)
}

// ===== OPERACIONES DE FECHA =====

/**
 * Obtiene el inicio del día
 * @param {Date|string|number} input 
 * @returns {Date|null}
 */
export const startOfDay = (input) => {
  const date = toDate(input)
  if (!date) return null
  
  const result = new Date(date)
  result.setHours(0, 0, 0, 0)
  return result
}

/**
 * Obtiene el fin del día
 * @param {Date|string|number} input 
 * @returns {Date|null}
 */
export const endOfDay = (input) => {
  const date = toDate(input)
  if (!date) return null
  
  const result = new Date(date)
  result.setHours(23, 59, 59, 999)
  return result
}

/**
 * Agrega días a una fecha
 * @param {Date|string|number} input 
 * @param {number} days 
 * @returns {Date|null}
 */
export const addDays = (input, days) => {
  const date = toDate(input)
  if (!date) return null
  
  const result = new Date(date)
  result.setDate(result.getDate() + days)
  return result
}

/**
 * Agrega horas a una fecha
 * @param {Date|string|number} input 
 * @param {number} hours 
 * @returns {Date|null}
 */
export const addHours = (input, hours) => {
  const date = toDate(input)
  if (!date) return null
  
  const result = new Date(date)
  result.setHours(result.getHours() + hours)
  return result
}

// ===== UTILIDADES ESPECÍFICAS DEL CALENDARIO =====

/**
 * Obtiene eventos de hoy
 * @param {Array} events - Array de eventos
 * @returns {Array}
 */
export const getTodayEvents = (events) => {
  const today = new Date()
  return events.filter(event => 
    isSameDay(event.start, today)
  )
}

/**
 * Obtiene eventos de la próxima semana
 * @param {Array} events - Array de eventos
 * @param {number} limit - Límite de eventos a retornar
 * @returns {Array}
 */
export const getUpcomingEvents = (events, limit = 5) => {
  const today = new Date()
  const nextWeek = addDays(today, 7)
  
  return events
    .filter(event => {
      const eventDate = toDate(event.start)
      return eventDate && eventDate > today && eventDate <= nextWeek
    })
    .sort((a, b) => toDate(a.start) - toDate(b.start))
    .slice(0, limit)
}

/**
 * Crea fechas por defecto para nuevo evento
 * @returns {Object} - Objeto con start y end
 */
export const getDefaultEventDates = () => {
  const now = new Date()
  const oneHourLater = addHours(now, 1)
  
  return {
    start: now,
    end: oneHourLater
  }
} 