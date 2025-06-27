const mongoose = require('mongoose');

const servicioSchema = new mongoose.Schema({
    servicios: { type: String, required: false }
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
    departamento: { type: String, default: 'Sin especificar' },
    ponentes: [{ 
        id: Number,
        nombre: String, 
        afiliacion: String 
    }],
    tipoEvento: { type: String, default: 'otro' },
    descripcion: { type: String, default: '' },
    adjuntos: [String], // Simplificado a array de strings
    servicios: [servicioSchema],
    enlaces: [enlaceSchema],
    actividad: { type: String, default: '' },
    ubicaciones: [ubicacionSchema]
}, {
    timestamps: true
});

module.exports = mongoose.model('Evento', eventoSchema);
