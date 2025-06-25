const fs = require('fs');
const path = require('path');
const DATA_BASE_PATH = path.join(__dirname, '../dataBase.json');

// Obtener todos los eventos con filtros
const getEventos = async (req, res) => {
    fs.readFile(DATA_BASE_PATH, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ message: 'Error al leer dataBase.json' });
        }
        try {
            let eventos = JSON.parse(data);
            const {
                tipoEvento,
                ponente,
                actividad,
                servicio,
                fecha,
                fechaInicio, // <-- nuevo
                fechaFin,    // <-- nuevo
                horaInicio,
                horaFin,
                lugar
            } = req.query;

            // Solo aplicar filtro si el valor es real (no vacío, no "Todos")
            if (tipoEvento && tipoEvento !== '' && tipoEvento !== 'Todos') {
                eventos = eventos.filter(ev => ev.tipoEvento === tipoEvento);
            }
            if (ponente && ponente !== '' && ponente !== 'Todos') {
                eventos = eventos.filter(ev => ev.ponente && ev.ponente.toLowerCase().includes(ponente.toLowerCase()));
            }
            if (actividad && actividad !== '' && actividad !== 'Todos') {
                eventos = eventos.filter(ev => ev.actividad === actividad);
            }
            if (servicio && servicio !== '' && servicio !== 'Todos') {
                eventos = eventos.filter(ev => Array.isArray(ev.servicios) && ev.servicios.some(s => s.servicios === servicio));
            }

            // Filtros sobre ubicaciones
            if (
                (fecha && fecha !== '' && fecha !== 'Todos') ||
                (fechaInicio && fechaInicio !== '') ||
                (fechaFin && fechaFin !== '') ||
                (horaInicio && horaInicio !== '' && horaInicio !== 'Todos') ||
                (horaFin && horaFin !== '' && horaFin !== 'Todos') ||
                (lugar && lugar !== '' && lugar !== 'Todos')
            ) {
                eventos = eventos.filter(ev => {
                    if (!Array.isArray(ev.ubicaciones)) return false;
                    return ev.ubicaciones.some(ub => {
                        let cumple = true;
                        // Filtro por rango de fechas (tiene prioridad)
                        if ((fechaInicio && fechaInicio !== '') || (fechaFin && fechaFin !== '')) {
                            if (!ub.fecha) return false;
                            const fechaEvento = new Date(ub.fecha);
                            let cumpleRango = true;
                            if (fechaInicio && fechaInicio !== '') {
                                const inicio = new Date(fechaInicio);
                                inicio.setHours(0,0,0,0);
                                cumpleRango = cumpleRango && (fechaEvento >= inicio);
                            }
                            if (fechaFin && fechaFin !== '') {
                                const fin = new Date(fechaFin);
                                fin.setHours(23,59,59,999);
                                cumpleRango = cumpleRango && (fechaEvento <= fin);
                            }
                            cumple = cumple && cumpleRango;
                        } else if (fecha && fecha !== '' && fecha !== 'Todos') {
                            // Solo si no hay rango, aplicar filtro exacto
                            if (!ub.fecha) return false;
                            const fechaEvento = new Date(ub.fecha);
                            const fechaFiltro = new Date(fecha);
                            cumple = cumple && (fechaEvento.toDateString() === fechaFiltro.toDateString());
                        }
                        if (horaInicio && horaInicio !== '' && horaInicio !== 'Todos') {
                            if (!ub.horaInicio && !ub.hora) return false;
                            const horaEv = ub.horaInicio || ub.hora;
                            cumple = cumple && (horaEv && horaEv.substring(0,5) === horaInicio.substring(0,5));
                        }
                        if (horaFin && horaFin !== '' && horaFin !== 'Todos') {
                            if (!ub.horaFin) return false;
                            cumple = cumple && (ub.horaFin.substring(0,5) === horaFin.substring(0,5));
                        }
                        if (lugar && lugar !== '' && lugar !== 'Todos') {
                            cumple = cumple && (ub.lugar === lugar);
                        }
                        return cumple;
                    });
                });
            }
            res.status(200).json(eventos);
        } catch (e) {
            res.status(500).json({ message: 'Error al parsear dataBase.json' });
        }
    });
};

// Obtener un evento por ID
const getEventoById = async (req, res) => {
    fs.readFile(DATA_BASE_PATH, 'utf8', (err, data) => {
        if (err) {
            return res.status(500).json({ message: 'Error al leer dataBase.json' });
        }
        try {
            const eventos = JSON.parse(data);
            const evento = eventos.find(ev => ev._id == req.params.id || (ev._id && ev._id.$oid === req.params.id));
            if (!evento) {
                return res.status(404).json({ message: 'Evento no encontrado' });
            }
            res.status(200).json(evento);
        } catch (e) {
            res.status(500).json({ message: 'Error al parsear dataBase.json' });
        }
    });
};

// Crear nuevo evento
const createEvento = async (req, res) => {
    console.log('=== DEBUGGING createEvento ===');
    console.log('req.body:', req.body);
    console.log('req.files:', req.files);
    
    fs.readFile(DATA_BASE_PATH, 'utf8', (err, data) => {
        let eventos = [];
        if (!err && data) {
            try {
                eventos = JSON.parse(data);
            } catch (e) { eventos = []; }
        }

        // Generar un _id único
        const _id = Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
        
        // Crear el nuevo evento con campos obligatorios inicializados
        const nuevoEvento = {
            _id,
            titulo: req.body.titulo || '',
            ponente: req.body.ponente || '',
            empresaOrganizadora: req.body.empresaOrganizadora || '',
            tipoEvento: req.body.tipoEvento || '',
            descripcion: req.body.descripcion || '',
            servicios: [],
            enlaces: [],
            adjuntos: [],
            imagen: '',
            actividad_relacionada: req.body.actividad_relacionada || '',
            ubicaciones: []
        };
        
        console.log('nuevoEvento inicial:', nuevoEvento);

        // Parsear campos que vienen como string pero son arrays/objetos
        try {
            if (req.body.servicios) {
                nuevoEvento.servicios = typeof req.body.servicios === 'string' ? 
                    JSON.parse(req.body.servicios) : req.body.servicios;
            }
            
            if (req.body.enlaces) {
                nuevoEvento.enlaces = typeof req.body.enlaces === 'string' ? 
                    JSON.parse(req.body.enlaces) : req.body.enlaces;
            }
            
            if (req.body.ubicaciones) {
                nuevoEvento.ubicaciones = typeof req.body.ubicaciones === 'string' ? 
                    JSON.parse(req.body.ubicaciones) : req.body.ubicaciones;
            }
        } catch (e) {
            console.error('Error al parsear campos:', e);
        }

        // --- NUEVO: Si viene imagen base64 en el body, usarla como carátula ---
        if (req.body.imagen && req.body.imagen.startsWith('data:image/')) {
            nuevoEvento.imagen = req.body.imagen;
        } else {
            // Manejo de archivos adjuntos (retrocompatibilidad)
            const archivosAdjuntos = Array.isArray(req.files?.archivos) ? 
                req.files.archivos : (req.files?.archivos ? [req.files.archivos] : []);

            if (archivosAdjuntos.length > 0) {
                // El primer archivo será la imagen principal
                const imagenPrincipal = archivosAdjuntos[0];
                const nombreLimpio = imagenPrincipal.originalname
                    .replace(/^.*[\\\/]/, '')
                    .replace(/[^a-zA-Z0-9-_\.]/g, '_');
                nuevoEvento.imagen = `/uploads/${nombreLimpio}`;
                // Todos los archivos van a adjuntos con nombres limpios
                nuevoEvento.adjuntos = archivosAdjuntos.map(file => {
                    const nombre = file.originalname
                        .replace(/^.*[\\\/]/, '')
                        .replace(/[^a-zA-Z0-9-_\.]/g, '_');
                    return `/uploads/${nombre}`;
                });
            } else {
                nuevoEvento.imagen = '';
                nuevoEvento.adjuntos = [];
            }
        }

        eventos.push(nuevoEvento);
        fs.writeFile(DATA_BASE_PATH, JSON.stringify(eventos, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ message: 'Error al escribir en dataBase.json' });
            }
            res.status(201).json(nuevoEvento);
        });
    });
};

// Actualizar evento
const updateEvento = async (req, res) => {
    fs.readFile(DATA_BASE_PATH, 'utf8', (err, data) => {
        let eventos = [];
        if (!err && data) {
            try {
                eventos = JSON.parse(data);
            } catch (e) { eventos = []; }
        }
        const idx = eventos.findIndex(ev => ev._id == req.params.id || (ev._id && ev._id.$oid === req.params.id));
        if (idx === -1) {
            return res.status(404).json({ message: 'Evento no encontrado' });
        }

        // Actualizar campos básicos (excepto _id)
        eventos[idx] = { ...eventos[idx], ...req.body, _id: eventos[idx]._id };

        // Parsear campos que pueden venir como string
        try {
            if (req.body.servicios) {
                eventos[idx].servicios = typeof req.body.servicios === 'string' ? 
                    JSON.parse(req.body.servicios) : req.body.servicios;
            }
            if (req.body.enlaces) {
                eventos[idx].enlaces = typeof req.body.enlaces === 'string' ? 
                    JSON.parse(req.body.enlaces) : req.body.enlaces;
            }
            if (req.body.ubicaciones) {
                eventos[idx].ubicaciones = typeof req.body.ubicaciones === 'string' ? 
                    JSON.parse(req.body.ubicaciones) : req.body.ubicaciones;
            }
        } catch (e) {
            console.error('Error al parsear campos en updateEvento:', e);
        }

        // --- NUEVO: Manejo de carátula en base64 ---
        if (req.body.imagen && typeof req.body.imagen === 'string' && req.body.imagen.startsWith('data:image/')) {
            eventos[idx].imagen = req.body.imagen;
        } else if (req.files && req.files.length > 0) {
            // Manejo de archivos adjuntos (retrocompatibilidad)
            const archivosAdjuntos = Array.isArray(req.files) ? req.files : [req.files];
            const imagenPrincipal = archivosAdjuntos[0];
            eventos[idx].imagen = `/uploads/${path.basename(imagenPrincipal.originalname)}`;
            eventos[idx].adjuntos = archivosAdjuntos.map(file => `/uploads/${path.basename(file.originalname)}`);
        } else {
            // Si no se envía ni imagen ni adjuntos, limpiar ambos campos
            eventos[idx].imagen = '';
            eventos[idx].adjuntos = [];
        }

        fs.writeFile(DATA_BASE_PATH, JSON.stringify(eventos, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ message: 'Error al escribir en dataBase.json' });
            }
            res.status(200).json(eventos[idx]);
        });
    });
};

// Eliminar evento
const deleteEvento = async (req, res) => {
    fs.readFile(DATA_BASE_PATH, 'utf8', (err, data) => {
        let eventos = [];
        if (!err && data) {
            try {
                eventos = JSON.parse(data);
            } catch (e) { eventos = []; }
        }
        const eventosFiltrados = eventos.filter(ev => ev._id != req.params.id && (!ev._id || ev._id.$oid !== req.params.id));
        if (eventos.length === eventosFiltrados.length) {
            return res.status(404).json({ message: 'Evento no encontrado' });
        }
        fs.writeFile(DATA_BASE_PATH, JSON.stringify(eventosFiltrados, null, 2), (err) => {
            if (err) {
                return res.status(500).json({ message: 'Error al escribir en dataBase.json' });
            }
            res.status(200).json({ message: 'Evento eliminado correctamente' });
        });
    });
};

module.exports = {
    getEventos,
    getEventoById,
    createEvento,
    updateEvento,
    deleteEvento
};
