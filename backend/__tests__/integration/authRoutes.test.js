const request = require('supertest');
const createTestApp = require('../helpers/testApp');
const { TestUser, TestSetting } = require('../setup');
const bcrypt = require('bcrypt');

// Mock de los modelos para usar versiones de testing
jest.mock('../../src/models/User', () => require('../setup').TestUser);
jest.mock('../../src/models/Setting', () => require('../setup').TestSetting);

describe('Auth Routes Integration Tests', () => {
  let app;
  let consoleSpy;

  beforeAll(() => {
    app = createTestApp();
    // Mock console.error para evitar ruido en tests
    consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    // Restaurar console.error
    consoleSpy.mockRestore();
  });

  describe('POST /api/auth/register', () => {
    it('should register a new user with valid data', async () => {
      const userData = {
        email: 'newuser@test.com',
        password: 'ValidPass123!',
        name: 'Integration Test User'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      
      expect(response.body.user).toEqual(
        expect.objectContaining({
          email: userData.email,
          name: userData.name
        })
      );
      expect(response.body.user).not.toHaveProperty('password');

      // Verificar que el usuario fue creado en la DB
      const user = await TestUser.findOne({ where: { email: userData.email } });
      expect(user).toBeTruthy();

      // Verificar que se creó la configuración por defecto
      const setting = await TestSetting.findOne({ where: { userId: user.id } });
      expect(setting).toBeTruthy();
      expect(setting.language).toBe('es');
    });

    it('should reject registration with invalid email', async () => {
      const userData = {
        email: 'invalid-email',
        password: 'ValidPass123!',
        name: 'Test User'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            msg: 'Please enter a valid email'
          })
        ])
      );
    });

    it('should reject registration with weak password', async () => {
      const userData = {
        email: 'test@example.com',
        password: '123',
        name: 'Test User'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors.length).toBeGreaterThan(0);
    });

    it('should reject registration with short name', async () => {
      const userData = {
        email: 'test@example.com',
        password: 'ValidPass123!',
        name: 'A'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            msg: 'Name must be at least 2 characters long'
          })
        ])
      );
    });

    it('should reject registration with existing email', async () => {
      // Crear usuario existente
      const existingUserData = {
        email: 'existing@test.com',
        password: await bcrypt.hash('password123', 10),
        name: 'Existing User'
      };
      await TestUser.create(existingUserData);

      const userData = {
        email: 'existing@test.com',
        password: 'ValidPass123!',
        name: 'New User'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(400);

      expect(response.body).toEqual({
        message: 'error.user_exists',
        field: 'email'
      });
    });

    it('should reject registration with missing fields', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({})
        .expect(400);

      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors.length).toBeGreaterThan(0);
    });
  });

  describe('POST /api/auth/login', () => {
    let testUser;

    beforeEach(async () => {
      // Crear usuario para login tests
      testUser = await TestUser.create({
        email: 'login@test.com',
        password: await bcrypt.hash('ValidPass123!', 10),
        name: 'Login Test User'
      });
    });

    it('should login with valid credentials', async () => {
      const loginData = {
        email: 'login@test.com',
        password: 'ValidPass123!'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      
      expect(response.body.user).toEqual(
        expect.objectContaining({
          id: testUser.id,
          email: testUser.email,
          name: testUser.name
        })
      );
      expect(response.body.user).not.toHaveProperty('password');
    });

    it('should reject login with invalid email', async () => {
      const loginData = {
        email: 'nonexistent@test.com',
        password: 'ValidPass123!'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toEqual({
        message: 'error.invalid_credentials',
        field: 'email'
      });
    });

    it('should reject login with invalid password', async () => {
      const loginData = {
        email: 'login@test.com',
        password: 'WrongPassword123!'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body).toEqual({
        message: 'error.invalid_credentials',
        field: 'password'
      });
    });

    it('should reject login with invalid email format', async () => {
      const loginData = {
        email: 'invalid-email',
        password: 'ValidPass123!'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });

    it('should reject login with missing password', async () => {
      const loginData = {
        email: 'login@test.com'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(400);

      expect(response.body).toHaveProperty('errors');
      expect(response.body.errors).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            msg: 'Password is required'
          })
        ])
      );
    });
  });

  describe('POST /api/auth/refresh-token', () => {
    let testUser;
    let validRefreshToken;

    beforeEach(async () => {
      testUser = await TestUser.create({
        email: 'refresh@test.com',
        password: await bcrypt.hash('ValidPass123!', 10),
        name: 'Refresh Test User'
      });

      // Crear un refresh token válido
      const jwt = require('jsonwebtoken');
      validRefreshToken = jwt.sign(
        { id: testUser.id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
      );
    });

    it('should refresh token with valid refresh token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh-token')
        .send({ refreshToken: validRefreshToken })
        .expect(200);

      expect(response.body).toHaveProperty('accessToken');
      expect(response.body).toHaveProperty('refreshToken');
      expect(typeof response.body.accessToken).toBe('string');
      expect(typeof response.body.refreshToken).toBe('string');
    });

    it('should reject refresh with missing token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh-token')
        .send({})
        .expect(401);

      expect(response.body).toEqual({
        message: 'error.refresh_token_required'
      });
    });

    it('should reject refresh with invalid token', async () => {
      const response = await request(app)
        .post('/api/auth/refresh-token')
        .send({ refreshToken: 'invalid-token' })
        .expect(401);

      expect(response.body).toEqual({
        message: 'error.invalid_refresh_token'
      });
    });

    it('should reject refresh with expired token', async () => {
      const jwt = require('jsonwebtoken');
      const expiredToken = jwt.sign(
        { id: testUser.id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '-1h' }
      );

      const response = await request(app)
        .post('/api/auth/refresh-token')
        .send({ refreshToken: expiredToken })
        .expect(401);

      expect(response.body).toEqual({
        message: 'error.invalid_refresh_token'
      });
    });
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect(200);

      expect(response.body).toEqual({
        message: 'success.logged_out'
      });
    });
  });

  describe('Integration - Full authentication flow', () => {
    it('should complete full auth cycle: register -> login -> refresh -> logout', async () => {
      // 1. Register
      const registerData = {
        email: 'fullflow@test.com',
        password: 'ValidPass123!',
        name: 'Full Flow User'
      };

      const registerResponse = await request(app)
        .post('/api/auth/register')
        .send(registerData)
        .expect(201);

      expect(registerResponse.body).toHaveProperty('accessToken');
      const { refreshToken: initialRefreshToken } = registerResponse.body;

      // 2. Login
      const loginResponse = await request(app)
        .post('/api/auth/login')
        .send({
          email: registerData.email,
          password: registerData.password
        })
        .expect(200);

      expect(loginResponse.body).toHaveProperty('accessToken');
      const { refreshToken } = loginResponse.body;

      // 3. Refresh token
      const refreshResponse = await request(app)
        .post('/api/auth/refresh-token')
        .send({ refreshToken })
        .expect(200);

      expect(refreshResponse.body).toHaveProperty('accessToken');

      // 4. Logout
      const logoutResponse = await request(app)
        .post('/api/auth/logout')
        .expect(200);

      expect(logoutResponse.body.message).toBe('success.logged_out');
    });
  });
}); 