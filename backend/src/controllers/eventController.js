const Event = require('../models/Event');

// Crear evento
const createEvent = async (req, res) => {
  try {
    const { title, description, startDate, endDate } = req.body;
    const userId = req.user.id;

    // Validar que las fechas sean válidas
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: req.t('error.invalid_date_format') });
    }

    // Validar que la fecha de inicio sea anterior a la fecha de fin
    if (start >= end) {
      return res.status(400).json({ message: req.t('error.end_date_before_start') });
    }

    const event = await Event.create({
      title,
      description,
      startDate: start,
      endDate: end,
      userId,
    });

    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: req.t('error.creating_event') });
  }
};

// Obtener todos los eventos
const getAllEvents = async (req, res) => {
  try {
    const userId = req.user.id;
    const events = await Event.findAll({ where: { userId } });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: req.t('error.fetching_events') });
  }
};

// Obtener un evento específico
const getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const event = await Event.findOne({ where: { id, userId } });
    if (!event) {
      return res.status(404).json({ message: req.t('error.event_not_found') });
    }

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: req.t('error.fetching_event') });
  }
};

// Actualizar un evento
const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { title, description, startDate, endDate } = req.body;

    // Validar que las fechas sean válidas
    const start = new Date(startDate);
    const end = new Date(endDate);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: req.t('error.invalid_date_format') });
    }

    // Validar que la fecha de inicio sea anterior a la fecha de fin
    if (start >= end) {
      return res.status(400).json({ message: req.t('error.end_date_before_start') });
    }

    const event = await Event.findOne({ where: { id, userId } });
    if (!event) {
      return res.status(404).json({ message: req.t('error.event_not_found') });
    }

    await event.update({
      title,
      description,
      startDate: start,
      endDate: end,
    });

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: req.t('error.updating_event') });
  }
};

// Eliminar un evento
const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const event = await Event.findOne({ where: { id, userId } });
    if (!event) {
      return res.status(404).json({ message: req.t('error.event_not_found') });
    }

    await event.destroy();
    res.json({ message: req.t('success.event_deleted') });
  } catch (error) {
    res.status(500).json({ message: req.t('error.deleting_event') });
  }
};

module.exports = {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
};
