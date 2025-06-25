const express = require('express');
const path = require('path');

const app = express();

// Middleware básico
app.use(express.json());

// Servir archivos estáticos
app.use(express.static(path.join(__dirname, '../dist/noti-connect')));

// Ruta de prueba
app.get('/api/test', (req, res) => {
    res.json({ message: 'Server is working!' });
});

// Catch-all para Angular routing
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/noti-connect/index.html'));
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Test server running on port ${PORT}`);
});
