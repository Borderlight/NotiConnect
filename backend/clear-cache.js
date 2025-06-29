const mongoose = require('mongoose');

// Limpiar todos los modelos cacheados
console.log('🧹 Limpiando cache de modelos de Mongoose...');
mongoose.modelNames().forEach(modelName => {
    delete mongoose.models[modelName];
    delete mongoose.modelSchemas[modelName];
});

// Verificar que esté limpio
console.log('📋 Modelos después de limpiar:', mongoose.modelNames());
console.log('✅ Cache limpiado exitosamente');
