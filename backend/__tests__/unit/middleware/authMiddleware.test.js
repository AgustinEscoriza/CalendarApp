const authMiddleware = require('../../../src/middleware/authMiddleware');
const { TestUser } = require('../../setup');
const { createTestUser, createValidToken, createExpiredToken, mockRequest, mockResponse } = require('../../helpers/testUtils');

// Mock del modelo User
jest.mock('../../../src/models/User', () => require('../../setup').TestUser);

describe('AuthMiddleware', () => {
  let testUser;

  beforeEach(async () => {
    testUser = await createTestUser();
  });

  it('should authenticate user with valid token', async () => {
    const token = createValidToken(testUser.id);
    const req = mockRequest({}, { Authorization: `Bearer ${token}` });
    const res = mockResponse();
    const next = jest.fn();

    await authMiddleware(req, res, next);

    expect(req.user).toEqual({
      id: testUser.id,
      email: testUser.email,
      name: testUser.name
    });
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it('should reject request with no authorization header', async () => {
    const req = mockRequest();
    const res = mockResponse();
    const next = jest.fn();

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'No token provided'
    });
    expect(next).not.toHaveBeenCalled();
    expect(req.user).toBeUndefined();
  });

  it('should reject request with invalid token format', async () => {
    const req = mockRequest({}, { Authorization: 'InvalidFormat' });
    const res = mockResponse();
    const next = jest.fn();

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Invalid token'
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should reject request with expired token', async () => {
    const expiredToken = createExpiredToken(testUser.id);
    const req = mockRequest({}, { Authorization: `Bearer ${expiredToken}` });
    const res = mockResponse();
    const next = jest.fn();

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Token expired',
      code: 'TOKEN_EXPIRED'
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should reject request with token for non-existent user', async () => {
    const token = createValidToken(99999); // ID que no existe
    const req = mockRequest({}, { Authorization: `Bearer ${token}` });
    const res = mockResponse();
    const next = jest.fn();

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'User not found'
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should reject request with malformed token', async () => {
    const req = mockRequest({}, { Authorization: 'Bearer invalid.jwt.token' });
    const res = mockResponse();
    const next = jest.fn();

    await authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Invalid token'
    });
    expect(next).not.toHaveBeenCalled();
  });

  it('should handle database errors as authentication failures', async () => {
    // Cuando hay un error de DB, el middleware actual lo trata como error de auth (401)
    // Esto es correcto desde una perspectiva de seguridad
    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    const findSpy = jest.spyOn(TestUser, 'findByPk').mockRejectedValueOnce(new Error('Database error'));

    const token = createValidToken(testUser.id);
    const req = mockRequest({}, { Authorization: `Bearer ${token}` });
    const res = mockResponse();
    const next = jest.fn();

    await authMiddleware(req, res, next);

    // El comportamiento actual es devolver 401 para errores de DB
    // Esto mantiene la seguridad al no revelar errores internos
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Invalid token'
    });
    expect(next).not.toHaveBeenCalled();

    // Limpiar mocks
    findSpy.mockRestore();
    consoleSpy.mockRestore();
  });
}); 