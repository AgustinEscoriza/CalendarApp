const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { initDatabase } = require('./config/db');

// Cargar variables de entorno
dotenv.config();

// Importar rutas
const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const settingRoutes = require('./routes/settingRoutes');

// Inicializar Express
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/settings', settingRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('API de Calendario funcionando correctamente');
});

// Puerto
const PORT = process.env.PORT || 3000;

// Iniciar servidor y base de datos
const startServer = async () => {
  try {
    // Inicializar la base de datos
    await initDatabase();
    
    // Iniciar el servidor
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en el puerto ${PORT}`);
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
  }
};

startServer();
