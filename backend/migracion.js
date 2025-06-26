const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
require('dotenv').config();
const Evento = require('./models/evento');

// Conexión a MongoDB Atlas
const MONGODB_URI = process.env.MONGODB_URI;

async function migrarDatos() {
    try {
        // Conectar a MongoDB
        await mongoose.connect(MONGODB_URI);
        console.log('Conectado a MongoDB');

        // Leer datos del archivo JSON
        const dataPath = path.join(__dirname, 'dataBase.json');
        const data = fs.readFileSync(dataPath, 'utf8');
        const eventos = JSON.parse(data);

        console.log(`Encontrados ${eventos.length} eventos para migrar`);

        // Limpiar la colección existente
        await Evento.deleteMany({});
        console.log('Colección limpiada');

        // Migrar cada evento
        for (const evento of eventos) {
            try {
                // Función auxiliar para limpiar y validar datos
                const limpiarUbicaciones = (ubicaciones) => {
                    if (!Array.isArray(ubicaciones)) return [];
                    return ubicaciones.map(ub => ({
                        lugar: ub.lugar || '',
                        fecha: ub.fecha || '',
                        horaInicio: ub.horaInicio || '00:00',
                        horaFin: ub.horaFin || '23:59'
                    })).filter(ub => ub.lugar && ub.fecha);
                };

                const limpiarAdjuntos = (adjuntos) => {
                    if (!Array.isArray(adjuntos)) {
                        // Si es un string que parece ser un array serializado, intentar parsearlo
                        if (typeof adjuntos === 'string' && adjuntos.startsWith('[')) {
                            try {
                                return [];
                            } catch {
                                return [];
                            }
                        }
                        return [];
                    }
                    return adjuntos.filter(adj => typeof adj === 'string' && adj.trim().length > 0);
                };

                const limpiarServicios = (servicios) => {
                    if (!Array.isArray(servicios)) return [];
                    return servicios.map(serv => {
                        if (typeof serv === 'string') {
                            return { servicios: serv };
                        }
                        return {
                            servicios: serv.servicios || serv.nombre || 'Sin especificar'
                        };
                    }).filter(serv => serv.servicios);
                };

                const limpiarEnlaces = (enlaces) => {
                    if (!Array.isArray(enlaces)) return [];
                    return enlaces.map(enlace => {
                        if (typeof enlace === 'string') {
                            return {
                                tipo: 'otro',
                                url: enlace
                            };
                        }
                        return {
                            tipo: enlace.tipo || 'otro',
                            url: enlace.url || enlace.enlace || ''
                        };
                    }).filter(enlace => enlace.url && enlace.url.trim().length > 0);
                };

                // Adaptar el formato de datos
                const eventoMigrado = {
                    imagen: evento.imagen || null,
                    titulo: evento.titulo || 'Sin título',
                    ponentes: evento.ponentes || (evento.ponente ? [{ id: 1, nombre: evento.ponente, afiliacion: '' }] : []),
                    empresaOrganizadora: evento.empresaOrganizadora || 'Sin especificar',
                    tipoEvento: evento.tipoEvento || 'otro',
                    descripcion: evento.descripcion || '',
                    adjuntos: limpiarAdjuntos(evento.adjuntos),
                    servicios: limpiarServicios(evento.servicios),
                    enlaces: limpiarEnlaces(evento.enlaces),
                    actividad: evento.actividad || '',
                    ubicaciones: limpiarUbicaciones(evento.ubicaciones)
                };

                // Solo migrar si tiene al menos título y ubicaciones válidas
                if (eventoMigrado.titulo && eventoMigrado.titulo !== 'Sin título' && eventoMigrado.ubicaciones.length > 0) {
                    const nuevoEvento = new Evento(eventoMigrado);
                    await nuevoEvento.save();
                    console.log(`✅ Evento migrado: ${evento.titulo}`);
                } else {
                    console.log(`⚠️  Evento omitido (datos insuficientes): ${evento.titulo || 'Sin título'}`);
                }
            } catch (error) {
                console.error(`❌ Error al migrar evento ${evento.titulo}:`, error.message);
            }
        }

        console.log('Migración completada');
        process.exit(0);
    } catch (error) {
        console.error('Error en la migración:', error);
        process.exit(1);
    }
}

migrarDatos();
