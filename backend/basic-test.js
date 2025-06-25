const express = require('express');
const path = require('path');

const app = express();

console.log('Starting basic server...');

// Middleware básico
app.use(express.json());

// Ruta de prueba simple
app.get('/test', (req, res) => {
    res.json({ message: 'Basic server is working!' });
});

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Basic server running on port ${PORT}`);
    console.log('Test: http://localhost:3000/test');
});
