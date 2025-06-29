const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// 🧹 LIMPIAR CACHE DE MODELOS DE MONGOOSE
console.log('🧹 Limpiando cache de modelos de Mongoose...');
mongoose.modelNames().forEach(modelName => {
    delete mongoose.models[modelName];
    delete mongoose.modelSchemas[modelName];
});
console.log('✅ Cache limpiado exitosamente');

const app = express();

// Middleware
app.use(cors({
    origin: [
        'http://localhost:4200',
        'https://zd51xrvm-4200.uks1.devtunnels.ms',
        /https:\/\/.*\.devtunnels\.ms$/
    ],
    credentials: true
}));
app.use(express.json({ limit: '50mb' })); // Aumentar límite para archivos base64
app.use(express.urlencoded({ extended: true, limit: '50mb' })); // Para form data si es necesario

// Servir archivos estáticos de Angular desde la carpeta dist
app.use(express.static(path.join(__dirname, '../dist/noti-connect/browser')));

// Importar rutas
const eventoRoutes = require('./routes/evento.routes');

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/noticonnect';

//mongoose.connect(MONGODB_URI, {
//    useNewUrlParser: true,
//    useUnifiedTopology: true
//})
mongoose.connect(MONGODB_URI)
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('Could not connect to MongoDB:', err));

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK' });
});

// Usar rutas de API
app.use('/api/eventos', eventoRoutes);

// Manejar todas las demás rutas y devolver index.html (para el routing de Angular)
// IMPORTANTE: Esta ruta debe ir al final para no interferir con las rutas de API
app.use((req, res, next) => {
    // Si la petición no coincide con ninguna ruta de API, servir index.html
    if (!req.path.startsWith('/api/')) {
        res.sendFile(path.join(__dirname, '../dist/noti-connect/browser/index.html'));
    } else {
        next();
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`Angular app served from: ${path.join(__dirname, '../dist/noti-connect/browser')}`);
});
