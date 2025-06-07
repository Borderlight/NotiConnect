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
    lugar: { type: String, required: true },
    aula: String,
    fecha: Date,
    tipoHorario: { type: String, enum: ['hora', 'horario'] },
    horaInicio: String,
    horaFin: String
}, { _id: false });

const eventoSchema = new mongoose.Schema({
    imagen: String,
    titulo: { type: String, required: true },
    ponente: String,
    empresaOrganizadora: String,
    tipoEvento: String,
    descripcion: { type: String, required: true },
    adjuntos: [String],
    servicios: [servicioSchema],
    enlaces: [enlaceSchema],
    actividad: { type: String, required: true },
    ubicaciones: [ubicacionSchema],
    fecha: { type: Date, required: true },
    lugar: String,
    aula: String,
    horaInicio: String,
    horaFin: String
}, {
    timestamps: true
});

module.exports = mongoose.model('Evento', eventoSchema);
