const i18next = require('i18next');
const i18nextMiddleware = require('i18next-http-middleware');
const Setting = require('../models/Setting');

// Configuración de i18next
i18next
  .use(i18nextMiddleware.LanguageDetector)
  .init({
    fallbackLng: 'es',
    preload: ['es', 'en'],
    ns: ['common'],
    defaultNS: 'common',
    resources: {
      es: {
        common: {
          // Mensajes de configuración
          'error.creating_setting': 'Error al crear la configuración',
          'error.fetching_settings': 'Error al obtener las configuraciones',
          'error.fetching_setting': 'Error al obtener la configuración',
          'error.updating_setting': 'Error al actualizar la configuración',
          'error.deleting_setting': 'Error al eliminar la configuración',
          'error.setting_not_found': 'Configuración no encontrada',
          'success.setting_deleted': 'Configuración eliminada exitosamente',

          // Mensajes de eventos
          'error.creating_event': 'Error al crear el evento',
          'error.fetching_events': 'Error al obtener los eventos',
          'error.fetching_event': 'Error al obtener el evento',
          'error.updating_event': 'Error al actualizar el evento',
          'error.deleting_event': 'Error al eliminar el evento',
          'error.event_not_found': 'Evento no encontrado',
          'success.event_deleted': 'Evento eliminado exitosamente',
          'error.invalid_date_format': 'Formato de fecha inválido',
          'error.end_date_before_start': 'La fecha de fin debe ser posterior a la fecha de inicio',

          // Mensajes de autenticación
          'error.user_exists': 'El usuario ya existe',
          'error.registering_user': 'Error al registrar el usuario',
          'error.invalid_credentials': 'Credenciales inválidas',
          'error.logging_in': 'Error al iniciar sesión',
          'error.refresh_token_required': 'Se requiere el token de actualización',
          'error.invalid_refresh_token': 'Token de actualización inválido',
          'error.refreshing_token': 'Error al actualizar el token',
          'success.logged_out': 'Sesión cerrada exitosamente'
        }
      },
      en: {
        common: {
          // Setting messages
          'error.creating_setting': 'Error creating setting',
          'error.fetching_settings': 'Error fetching settings',
          'error.fetching_setting': 'Error fetching setting',
          'error.updating_setting': 'Error updating setting',
          'error.deleting_setting': 'Error deleting setting',
          'error.setting_not_found': 'Setting not found',
          'success.setting_deleted': 'Setting deleted successfully',

          // Event messages
          'error.creating_event': 'Error creating event',
          'error.fetching_events': 'Error fetching events',
          'error.fetching_event': 'Error fetching event',
          'error.updating_event': 'Error updating event',
          'error.deleting_event': 'Error deleting event',
          'error.event_not_found': 'Event not found',
          'success.event_deleted': 'Event deleted successfully',
          'error.invalid_date_format': 'Invalid date format',
          'error.end_date_before_start': 'End date must be after start date',

          // Authentication messages
          'error.user_exists': 'User already exists',
          'error.registering_user': 'Error registering user',
          'error.invalid_credentials': 'Invalid credentials',
          'error.logging_in': 'Error logging in',
          'error.refresh_token_required': 'Refresh token is required',
          'error.invalid_refresh_token': 'Invalid refresh token',
          'error.refreshing_token': 'Error refreshing token',
          'success.logged_out': 'Logged out successfully'
        }
      }
    }
  });

// Middleware personalizado para obtener el idioma del usuario
const getUserLanguage = async (req, res, next) => {
  try {
    if (req.user) {
      const setting = await Setting.findOne({ where: { userId: req.user.id } });
      if (setting) {
        req.language = setting.language;
      }
    } else {
      // Si no hay usuario autenticado, usar español por defecto
      req.language = 'es';
    }
    next();
  } catch (error) {
    // En caso de error, usar español por defecto
    req.language = 'es';
    next();
  }
};

module.exports = {
  i18next,
  i18nextMiddleware,
  getUserLanguage
}; 