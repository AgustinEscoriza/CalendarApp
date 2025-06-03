<script setup>
import { ref } from 'vue'
import { useAuthStore } from '../store/auth'
import { useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { NForm, NFormItem, NInput, NButton, NCard, NSelect, useMessage } from 'naive-ui'

const email = ref('')
const password = ref('')
const auth = useAuthStore()
const { t, locale } = useI18n()
const router = useRouter()
const message = useMessage()

const onSubmit = async () => {
  await auth.login(email.value, password.value)
  if (auth.accessToken && !auth.error) {
    message.success(t('login.success'))
    router.push('/')
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
        <h2 style="text-align:center; margin-bottom: 1em;">{{ t('login.title') }}</h2>
        <n-form-item
          :label="t('login.email')"
          :validation-status="auth.error && auth.error.field === 'email' ? 'error' : undefined"
          :feedback="auth.error && auth.error.field === 'email' ? auth.error.message : undefined"
        >
          <n-input 
            v-model:value="email" 
            type="email" 
            :placeholder="t('login.emailPlaceholder')" 
            required 
          />
        </n-form-item>
        <n-form-item
          :label="t('login.password')"
          :validation-status="auth.error && auth.error.field === 'password' ? 'error' : undefined"
          :feedback="auth.error && auth.error.field === 'password' ? auth.error.message : undefined"
        >
          <n-input 
            v-model:value="password" 
            type="password" 
            :placeholder="t('login.passwordPlaceholder')" 
            required 
          />
        </n-form-item>
        <n-button type="primary" block :loading="auth.loading" attr-type="submit">
          {{ t('login.button') }}
        </n-button>
        <!-- Error genérico -->
        <div v-if="auth.error && !auth.error.field" style="color: #d32f2f; margin-top: 1em; text-align:center;">
          {{ auth.error.message || t('login.error') }}
        </div>
        <!-- Enlace de registro -->
        <div style="text-align: center; margin-top: 1em;">
          {{ t('login.noAccount') }} <router-link to="/signup">{{ t('login.signupLink') }}</router-link>
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