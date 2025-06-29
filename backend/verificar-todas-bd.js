const mongoose = require('mongoose');

async function verificarTodasLasBD() {
  try {
    // Verificar BD 'eventos'
    console.log('=== VERIFICANDO BD "eventos" ===');
    await mongoose.connect('mongodb://localhost:27017/eventos');
    
    const collections1 = await mongoose.connection.db.listCollections().toArray();
    console.log('Colecciones en "eventos":');
    for (const collection of collections1) {
      const count = await mongoose.connection.db.collection(collection.name).countDocuments();
      console.log(`   - ${collection.name}: ${count} documentos`);
      
      if (collection.name === 'eventos' && count > 0) {
        const eventos = await mongoose.connection.db.collection('eventos').find({}).toArray();
        eventos.forEach((evento, index) => {
          console.log(`   Evento ${index}: ${evento.titulo}`);
          if (evento.adjuntos) {
            console.log(`     Adjuntos: ${evento.adjuntos.length}, tipo primer adjunto: ${typeof evento.adjuntos[0]}`);
          }
        });
      }
    }
    
    await mongoose.connection.close();
    
    // Verificar BD 'noticonnect'
    console.log('\n=== VERIFICANDO BD "noticonnect" ===');
    await mongoose.connect('mongodb://localhost:27017/noticonnect');
    
    const collections2 = await mongoose.connection.db.listCollections().toArray();
    console.log('Colecciones en "noticonnect":');
    for (const collection of collections2) {
      const count = await mongoose.connection.db.collection(collection.name).countDocuments();
      console.log(`   - ${collection.name}: ${count} documentos`);
      
      if (collection.name === 'eventos' && count > 0) {
        const eventos = await mongoose.connection.db.collection('eventos').find({}).toArray();
        eventos.forEach((evento, index) => {
          console.log(`   Evento ${index}: ${evento.titulo}`);
          if (evento.adjuntos) {
            console.log(`     Adjuntos: ${evento.adjuntos.length}, tipo primer adjunto: ${typeof evento.adjuntos[0]}`);
          }
        });
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
}

verificarTodasLasBD();
