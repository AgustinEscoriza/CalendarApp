import { defineStore } from 'pinia';
import { login as loginService, signup as signupService } from '../services/auth';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null,
    accessToken: localStorage.getItem('accessToken') || '',
    refreshToken: localStorage.getItem('refreshToken') || '',
    loading: false,
    error: null,
  }),
  actions: {
    async login(email, password) {
      this.loading = true;
      this.error = null;
      try {
        const data = await loginService(email, password);
        this.accessToken = data.accessToken;
        this.refreshToken = data.refreshToken;
        this.user = data.user || null;
        localStorage.setItem('accessToken', data.accessToken);
        localStorage.setItem('refreshToken', data.refreshToken);
        this.error = null;
        return data;
      } catch (err) {
        if (err.response && err.response.data) {
          this.error = err.response.data;
        } else {
          this.error = { message: 'Error desconocido durante el login.' };
        }
        throw err;
      } finally {
        this.loading = false;
      }
    },
    async signup(name, email, password) {
      this.loading = true;
      this.error = null;
      try {
        const data = await signupService(name, email, password);
        this.error = null;
        return data;
      } catch (err) {
        if (err.response && err.response.data) {
          this.error = err.response.data;
        } else {
          this.error = { message: 'Error desconocido durante el registro.' };
        }
        throw err;
      } finally {
        this.loading = false;
      }
    },
    logout() {
      this.user = null;
      this.accessToken = '';
      this.refreshToken = '';
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
    },
  },
}); 