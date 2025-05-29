const mongoose = require('mongoose');

const eventoSchema = new mongoose.Schema({
    titulo: {
        type: String,
        required: true
    },
    descripcion: {
        type: String,
        required: true
    },
    fecha: {
        type: Date,
        required: true
    },
    actividad_relacionada: {
        type: String,
        required: true
    },
    servicios: [{
        tipo: String,
        nombre: String
    }],
    enlaces: [{
        tipo: String,
        url: String
    }],
    ubicaciones: [{
        lugar: String,
        aula: String,
        horaInicio: String,
        horaFin: String
    }]
}, {
    timestamps: true
});

module.exports = mongoose.model('Evento', eventoSchema);
