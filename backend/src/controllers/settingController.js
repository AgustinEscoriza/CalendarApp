const Setting = require('../models/Setting');

// Crear configuración
const createSetting = async (req, res) => {
  try {
    const { language, timezone, location, timeFormat, darkMode } = req.body;
    const userId = req.user.id;

    const setting = await Setting.create({
      language,
      timezone,
      location,
      timeFormat,
      darkMode,
      userId,
    });

    res.status(201).json(setting);
  } catch (error) {
    res.status(500).json({ message: 'Error creating setting' });
  }
};

// Obtener todas las configuraciones
const getAllSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const settings = await Setting.findAll({ where: { userId } });
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching settings' });
  }
};

// Obtener una configuración específica
const getSettingById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const setting = await Setting.findOne({ where: { id, userId } });
    if (!setting) {
      return res.status(404).json({ message: 'Setting not found' });
    }

    res.json(setting);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching setting' });
  }
};

// Actualizar una configuración
const updateSetting = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { language, timezone, location, timeFormat, darkMode } = req.body;

    const setting = await Setting.findOne({ where: { id, userId } });
    if (!setting) {
      return res.status(404).json({ message: 'Setting not found' });
    }

    await setting.update({
      language,
      timezone,
      location,
      timeFormat,
      darkMode,
    });

    res.json(setting);
  } catch (error) {
    res.status(500).json({ message: 'Error updating setting' });
  }
};

// Eliminar una configuración
const deleteSetting = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const setting = await Setting.findOne({ where: { id, userId } });
    if (!setting) {
      return res.status(404).json({ message: 'Setting not found' });
    }

    await setting.destroy();
    res.json({ message: 'Setting deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting setting' });
  }
};

module.exports = {
  createSetting,
  getAllSettings,
  getSettingById,
  updateSetting,
  deleteSetting,
};
