import api from './api';

// Obtener todas las configuraciones del usuario
export const getSettings = async () => {
  try {
    const response = await api.get('/settings');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Crear una nueva configuración
export const createSetting = async (settingData) => {
  try {
    const response = await api.post('/settings', settingData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Actualizar una configuración existente
export const updateSetting = async (id, settingData) => {
  try {
    const response = await api.put(`/settings/${id}`, settingData);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Obtener configuración por ID
export const getSettingById = async (id) => {
  try {
    const response = await api.get(`/settings/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Eliminar una configuración
export const deleteSetting = async (id) => {
  try {
    const response = await api.delete(`/settings/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
}; 