const mongoose = require('mongoose');

const servicioSchema = new mongoose.Schema({
    servicios: { type: String, required: true },
    grado: String
}, { _id: false });

const archivoSchema = new mongoose.Schema({
    nombre: String,
    url: String
}, { _id: false });

const enlaceSchema = new mongoose.Schema({
    tipo: { type: String, required: true },
    url: { type: String, required: true }
}, { _id: false });

const ubicacionSchema = new mongoose.Schema({
    fecha: { type: Date, required: true }, // Fecha específica de esta ubicación
    tipoHorario: { type: String, enum: ['hora', 'horario'], required: true },
    horaInicio: { type: String, required: true },
    horaFin: String, // Solo requerido si tipoHorario es 'horario'
    lugar: { type: String, required: true }
}, { _id: false });

const eventoSchema = new mongoose.Schema({
    imagen: String,
    titulo: { type: String, required: true },
    ponentes: [{ 
        id: Number,
        nombre: String, 
        afiliacion: String 
    }],
    empresaOrganizadora: { type: String, required: true },
    tipoEvento: { type: String, required: true },
    descripcion: { type: String, required: true },
    adjuntos: [{
        name: String,
        type: String,
        size: Number,
        data: String // Base64 data
    }],
    servicios: [servicioSchema],
    enlaces: [enlaceSchema],
    actividad: String, // Actividad relacionada
    ubicaciones: [ubicacionSchema] // Array de ubicaciones con fecha, hora y lugar cada una
}, {
    timestamps: true
});

module.exports = mongoose.model('Evento', eventoSchema);
