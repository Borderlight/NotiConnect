const mongoose = require('mongoose');

async function verificarBD() {
  try {
    await mongoose.connect('mongodb://localhost:27017/noticonnect');
    console.log('Conectado a MongoDB');
    
    // Listar todas las bases de datos
    const admin = mongoose.connection.db.admin();
    const databases = await admin.listDatabases();
    
    console.log('\n🗃️ Bases de datos disponibles:');
    databases.databases.forEach(db => {
      console.log(`   - ${db.name} (${(db.sizeOnDisk / 1024 / 1024).toFixed(2)} MB)`);
    });
    
    // Verificar colecciones en la BD actual
    console.log('\n📋 Colecciones en noticonnect:');
    const collections = await mongoose.connection.db.listCollections().toArray();
    
    for (const collection of collections) {
      const count = await mongoose.connection.db.collection(collection.name).countDocuments();
      console.log(`   - ${collection.name}: ${count} documentos`);
    }
    
    // Si hay eventos, mostrar uno de ejemplo
    if (collections.some(c => c.name === 'eventos')) {
      const eventoEjemplo = await mongoose.connection.db.collection('eventos').findOne();
      if (eventoEjemplo) {
        console.log('\n📄 Ejemplo de evento:');
        console.log('   - ID:', eventoEjemplo._id);
        console.log('   - Título:', eventoEjemplo.titulo);
        console.log('   - Adjuntos:', eventoEjemplo.adjuntos ? eventoEjemplo.adjuntos.length : 'undefined');
        if (eventoEjemplo.adjuntos && eventoEjemplo.adjuntos.length > 0) {
          console.log('   - Primer adjunto tipo:', typeof eventoEjemplo.adjuntos[0]);
          console.log('   - Primer adjunto:', eventoEjemplo.adjuntos[0]);
        }
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
}

verificarBD();
