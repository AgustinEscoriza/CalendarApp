const { Sequelize } = require('sequelize');
const dotenv = require('dotenv');

dotenv.config();

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: 'postgres',
    logging: false,
    // Opciones adicionales para sincronización
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Función para inicializar la base de datos
const initDatabase = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida correctamente.');
    
    // Sincronizar todos los modelos
    // force: true - Eliminará las tablas existentes y las creará de nuevo
    // alter: true - Actualizará las tablas existentes
    await sequelize.sync({ alter: true });
    console.log('Base de datos sincronizada correctamente.');
  } catch (error) {
    console.error('Error al inicializar la base de datos:', error);
  }
};

module.exports = { sequelize, initDatabase };
