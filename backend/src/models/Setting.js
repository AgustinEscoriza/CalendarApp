const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Setting = sequelize.define('Setting', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  language: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'es',
    validate: {
      isIn: [['es', 'en']]
    }
  },
  timezone: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'America/Argentina/Buenos_Aires'
  },
  location: {
    type: DataTypes.STRING,
    allowNull: true
  },
  timeFormat: {
    type: DataTypes.ENUM('12h', '24h'),
    allowNull: false,
    defaultValue: '24h'
  },
  darkMode: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
});

module.exports = Setting;