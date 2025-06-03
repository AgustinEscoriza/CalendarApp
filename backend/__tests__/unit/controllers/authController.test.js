const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const authController = require('../../../src/controllers/authController');
const { TestUser, TestSetting } = require('../../setup');
const { createTestUser, mockRequest, mockResponse } = require('../../helpers/testUtils');

// Mock de los modelos para usar versiones de testing
jest.mock('../../../src/models/User', () => require('../../setup').TestUser);
jest.mock('../../../src/models/Setting', () => require('../../setup').TestSetting);

describe('AuthController', () => {
  describe('register', () => {
    it('should register a new user successfully', async () => {
      const req = mockRequest({
        email: 'newuser@example.com',
        password: 'password123',
        name: 'New User'
      });
      const res = mockResponse();

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          user: expect.objectContaining({
            email: 'newuser@example.com',
            name: 'New User'
          }),
          accessToken: expect.any(String),
          refreshToken: expect.any(String)
        })
      );

      // Verificar que se creó el usuario en la DB
      const user = await TestUser.findOne({ where: { email: 'newuser@example.com' } });
      expect(user).toBeTruthy();
      expect(user.name).toBe('New User');

      // Verificar que se creó la configuración por defecto
      const setting = await TestSetting.findOne({ where: { userId: user.id } });
      expect(setting).toBeTruthy();
      expect(setting.language).toBe('es');
    });

    it('should not register user with existing email', async () => {
      // Crear usuario existente
      await createTestUser({ email: 'existing@example.com' });

      const req = mockRequest({
        email: 'existing@example.com',
        password: 'password123',
        name: 'Duplicate User'
      });
      const res = mockResponse();

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        message: 'error.user_exists',
        field: 'email'
      });
    });

    it('should hash password correctly', async () => {
      const req = mockRequest({
        email: 'hashtest@example.com',
        password: 'plainpassword',
        name: 'Hash Test User'
      });
      const res = mockResponse();

      await authController.register(req, res);

      const user = await TestUser.findOne({ where: { email: 'hashtest@example.com' } });
      expect(user.password).not.toBe('plainpassword');
      expect(user.password.startsWith('$2b$')).toBe(true);

      // Verificar que el hash funciona
      const isValid = await bcrypt.compare('plainpassword', user.password);
      expect(isValid).toBe(true);
    });

    it('should handle server errors gracefully', async () => {
      // Mock para simular error en la DB - ARREGLAR: hacer mock local
      const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
      const createSpy = jest.spyOn(TestUser, 'create').mockRejectedValueOnce(new Error('Database error'));

      const req = mockRequest({
        email: 'error@example.com',
        password: 'password123',
        name: 'Error User'
      });
      const res = mockResponse();

      await authController.register(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        message: 'error.registering_user',
        error: 'Database error' // NODE_ENV está en development
      });

      // Limpiar mocks
      createSpy.mockRestore();
      consoleSpy.mockRestore();
    });
  });

  describe('login', () => {
    let testUser;

    beforeEach(async () => {
      testUser = await createTestUser({
        email: 'login@example.com',
        password: 'password123',
        name: 'Login User'
      });
    });

    it('should login with valid credentials', async () => {
      const req = mockRequest({
        email: 'login@example.com',
        password: 'password123'
      });
      const res = mockResponse();

      await authController.login(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          user: expect.objectContaining({
            id: testUser.id,
            email: 'login@example.com',
            name: 'Login User'
          }),
          accessToken: expect.any(String),
          refreshToken: expect.any(String)
        })
      );
    });

    it('should reject login with invalid email', async () => {
      const req = mockRequest({
        email: 'nonexistent@example.com',
        password: 'password123'
      });
      const res = mockResponse();

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'error.invalid_credentials',
        field: 'email'
      });
    });

    it('should reject login with invalid password', async () => {
      const req = mockRequest({
        email: 'login@example.com',
        password: 'wrongpassword'
      });
      const res = mockResponse();

      await authController.login(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'error.invalid_credentials',
        field: 'password'
      });
    });

    it('should return valid JWT tokens', async () => {
      const req = mockRequest({
        email: 'login@example.com',
        password: 'password123'
      });
      const res = mockResponse();

      await authController.login(req, res);

      const response = res.json.mock.calls[0][0];
      
      // Verificar access token
      const accessPayload = jwt.verify(response.accessToken, process.env.JWT_SECRET);
      expect(accessPayload.id).toBe(testUser.id);
      expect(accessPayload.email).toBe('login@example.com');

      // Verificar refresh token
      const refreshPayload = jwt.verify(response.refreshToken, process.env.JWT_REFRESH_SECRET);
      expect(refreshPayload.id).toBe(testUser.id);
    });
  });

  describe('refreshToken', () => {
    let testUser;

    beforeEach(async () => {
      testUser = await createTestUser();
    });

    it('should refresh tokens with valid refresh token', async () => {
      const validRefreshToken = jwt.sign(
        { id: testUser.id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '7d' }
      );

      const req = mockRequest({
        refreshToken: validRefreshToken
      });
      const res = mockResponse();

      await authController.refreshToken(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({
          accessToken: expect.any(String),
          refreshToken: expect.any(String)
        })
      );
    });

    it('should reject refresh with missing token', async () => {
      const req = mockRequest({});
      const res = mockResponse();

      await authController.refreshToken(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'error.refresh_token_required'
      });
    });

    it('should reject refresh with invalid token', async () => {
      const req = mockRequest({
        refreshToken: 'invalid-token'
      });
      const res = mockResponse();

      await authController.refreshToken(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'error.invalid_refresh_token'
      });
    });

    it('should reject refresh with expired token', async () => {
      const expiredRefreshToken = jwt.sign(
        { id: testUser.id },
        process.env.JWT_REFRESH_SECRET,
        { expiresIn: '-1h' }
      );

      const req = mockRequest({
        refreshToken: expiredRefreshToken
      });
      const res = mockResponse();

      await authController.refreshToken(req, res);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({
        message: 'error.invalid_refresh_token'
      });
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      const req = mockRequest();
      const res = mockResponse();

      await authController.logout(req, res);

      expect(res.json).toHaveBeenCalledWith({
        message: 'success.logged_out'
      });
    });
  });
}); 