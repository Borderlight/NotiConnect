const mongoose = require('mongoose');

const servicioSchema = new mongoose.Schema({
    servicios: { type: String, required: false },
    grado: { type: String, required: false }
}, { _id: false });

const enlaceSchema = new mongoose.Schema({
    tipo: { type: String, required: false },
    url: { type: String, required: false }
}, { _id: false });

const ubicacionSchema = new mongoose.Schema({
    fecha: { type: String, required: true }, // Cambiado a String para mayor flexibilidad
    horaInicio: { type: String, required: true },
    horaFin: { type: String, default: '23:59' },
    lugar: { type: String, required: true }
}, { _id: false });

const eventoSchema = new mongoose.Schema({
    imagen: { type: String, default: null },
    titulo: { type: String, required: true },
    ponentes: [{ 
        id: Number,
        nombre: String, 
        afiliacion: String 
    }],
    empresaOrganizadora: { type: String, default: 'Sin especificar' },
    tipoEvento: { type: String, default: 'otro' },
    numeroParticipantes: { type: Number, required: false },
    participantesDesconocido: { type: Boolean, default: false },
    descripcion: { type: String, default: '' },
    adjuntos: mongoose.Schema.Types.Mixed, // Simplificado sin default
    servicios: [servicioSchema],
    enlaces: [enlaceSchema],
    actividad: { type: String, default: '' },
    ubicaciones: [ubicacionSchema],
    // Campos de autoría
    creadoPor: { type: String, required: false }, // Email del usuario que creó el evento
    modificadoPor: { type: String, required: false } // Email del usuario que modificó el evento por última vez
}, {
    timestamps: true,
    strict: false // Permitir campos no definidos en el esquema
});

// Log para verificar el esquema
console.log('🔧 Creando modelo Evento con adjuntos tipo:', eventoSchema.paths.adjuntos.instance);

module.exports = mongoose.model('Evento', eventoSchema);
