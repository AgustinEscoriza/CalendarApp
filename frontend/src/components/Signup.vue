<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../store/auth'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { NForm, NFormItem, NInput, NButton, NCard, NSelect, useMessage } from 'naive-ui'

const name = ref('')
const email = ref('')
const password = ref('')
const auth = useAuthStore()
const { t, locale } = useI18n()
const router = useRouter()
const message = useMessage()

const onSubmit = async () => {
  try {
    await auth.signup(name.value, email.value, password.value)
    // Dependiendo del backend: si el registro loguea automáticamente, redirigir a /. 
    // Si requiere login manual, redirigir a /login y mostrar mensaje de éxito.
    message.success(t('signup.success') || 'Registro exitoso. ¡Inicia sesión para continuar!')
    router.push('/login') // Asumo que se necesita login manual después del registro
  } catch (err) {
    // El manejo de errores ya está en el store y se mostrará en los NFormItem
    console.error('Error during signup:', err);
    if (!auth.error || !auth.error.message) {
        // Si no hay un error específico del backend, mostrar un mensaje genérico
        message.error(t('signup.error') || 'Error en el registro.');
    }
  }
}

const langOptions = [
  { label: 'Español', value: 'es' },
  { label: 'English', value: 'en' }
]
</script>

<template>
  <div class="login-bg">
    <n-card style="width: 350px; padding: 2em;">
      <div style="display: flex; justify-content: flex-end; margin-bottom: 1em;">
        <n-select v-model:value="locale" :options="langOptions" size="small" style="width: 120px;" />
      </div>
      <n-form @submit.prevent="onSubmit">
        <h2 style="text-align:center; margin-bottom: 1em;">{{ t('signup.title') }}</h2>
         <n-form-item
          :label="t('signup.name')"
          :validation-status="auth.error && auth.error.field === 'name' ? 'error' : undefined"
          :feedback="auth.error && auth.error.field === 'name' ? auth.error.message : undefined"
        >
          <n-input v-model:value="name" type="text" placeholder="Nombre" required />
        </n-form-item>
        <n-form-item
          :label="t('signup.email')"
          :validation-status="auth.error && auth.error.field === 'email' ? 'error' : undefined"
          :feedback="auth.error && auth.error.field === 'email' ? auth.error.message : undefined"
        >
          <n-input v-model:value="email" type="email" placeholder="Email" required />
        </n-form-item>
        <n-form-item
          :label="t('signup.password')"
          :validation-status="auth.error && auth.error.field === 'password' ? 'error' ? 'error' : undefined : undefined"
          :feedback="auth.error && auth.error.field === 'password' ? auth.error.message : undefined"
        >
          <n-input v-model:value="password" type="password" placeholder="******" required />
        </n-form-item>
        <n-button type="primary" block :loading="auth.loading" attr-type="submit">
          {{ t('signup.button') }}
        </n-button>
        <!-- Display generic error message if no specific field is provided -->
        <div v-if="auth.error && !auth.error.field" style="color: #d32f2f; margin-top: 1em; text-align:center;">
          {{ auth.error.message }}
        </div>
         <div style="text-align: center; margin-top: 1em;">
            ¿Ya tienes cuenta? <router-link to="/login">Inicia sesión</router-link>
        </div>
      </n-form>
    </n-card>
  </div>
</template>

<style scoped>
.login-bg {
  min-height: 100vh;
  background: #232323;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style> 