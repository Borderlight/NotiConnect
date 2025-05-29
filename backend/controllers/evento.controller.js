const Evento = require('../models/evento');

// Obtener todos los eventos
const getEventos = async (req, res) => {
    try {
        const eventos = await Evento.find();
        res.status(200).json(eventos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Obtener un evento por ID
const getEventoById = async (req, res) => {
    try {
        const evento = await Evento.findById(req.params.id);
        if (!evento) {
            return res.status(404).json({ message: 'Evento no encontrado' });
        }
        res.status(200).json(evento);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Crear nuevo evento
const createEvento = async (req, res) => {
    const evento = new Evento(req.body);
    try {
        const nuevoEvento = await evento.save();
        res.status(201).json(nuevoEvento);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Actualizar evento
const updateEvento = async (req, res) => {
    try {
        const evento = await Evento.findByIdAndUpdate(
            req.params.id, 
            req.body,
            { new: true }
        );
        if (!evento) {
            return res.status(404).json({ message: 'Evento no encontrado' });
        }
        res.status(200).json(evento);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Eliminar evento
const deleteEvento = async (req, res) => {
    try {
        const evento = await Evento.findByIdAndDelete(req.params.id);
        if (!evento) {
            return res.status(404).json({ message: 'Evento no encontrado' });
        }
        res.status(200).json({ message: 'Evento eliminado correctamente' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    getEventos,
    getEventoById,
    createEvento,
    updateEvento,
    deleteEvento
};
