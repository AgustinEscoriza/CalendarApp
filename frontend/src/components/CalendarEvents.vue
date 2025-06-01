<script setup>
import { ref, onMounted } from 'vue'
import { getEvents } from '../services/events'
import { useAuthStore } from '../store/auth'
import { useRouter } from 'vue-router'

const events = ref([])
const error = ref('')
const loading = ref(true)
const auth = useAuthStore()
const router = useRouter()

const handleLogout = () => {
  auth.logout()
  router.push('/login')
}

onMounted(async () => {
  loading.value = true
  error.value = ''
  try {
    const res = await getEvents()
    events.value = res.data
  } catch (err) {
    if (err.response && err.response.status === 401) {
      error.value = 'No autorizado. Intenta iniciar sesión nuevamente.'
    } else {
      error.value = 'Error al obtener eventos: ' + (err.message || err)
    }
  } finally {
    loading.value = false
  }
})
</script>

<template>
  <div>
    <button @click="handleLogout" style="float:right; margin: 1em 0 1em 1em; background: #d32f2f; color: #fff; border: none; border-radius: 4px; padding: 0.5em 1.2em; font-weight: bold; cursor: pointer;">
      Logout
    </button>
    <h1>Prueba de Fetch de Eventos</h1>
    <div v-if="loading">Cargando eventos...</div>
    <div v-else-if="error" style="color: red">{{ error }}</div>
    <ul v-else>
      <li v-for="event in events" :key="event.id">
        <strong>{{ event.title }}</strong> - {{ event.date }}<br />
        {{ event.description }}
      </li>
    </ul>
  </div>
</template>

<style scoped>
ul {
  margin-top: 1em;
}
li {
  margin-bottom: 1em;
}
</style>
