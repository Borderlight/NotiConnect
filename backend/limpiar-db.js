const mongoose = require('mongoose');
require('dotenv').config();

async function limpiarBaseDatos() {
    try {
        // Conectar a MongoDB
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Conectado a MongoDB');

        // Obtener todas las colecciones
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Colecciones encontradas:', collections.map(c => c.name));

        // Eliminar todas las colecciones
        for (const collection of collections) {
            await mongoose.connection.db.dropCollection(collection.name);
            console.log(`✅ Colección eliminada: ${collection.name}`);
        }

        console.log('🧹 Base de datos limpiada completamente');
        process.exit(0);
    } catch (error) {
        console.error('❌ Error al limpiar la base de datos:', error);
        process.exit(1);
    }
}

limpiarBaseDatos();
