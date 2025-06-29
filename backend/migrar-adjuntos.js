const mongoose = require('mongoose');

// Conectar a MongoDB
mongoose.connect('mongodb://localhost:27017/noticonnect')
  .then(() => {
    console.log('Conectado a MongoDB para migración');
    migrarAdjuntos();
  })
  .catch(err => {
    console.error('Error conectando a MongoDB:', err);
    process.exit(1);
  });

async function migrarAdjuntos() {
  try {
    // Obtener la colección directamente sin esquema
    const eventosCollection = mongoose.connection.db.collection('eventos');
    
    // Encontrar todos los eventos
    const eventos = await eventosCollection.find({}).toArray();
    console.log(`Encontrados ${eventos.length} eventos para verificar`);
    
    let migrados = 0;
    let eliminados = 0;
    
    for (const evento of eventos) {
      let necesitaActualizacion = false;
      let nuevosAdjuntos = [];
      
      if (evento.adjuntos && Array.isArray(evento.adjuntos)) {
        for (let i = 0; i < evento.adjuntos.length; i++) {
          const adjunto = evento.adjuntos[i];
          
          // Si es un string (formato antiguo), eliminarlo
          if (typeof adjunto === 'string') {
            console.log(`Eliminando adjunto string en evento ${evento._id}`);
            necesitaActualizacion = true;
            eliminados++;
            // No agregamos nada al array, efectivamente eliminamos el adjunto
          }
          // Si es un objeto válido, mantenerlo
          else if (adjunto && typeof adjunto === 'object' && adjunto.name && adjunto.type && adjunto.data) {
            nuevosAdjuntos.push(adjunto);
          }
          // Si es un objeto inválido, eliminarlo también
          else {
            console.log(`Eliminando adjunto inválido en evento ${evento._id}:`, adjunto);
            necesitaActualizacion = true;
            eliminados++;
          }
        }
      }
      
      if (necesitaActualizacion) {
        await eventosCollection.updateOne(
          { _id: evento._id },
          { $set: { adjuntos: nuevosAdjuntos } }
        );
        migrados++;
        console.log(`Migrado evento ${evento._id} - adjuntos: ${nuevosAdjuntos.length}`);
      }
    }
    
    console.log(`\n✅ Migración completada:`);
    console.log(`   - Eventos procesados: ${eventos.length}`);
    console.log(`   - Eventos migrados: ${migrados}`);
    console.log(`   - Adjuntos eliminados: ${eliminados}`);
    
  } catch (error) {
    console.error('Error durante la migración:', error);
  } finally {
    mongoose.connection.close();
    console.log('Conexión cerrada');
    process.exit(0);
  }
}
