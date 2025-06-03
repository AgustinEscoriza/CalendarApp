import { defineStore } from 'pinia';
import { getSettings, createSetting, updateSetting } from '../services/settings';

export const useSettingsStore = defineStore('settings', {
  state: () => ({
    settings: null,
    loading: false,
    error: null,
    // Configuraciones por defecto
    defaultSettings: {
      language: localStorage.getItem('user-language') || 'es', // Usar localStorage como fallback
      timezone: 'America/Argentina/Buenos_Aires',
      location: 'Buenos Aires, Argentina',
      timeFormat: '24h', // '12h' or '24h'
      darkMode: false
    }
  }),
  
  getters: {
    currentSettings: (state) => state.settings || state.defaultSettings,
    isDarkMode: (state) => state.settings?.darkMode || state.defaultSettings.darkMode,
    currentLanguage: (state) => {
      const language = state.settings?.language || state.defaultSettings.language;
      // Guardar en localStorage cada vez que se accede
      localStorage.setItem('user-language', language);
      return language;
    },
    currentTimezone: (state) => state.settings?.timezone || state.defaultSettings.timezone,
    currentTimeFormat: (state) => state.settings?.timeFormat || state.defaultSettings.timeFormat,
    currentLocation: (state) => state.settings?.location || state.defaultSettings.location
  },
  
  actions: {
    async fetchSettings() {
      this.loading = true;
      this.error = null;
      try {
        const response = await getSettings();
        const settings = response.data; // Extraer los datos de la respuesta
        if (settings && settings.length > 0) {
          this.settings = settings[0];
          // Guardar idioma en localStorage
          localStorage.setItem('user-language', this.settings.language);
        } else {
          await this.createUserSettings(this.defaultSettings);
        }
      } catch (err) {
        console.error('Error fetching settings:', err);
        this.error = err.response?.data?.message || 'Error al cargar configuraciones';
        this.settings = this.defaultSettings;
      } finally {
        this.loading = false;
      }
    },
    
    async createUserSettings(settingsData) {
      this.loading = true;
      this.error = null;
      try {
        const response = await createSetting(settingsData);
        const newSettings = response.data; // Extraer los datos
        this.settings = newSettings;
        // Guardar idioma en localStorage
        localStorage.setItem('user-language', newSettings.language);
        return newSettings;
      } catch (err) {
        console.error('Error creating settings:', err);
        this.error = err.response?.data?.message || 'Error al crear configuraciones';
        throw err;
      } finally {
        this.loading = false;
      }
    },
    
    async updateUserSettings(settingsData) {
      this.loading = true;
      this.error = null;
      try {
        if (this.settings?.id) {
          const response = await updateSetting(this.settings.id, settingsData);
          const updatedSettings = response.data; // Extraer los datos
          this.settings = updatedSettings;
        } else {
          await this.createUserSettings(settingsData);
        }
        // Guardar idioma en localStorage
        localStorage.setItem('user-language', this.settings.language);
      } catch (err) {
        console.error('Error updating settings:', err);
        this.error = err.response?.data?.message || 'Error al actualizar configuraciones';
        throw err;
      } finally {
        this.loading = false;
      }
    },
    
    // Método para cambiar tema sin hacer request al servidor inmediatamente
    toggleDarkMode() {
      const newDarkMode = !this.isDarkMode;
      if (this.settings) {
        this.settings.darkMode = newDarkMode;
      } else {
        this.settings = { ...this.defaultSettings, darkMode: newDarkMode };
      }
      // Actualizar en el servidor de forma asíncrona
      this.updateUserSettings(this.settings).catch(console.error);
    },

    // Nuevo método para cambiar idioma programáticamente
    async changeLanguage(newLanguage) {
      const currentSettings = this.currentSettings;
      const updatedSettings = { ...currentSettings, language: newLanguage };
      await this.updateUserSettings(updatedSettings);
    }
  }
}); 