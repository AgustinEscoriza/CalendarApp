import api from './api';

export function getEvents() {
  return api.get('/events');
}

export function getEvent(id) {
  return api.get(`/events/${id}`);
}

export function createEvent(event) {
  return api.post('/events', event);
}

export function updateEvent(id, event) {
  return api.put(`/events/${id}`, event);
}

export function deleteEvent(id) {
  return api.delete(`/events/${id}`);
}