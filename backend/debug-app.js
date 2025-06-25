const express = require('express');
const path = require('path');

const app = express();

// Middleware básico
app.use(express.json());

console.log('1. Express y middleware básico cargados');

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, '../dist/noti-connect/browser')));

console.log('2. Archivos estáticos configurados');

// Ruta de prueba simple
app.get('/api/test', (req, res) => {
    res.json({ message: 'API test working!' });
});

console.log('3. Ruta de API test configurada');

// Importar y usar las rutas de eventos
try {
    const eventoRoutes = require('./routes/evento.routes');
    console.log('4. Rutas de eventos importadas correctamente');
    
    app.use('/api/eventos', eventoRoutes);
    console.log('5. Rutas de eventos configuradas');
} catch (error) {
    console.error('ERROR al importar o configurar rutas de eventos:', error);
}

// Catch-all para Angular (al final) - alternativa compatible
app.use((req, res, next) => {
    // Si la petición no coincide con ninguna ruta de API, servir index.html
    if (!req.path.startsWith('/api/')) {
        res.sendFile(path.join(__dirname, '../dist/noti-connect/browser/index.html'));
    } else {
        next();
    }
});

console.log('6. Catch-all configurado');

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Debug server running on port ${PORT}`);
});