import api from './api';

export async function login(email, password) {
  const res = await api.post('/auth/login', { email, password });
  localStorage.setItem('accessToken', res.data.accessToken);
  localStorage.setItem('refreshToken', res.data.refreshToken);
  return res.data;
}

export async function signup(name, email, password) {
  const res = await api.post('/auth/register', { name, email, password });
  return res.data;
} 