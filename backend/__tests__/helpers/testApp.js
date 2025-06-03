const express = require('express');
const cors = require('cors');
const { i18next, i18nextMiddleware, getUserLanguage } = require('../../src/config/i18n');

// Importar rutas
const authRoutes = require('../../src/routes/authRoutes');
const eventRoutes = require('../../src/routes/eventRoutes');
const settingRoutes = require('../../src/routes/settingRoutes');

// Crear app para testing (sin inicializar DB real)
const createTestApp = () => {
  const app = express();

  // Middleware básico
  app.use(cors());
  app.use(express.json());
  
  // i18n simplificado para testing
  app.use((req, res, next) => {
    req.t = (key) => key; // Mock simple de i18n
    next();
  });

  // Rutas
  app.use('/api/auth', authRoutes);
  app.use('/api/events', eventRoutes);
  app.use('/api/settings', settingRoutes);

  // Ruta de prueba
  app.get('/', (req, res) => {
    res.send('Test API funcionando');
  });

  return app;
};

module.exports = createTestApp; 