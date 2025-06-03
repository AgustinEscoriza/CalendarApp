const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { TestUser, TestSetting } = require('../setup');

// Crear usuario de prueba
const createTestUser = async (userData = {}) => {
  const defaultData = {
    email: 'test@example.com',
    password: 'password123',
    name: 'Test User'
  };

  const data = { ...defaultData, ...userData };
  
  // Hash password si no viene hasheada
  if (data.password && !data.password.startsWith('$2b$')) {
    data.password = await bcrypt.hash(data.password, 10);
  }

  const user = await TestUser.create(data);
  return user;
};

// Crear token válido para testing
const createValidToken = (userId, secret = process.env.JWT_SECRET, expiresIn = '15m') => {
  return jwt.sign(
    { 
      id: userId,
      email: 'test@example.com',
      name: 'Test User'
    }, 
    secret, 
    { expiresIn }
  );
};

// Crear token expirado
const createExpiredToken = (userId) => {
  return jwt.sign(
    { 
      id: userId,
      email: 'test@example.com',
      name: 'Test User'
    }, 
    process.env.JWT_SECRET, 
    { expiresIn: '-1h' } // Token expirado
  );
};

// Mock de request con i18n - ARREGLAR: no inicializar user como null
const mockRequest = (body = {}, headers = {}, user) => {
  const req = {
    body,
    header: (name) => headers[name],
    headers,
    t: (key) => key // Mock simple de i18n
  };
  
  // Solo agregar user si se pasa explícitamente
  if (user !== undefined) {
    req.user = user;
  }
  
  return req;
};

// Mock de response
const mockResponse = () => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis()
  };
  return res;
};

module.exports = {
  createTestUser,
  createValidToken,
  createExpiredToken,
  mockRequest,
  mockResponse
}; 