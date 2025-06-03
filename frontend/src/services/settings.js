import api from './api';

export function getSettings() {
  return api.get('/settings');
}

export function getSetting(id) {
  return api.get(`/settings/${id}`);
}

export function createSetting(settingData) {
  return api.post('/settings', settingData);
}

export function updateSetting(id, settingData) {
  return api.put(`/settings/${id}`, settingData);
}

export function deleteSetting(id) {
  return api.delete(`/settings/${id}`);
} 