const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Setting = require('../models/Setting');

const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { 
      id: user.id,
      email: user.email,
      name: user.name
    }, 
    process.env.JWT_SECRET, 
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { id: user.id },
    process.env.JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

// Registro de usuario
const register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ 
        message: req.t('error.user_exists'),
        field: 'email'
      });
    }

    // Encriptar contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      email,
      password: hashedPassword,
      name,
    });

    // Crear configuración por defecto para el usuario
    await Setting.create({
      userId: user.id,
      language: 'es',
      timezone: 'America/Argentina/Buenos_Aires',
      location: 'Mar del Plata/Buenos Aires',
      timeFormat: '24h',
      darkMode: false
    });

    const { accessToken, refreshToken } = generateTokens(user);

    // Enviar respuesta sin la contraseña
    const userResponse = {
      id: user.id,
      email: user.email,
      name: user.name
    };

    res.status(201).json({ 
      user: userResponse, 
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error('Error in register:', error);
    res.status(500).json({ 
      message: req.t('error.registering_user'),
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Login de usuario
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ 
        message: req.t('error.invalid_credentials'),
        field: 'email'
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        message: req.t('error.invalid_credentials'),
        field: 'password'
      });
    }

    const { accessToken, refreshToken } = generateTokens(user);

    // Enviar respuesta sin la contraseña
    const userResponse = {
      id: user.id,
      email: user.email,
      name: user.name
    };

    res.json({ 
      user: userResponse, 
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error('Error in login:', error);
    res.status(500).json({ 
      message: req.t('error.logging_in'),
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Refresh token
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({ message: req.t('error.refresh_token_required') });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    
    const user = await User.findByPk(decoded.id);
    if (!user) {
      return res.status(401).json({ message: req.t('error.invalid_refresh_token') });
    }

    const tokens = generateTokens(user);

    res.json(tokens);
  } catch (error) {
    console.error('Error in refresh token:', error);
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: req.t('error.invalid_refresh_token') });
    }
    res.status(500).json({ 
      message: req.t('error.refreshing_token'),
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Logout de usuario
const logout = async (req, res) => {
  //Frontend debe eliminar el token
  //Tal Vez blacklistear el token en un futuro, limpiar cookies
  res.json({ message: req.t('success.logged_out') });
};

module.exports = {
  register,
  login,
  logout,
  refreshToken
};
