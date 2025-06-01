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
    res.status(500).json({ message: req.t('error.creating_setting') });
  }
};

// Obtener todas las configuraciones
const getAllSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const settings = await Setting.findAll({ where: { userId } });
    res.json(settings);
  } catch (error) {
    res.status(500).json({ message: req.t('error.fetching_settings') });
  }
};

// Obtener una configuración específica
const getSettingById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const setting = await Setting.findOne({ where: { id, userId } });
    if (!setting) {
      return res.status(404).json({ message: req.t('error.setting_not_found') });
    }

    res.json(setting);
  } catch (error) {
    res.status(500).json({ message: req.t('error.fetching_setting') });
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
      return res.status(404).json({ message: req.t('error.setting_not_found') });
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
    res.status(500).json({ message: req.t('error.updating_setting') });
  }
};

// Eliminar una configuración
const deleteSetting = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const setting = await Setting.findOne({ where: { id, userId } });
    if (!setting) {
      return res.status(404).json({ message: req.t('error.setting_not_found') });
    }

    await setting.destroy();
    res.json({ message: req.t('success.setting_deleted') });
  } catch (error) {
    res.status(500).json({ message: req.t('error.deleting_setting') });
  }
};

module.exports = {
  createSetting,
  getAllSettings,
  getSettingById,
  updateSetting,
  deleteSetting,
};
