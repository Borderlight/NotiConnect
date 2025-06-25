const express = require('express');
const multer = require('multer');
const router = express.Router();
const eventoController = require('../controllers/evento.controller');

// Configurar multer para manejar archivos en memoria
const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 50 * 1024 * 1024 // 50MB por archivo
    }
});

// Rutas para eventos
router.get('/', eventoController.getEventos);
router.get('/:id', eventoController.getEventoById);
router.post('/', upload.array('adjuntos'), eventoController.createEvento); // Usar multer para POST
router.put('/:id', upload.array('adjuntos'), eventoController.updateEvento); // Usar multer para PUT
router.delete('/:id', eventoController.deleteEvento);

module.exports = router;
