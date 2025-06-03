const { Sequelize } = require('sequelize');
const User = require('../src/models/User');
const Setting = require('../src/models/Setting');

// Base de datos en memoria para testing (arreglar deprecation warning)
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: ':memory:',
  logging: false
});

// Redefinir modelos para testing
const TestUser = sequelize.define('User', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  email: {
    type: Sequelize.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  },
  password: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
});

const TestSetting = sequelize.define('Setting', {
  id: {
    type: Sequelize.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: Sequelize.INTEGER,
    allowNull: false,
    references: {
      model: TestUser,
      key: 'id',
    },
  },
  language: {
    type: Sequelize.STRING,
    defaultValue: 'es',
  },
  timezone: {
    type: Sequelize.STRING,
    defaultValue: 'America/Argentina/Buenos_Aires',
  },
  location: {
    type: Sequelize.STRING,
    defaultValue: 'Mar del Plata/Buenos Aires',
  },
  timeFormat: {
    type: Sequelize.STRING,
    defaultValue: '24h',
  },
  darkMode: {
    type: Sequelize.BOOLEAN,
    defaultValue: false,
  },
});

// Asociaciones
TestUser.hasOne(TestSetting, { foreignKey: 'userId' });
TestSetting.belongsTo(TestUser, { foreignKey: 'userId' });

// Setup y teardown
beforeAll(async () => {
  await sequelize.sync({ force: true });
  
  // Mock de variables de entorno para testing
  process.env.JWT_SECRET = 'test-secret-key';
  process.env.JWT_REFRESH_SECRET = 'test-refresh-secret-key';
  process.env.NODE_ENV = 'development'; // Cambiar a development para los tests de error
});

afterAll(async () => {
  await sequelize.close();
});

beforeEach(async () => {
  // Limpiar datos entre tests
  await TestUser.destroy({ where: {}, truncate: true });
  await TestSetting.destroy({ where: {}, truncate: true });
});

// Exportar para usar en tests
module.exports = {
  sequelize,
  TestUser,
  TestSetting
}; 