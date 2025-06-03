<script setup>
import { ref, computed } from 'vue'
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

// Expresión regular para validación de email
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const nameError = computed(() => {
  if (!auth.error?.errors) return null
  return auth.error.errors.find(err => err.path === 'name')?.msg
})

const emailError = computed(() => {
  if (!auth.error?.errors) return null
  return auth.error.errors.find(err => err.path === 'email')?.msg
})

const passwordError = computed(() => {
  if (!auth.error?.errors) return null
  return auth.error.errors.find(err => err.path === 'password')?.msg
})

const onSubmit = async () => {
  if (!emailRegex.test(email.value)) {
    message.error(t('signup.invalidEmail'))
    return
  }

  try {
    await auth.signup(name.value, email.value, password.value)
    message.success(t('signup.success'))
    router.push('/login')
  } catch (err) {
    console.error('Error durante el registro:', err)
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
      <n-form @submit.prevent="onSubmit">
        <h2 style="text-align:center; margin-bottom: 1em;">{{ t('signup.title') }}</h2>
        <n-form-item
          :label="t('signup.name')"
          :validation-status="nameError ? 'error' : undefined"
          :feedback="nameError"
        >
          <n-input 
            v-model:value="name" 
            type="text" 
            :placeholder="t('signup.namePlaceholder')" 
            required 
          />
        </n-form-item>
        <n-form-item
          :label="t('signup.email')"
          :validation-status="emailError ? 'error' : undefined"
          :feedback="emailError"
        >
          <n-input 
            v-model:value="email" 
            type="email" 
            :placeholder="t('signup.emailPlaceholder')" 
            required 
          />
        </n-form-item>
        <n-form-item
          :label="t('signup.password')"
          :validation-status="passwordError ? 'error' : undefined"
          :feedback="passwordError"
        >
          <n-input 
            v-model:value="password" 
            type="password" 
            :placeholder="t('signup.passwordPlaceholder')" 
            required 
          />
        </n-form-item>
        <n-button type="primary" block :loading="auth.loading" attr-type="submit">
          {{ t('signup.button') }}
        </n-button>
        <!-- Error genérico -->
        <div v-if="auth.error && !auth.error.errors" style="color: #d32f2f; margin-top: 1em; text-align:center;">
          {{ auth.error.message }}
        </div>
        <!-- Enlace de login -->
        <div style="text-align: center; margin-top: 1em;">
          {{ t('signup.hasAccount') }} <router-link to="/login">{{ t('signup.loginLink') }}</router-link>
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