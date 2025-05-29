const Event = require('../models/Event');

// Crear evento
const createEvent = async (req, res) => {
  try {
    const { title, description, startDate, endDate } = req.body;
    const userId = req.user.id;

    const event = await Event.create({
      title,
      description,
      startDate,
      endDate,
      userId,
    });

    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: 'Error creating event' });
  }
};

// Obtener todos los eventos
const getAllEvents = async (req, res) => {
  try {
    const userId = req.user.id;
    const events = await Event.findAll({ where: { userId } });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching events' });
  }
};

// Obtener un evento específico
const getEventById = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const event = await Event.findOne({ where: { id, userId } });
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching event' });
  }
};

// Actualizar un evento
const updateEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const { title, description, startDate, endDate } = req.body;

    const event = await Event.findOne({ where: { id, userId } });
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    await event.update({
      title,
      description,
      startDate,
      endDate,
    });

    res.json(event);
  } catch (error) {
    res.status(500).json({ message: 'Error updating event' });
  }
};

// Eliminar un evento
const deleteEvent = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const event = await Event.findOne({ where: { id, userId } });
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    await event.destroy();
    res.json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting event' });
  }
};

module.exports = {
  createEvent,
  getAllEvents,
  getEventById,
  updateEvent,
  deleteEvent,
};
