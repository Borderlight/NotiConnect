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
        console.log('Content-Type:', req.headers['content-type']);
        
        // Log específico de adjuntos
        if (req.body.adjuntos) {
            console.log('\n📎 ADJUNTOS RECIBIDOS:');
            console.log('- Tipo:', typeof req.body.adjuntos);
            console.log('- Es array:', Array.isArray(req.body.adjuntos));
            console.log('- Longitud:', req.body.adjuntos.length);
            
            if (Array.isArray(req.body.adjuntos)) {
                req.body.adjuntos.forEach((adj, index) => {
                    console.log(`\n  📄 Adjunto ${index}:`);
                    console.log(`     - Tipo: ${typeof adj}`);
                    console.log(`     - Es objeto: ${typeof adj === 'object'}`);
                    
                    if (typeof adj === 'object') {
                        console.log(`     - Keys: [${Object.keys(adj)}]`);
                        console.log(`     - name: "${adj.name}"`);
                        console.log(`     - type: "${adj.type}"`);
                        console.log(`     - size: ${adj.size}`);
                        console.log(`     - data length: ${adj.data ? adj.data.length : 'sin data'}`);
                        console.log(`     - data starts with: ${adj.data ? adj.data.substring(0, 30) + '...' : 'no data'}`);
                    } else if (typeof adj === 'string') {
                        console.log(`     - String length: ${adj.length}`);
                        console.log(`     - Starts with: ${adj.substring(0, 50)}...`);
                        console.log(`     - Es dataURL: ${adj.startsWith('data:')}`);
                    }
                });
            }
        } else {
            console.log('❌ No se recibieron adjuntos');
        }
        
        // NUEVA VERIFICACIÓN: Inspeccionar el body completo para buscar dataURLs
        console.log('\n🔍 REVISANDO BODY COMPLETO PARA DETECTAR DATA URLS:');
        const bodyString = JSON.stringify(req.body, null, 2);
        const dataUrlMatches = bodyString.match(/data:[^;]+;base64,[A-Za-z0-9+/=]+/g);
        if (dataUrlMatches) {
            console.log(`🚨 ENCONTRADAS ${dataUrlMatches.length} DATAURL(S) EN EL BODY:`);
            dataUrlMatches.forEach((match, index) => {
                console.log(`   DataURL ${index}: ${match.substring(0, 50)}...`);
            });
        } else {
            console.log('✅ NO se encontraron dataURLs en el body');
        }
        
        console.log('\n💾 Guardando en MongoDB...');
        console.log('🔍 Datos a guardar:', JSON.stringify(req.body, null, 2));
        
        const nuevoEvento = new Evento(req.body);
        console.log('🔍 Objeto Evento creado:', nuevoEvento);
        
        const eventoGuardado = await nuevoEvento.save();
        
        console.log('✅ Evento guardado exitosamente:', eventoGuardado._id);
        res.status(201).json(eventoGuardado);
    } catch (error) {
        console.error('❌ Error al crear evento:', error.message);
        console.error('❌ Stack:', error.stack);
        
        // Log específico para errores de validación
        if (error.name === 'ValidationError') {
            console.error('❌ Error de validación:', error.errors);
            Object.keys(error.errors).forEach(key => {
                console.error(`   - ${key}: ${error.errors[key].message}`);
            });
        }
        
        // Log específico para errores de cast
        if (error.name === 'CastError') {
            console.error('❌ Error de cast:', {
                path: error.path,
                value: error.value,
                kind: error.kind,
                valueType: typeof error.value
            });
        }
        
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
