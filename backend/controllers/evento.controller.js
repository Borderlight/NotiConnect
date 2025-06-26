const Evento = require('../models/evento');

// Obtener todos los eventos con filtros
const getEventos = async (req, res) => {
    try {
        let query = {};
        const {
            tipoEvento,
            ponente,
            actividad,
            servicio,
            fecha,
            fechaInicio,
            fechaFin,
            horaInicio,
            horaFin,
            lugar
        } = req.query;

        // Construir filtros para MongoDB
        if (tipoEvento && tipoEvento !== '' && tipoEvento !== 'Todos') {
            query.tipoEvento = tipoEvento;
        }
        
        if (ponente && ponente !== '' && ponente !== 'Todos') {
            query['ponentes.nombre'] = { $regex: ponente, $options: 'i' };
        }
        
        if (actividad && actividad !== '' && actividad !== 'Todos') {
            query.actividad = actividad;
        }
        
        if (servicio && servicio !== '' && servicio !== 'Todos') {
            query['servicios.servicios'] = servicio;
        }

        // Filtros de fecha y ubicación
        if (fecha && fecha !== '' && fecha !== 'Todos') {
            const fechaObj = new Date(fecha);
            query['ubicaciones.fecha'] = {
                $gte: new Date(fechaObj.setHours(0, 0, 0, 0)),
                $lt: new Date(fechaObj.setHours(23, 59, 59, 999))
            };
        }

        if (fechaInicio && fechaInicio !== '') {
            if (!query['ubicaciones.fecha']) query['ubicaciones.fecha'] = {};
            query['ubicaciones.fecha'].$gte = new Date(fechaInicio);
        }

        if (fechaFin && fechaFin !== '') {
            if (!query['ubicaciones.fecha']) query['ubicaciones.fecha'] = {};
            query['ubicaciones.fecha'].$lte = new Date(fechaFin);
        }

        if (lugar && lugar !== '' && lugar !== 'Todos') {
            query['ubicaciones.lugar'] = { $regex: lugar, $options: 'i' };
        }

        if (horaInicio && horaInicio !== '') {
            query['ubicaciones.horaInicio'] = { $gte: horaInicio };
        }

        if (horaFin && horaFin !== '') {
            query['ubicaciones.horaFin'] = { $lte: horaFin };
        }

        const eventos = await Evento.find(query).sort({ createdAt: -1 });
        res.json(eventos);
    } catch (error) {
        console.error('Error al obtener eventos:', error);
        res.status(500).json({ message: 'Error al obtener eventos', error: error.message });
    }
};

// Obtener un evento por ID
const getEventoById = async (req, res) => {
    try {
        const evento = await Evento.findById(req.params.id);
        if (!evento) {
            return res.status(404).json({ message: 'Evento no encontrado' });
        }
        res.json(evento);
    } catch (error) {
        console.error('Error al obtener evento:', error);
        res.status(500).json({ message: 'Error al obtener evento', error: error.message });
    }
};

// Crear nuevo evento
const createEvento = async (req, res) => {
    try {
        console.log('=== DEBUGGING createEvento ===');
        console.log('req.body:', req.body);
        
        const nuevoEvento = new Evento(req.body);
        const eventoGuardado = await nuevoEvento.save();
        res.status(201).json(eventoGuardado);
    } catch (error) {
        console.error('Error al crear evento:', error);
        res.status(400).json({ message: 'Error al crear evento', error: error.message });
    }
};

// Actualizar evento
const updateEvento = async (req, res) => {
    try {
        const eventoActualizado = await Evento.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );
        
        if (!eventoActualizado) {
            return res.status(404).json({ message: 'Evento no encontrado' });
        }
        
        res.json(eventoActualizado);
    } catch (error) {
        console.error('Error al actualizar evento:', error);
        res.status(400).json({ message: 'Error al actualizar evento', error: error.message });
    }
};

// Eliminar evento
const deleteEvento = async (req, res) => {
    try {
        const eventoEliminado = await Evento.findByIdAndDelete(req.params.id);
        
        if (!eventoEliminado) {
            return res.status(404).json({ message: 'Evento no encontrado' });
        }
        
        res.json({ message: 'Evento eliminado exitosamente', evento: eventoEliminado });
    } catch (error) {
        console.error('Error al eliminar evento:', error);
        res.status(500).json({ message: 'Error al eliminar evento', error: error.message });
    }
};

// Obtener todos los ponentes únicos
const getPonentes = async (req, res) => {
    try {
        const ponentes = await Evento.distinct('ponentes.nombre');
        res.json(ponentes.filter(p => p && p.trim() !== ''));
    } catch (error) {
        console.error('Error al obtener ponentes:', error);
        res.status(500).json({ message: 'Error al obtener ponentes', error: error.message });
    }
};

// Obtener todos los tipos de evento únicos
const getTiposEvento = async (req, res) => {
    try {
        const tipos = await Evento.distinct('tipoEvento');
        res.json(tipos.filter(t => t && t.trim() !== ''));
    } catch (error) {
        console.error('Error al obtener tipos de evento:', error);
        res.status(500).json({ message: 'Error al obtener tipos de evento', error: error.message });
    }
};

// Obtener todas las actividades únicas
const getActividades = async (req, res) => {
    try {
        const actividades = await Evento.distinct('actividad');
        res.json(actividades.filter(a => a && a.trim() !== ''));
    } catch (error) {
        console.error('Error al obtener actividades:', error);
        res.status(500).json({ message: 'Error al obtener actividades', error: error.message });
    }
};

// Obtener todos los servicios únicos
const getServicios = async (req, res) => {
    try {
        const servicios = await Evento.distinct('servicios.servicios');
        res.json(servicios.filter(s => s && s.trim() !== ''));
    } catch (error) {
        console.error('Error al obtener servicios:', error);
        res.status(500).json({ message: 'Error al obtener servicios', error: error.message });
    }
};

// Obtener todos los lugares únicos
const getLugares = async (req, res) => {
    try {
        const lugares = await Evento.distinct('ubicaciones.lugar');
        res.json(lugares.filter(l => l && l.trim() !== ''));
    } catch (error) {
        console.error('Error al obtener lugares:', error);
        res.status(500).json({ message: 'Error al obtener lugares', error: error.message });
    }
};

module.exports = {
    getEventos,
    getEventoById,
    createEvento,
    updateEvento,
    deleteEvento,
    getPonentes,
    getTiposEvento,
    getActividades,
    getServicios,
    getLugares
};
