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
                eventos = eventos.filter(ev => {
                    // Buscar en el array de ponentes
                    if (Array.isArray(ev.ponentes)) {
                        return ev.ponentes.some(p => p.nombre && p.nombre.toLowerCase().includes(ponente.toLowerCase()));
                    }
                    // Retrocompatibilidad con campo ponente único
                    return ev.ponente && ev.ponente.toLowerCase().includes(ponente.toLowerCase());
                });
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
    console.log('req.method:', req.method);
    console.log('req.headers:', req.headers);
    console.log('req.body type:', typeof req.body);
    console.log('req.body:', req.body);
    console.log('req.files:', req.files);
    console.log('req.body keys:', req.body ? Object.keys(req.body) : 'N/A');
    
    // Verificar si req.body existe
    if (!req.body) {
        console.error('❌ req.body is undefined');
        return res.status(400).json({ message: 'No data received in request body' });
    }
    
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
            empresaOrganizadora: req.body.empresaOrganizadora || '',
            tipoEvento: req.body.tipoEvento || '',
            descripcion: req.body.descripcion || '',
            servicios: [],
            enlaces: [],
            adjuntos: [],
            imagen: '',
            actividad: req.body.actividad || '', // Campo de actividad relacionada
            ubicaciones: [], // Las fechas van dentro de cada ubicación
            ponentes: [] // Array de ponentes con nombre y afiliación
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

            if (req.body.ponentes) {
                nuevoEvento.ponentes = typeof req.body.ponentes === 'string' ? 
                    JSON.parse(req.body.ponentes) : req.body.ponentes;
            }
        } catch (e) {
            console.error('Error al parsear campos:', e);
        }

        // --- NUEVO: Manejo de archivos adjuntos en base64 desde JSON ---
        if (req.body.adjuntos && Array.isArray(req.body.adjuntos)) {
            // Los archivos vienen como array de objetos con { name, type, size, data }
            nuevoEvento.adjuntos = req.body.adjuntos.map(archivo => ({
                name: archivo.name,
                type: archivo.type,
                size: archivo.size,
                data: archivo.data // Base64 string
            }));
            console.log('Archivos adjuntos procesados desde JSON:', nuevoEvento.adjuntos.length);
        }

        // --- Manejo de imagen de carátula en base64 ---
        if (req.body.imagen && req.body.imagen.startsWith('data:image/')) {
            nuevoEvento.imagen = req.body.imagen;
            console.log('Imagen de carátula procesada desde JSON');
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
