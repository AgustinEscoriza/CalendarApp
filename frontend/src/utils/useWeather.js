import { ref, computed } from 'vue'
import { useSettingsStore } from '../store/settings'

const OPENWEATHER_API_KEY = 'TU_API_KEY_AQUI' // Obtener de https://openweathermap.org/api
const BASE_URL = 'https://api.openweathermap.org/data/2.5'

export const useWeather = () => {
  const weatherCache = ref(new Map())
  const loading = ref(false)
  const error = ref(null)
  const settingsStore = useSettingsStore()

  // Parsear ubicación desde el formato de settings "Buenos Aires, Argentina" 
  const parseLocation = (locationString) => {
    if (!locationString) return 'Mar del Plata,AR' // valor por defecto
    
    // Si tiene formato "Ciudad, País"
    const parts = locationString.split(',').map(part => part.trim())
    if (parts.length >= 2) {
      return `${parts[0]},${parts[1]}`
    }
    
    // Si solo tiene ciudad, asumir Argentina para el demo
    return `${parts[0]},AR`
  }

  const getCurrentWeather = async (customLocation = null) => {
    const location = customLocation || parseLocation(settingsStore.currentLocation)
    const cacheKey = `current_${location}`
    
    // Verificar caché (válido por 10 minutos)
    const cached = weatherCache.value.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < 10 * 60 * 1000) {
      return cached.data
    }

    loading.value = true
    error.value = null

    try {
      const response = await fetch(
        `${BASE_URL}/weather?q=${location}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=es`
      )
      
      if (!response.ok) {
        throw new Error(`Error en API del clima: ${response.status}`)
      }
      
      const data = await response.json()
      
      const weatherData = {
        temp: Math.round(data.main.temp),
        description: data.weather[0].description,
        icon: data.weather[0].icon,
        humidity: data.main.humidity,
        windSpeed: data.wind?.speed || 0,
        city: data.name
      }
      
      // Guardar en caché
      weatherCache.value.set(cacheKey, {
        data: weatherData,
        timestamp: Date.now()
      })
      
      return weatherData
      
    } catch (err) {
      console.error('Error obteniendo clima:', err)
      error.value = err.message
      
      // Retornar datos de ejemplo para el demo
      return {
        temp: 22,
        description: 'clima no disponible',
        icon: '01d',
        humidity: 50,
        windSpeed: 5,
        city: 'Mar del Plata'
      }
    } finally {
      loading.value = false
    }
  }

  // Obtener clima para una fecha específica (pronóstico)
  const getWeatherForDate = async (date, customLocation = null) => {
    const location = customLocation || parseLocation(settingsStore.currentLocation)
    const dateKey = date.toDateString()
    const cacheKey = `forecast_${location}_${dateKey}`
    
    // Verificar caché
    const cached = weatherCache.value.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < 30 * 60 * 1000) {
      return cached.data
    }

    // Para el demo, si la fecha es hoy, retornar clima actual
    const today = new Date()
    if (date.toDateString() === today.toDateString()) {
      return await getCurrentWeather(customLocation)
    }

    // Para fechas futuras dentro de 5 días, usar API de pronóstico
    const diffTime = Math.abs(date - today)
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays <= 5) {
      try {
        const response = await fetch(
          `${BASE_URL}/forecast?q=${location}&appid=${OPENWEATHER_API_KEY}&units=metric&lang=es`
        )
        
        if (!response.ok) {
          throw new Error(`Error en API de pronóstico: ${response.status}`)
        }
        
        const data = await response.json()
        
        // Buscar pronóstico para la fecha específica
        const targetDateStr = date.toISOString().split('T')[0]
        const forecast = data.list.find(item => 
          item.dt_txt.startsWith(targetDateStr)
        )
        
        if (forecast) {
          const weatherData = {
            temp: Math.round(forecast.main.temp),
            description: forecast.weather[0].description,
            icon: forecast.weather[0].icon,
            humidity: forecast.main.humidity,
            windSpeed: forecast.wind?.speed || 0,
            city: data.city.name
          }
          
          weatherCache.value.set(cacheKey, {
            data: weatherData,
            timestamp: Date.now()
          })
          
          return weatherData
        }
      } catch (err) {
        console.error('Error obteniendo pronóstico:', err)
      }
    }
    
    // Valor por defecto para fechas fuera del pronóstico o errores
    return {
      temp: 20,
      description: 'pronóstico no disponible',
      icon: '02d',
      humidity: 60,
      windSpeed: 8,
      city: 'Mar del Plata'
    }
  }

  const getWeatherIconUrl = (iconCode) => {
    return `https://openweathermap.org/img/wn/${iconCode}@2x.png`
  }

  return {
    getCurrentWeather,
    getWeatherForDate,
    getWeatherIconUrl,
    loading: computed(() => loading.value),
    error: computed(() => error.value)
  }
}
