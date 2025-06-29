const mongoose = require('mongoose');

async function analizarAdjuntos() {
  try {
    await mongoose.connect('mongodb://localhost:27017/noticonnect');
    console.log('Conectado a MongoDB para análisis');
    
    const eventosCollection = mongoose.connection.db.collection('eventos');
    const eventos = await eventosCollection.find({}).toArray();
    
    console.log(`\n📊 Analizando ${eventos.length} eventos...\n`);
    
    let eventosConAdjuntos = 0;
    let adjuntosString = 0;
    let adjuntosObjeto = 0;
    let adjuntosInvalidos = 0;
    
    for (const evento of eventos) {
      if (evento.adjuntos && Array.isArray(evento.adjuntos) && evento.adjuntos.length > 0) {
        eventosConAdjuntos++;
        console.log(`\n🔍 Evento: ${evento.titulo} (${evento._id})`);
        console.log(`   Adjuntos: ${evento.adjuntos.length}`);
        
        evento.adjuntos.forEach((adj, index) => {
          console.log(`   Adjunto ${index}:`);
          console.log(`     - Tipo: ${typeof adj}`);
          
          if (typeof adj === 'string') {
            adjuntosString++;
            console.log(`     - Es string de ${adj.length} caracteres`);
            console.log(`     - Primeros 50: ${adj.substring(0, 50)}...`);
          } else if (typeof adj === 'object' && adj.name && adj.type && adj.data) {
            adjuntosObjeto++;
            console.log(`     - Es objeto válido:`);
            console.log(`       - name: ${adj.name}`);
            console.log(`       - type: ${adj.type}`);
            console.log(`       - size: ${adj.size}`);
            console.log(`       - data: ${adj.data ? adj.data.length + ' chars' : 'sin data'}`);
          } else {
            adjuntosInvalidos++;
            console.log(`     - Es objeto inválido:`, Object.keys(adj || {}));
          }
        });
      }
    }
    
    console.log(`\n📈 RESUMEN:`);
    console.log(`   - Total eventos: ${eventos.length}`);
    console.log(`   - Eventos con adjuntos: ${eventosConAdjuntos}`);
    console.log(`   - Adjuntos como string: ${adjuntosString}`);
    console.log(`   - Adjuntos como objeto: ${adjuntosObjeto}`);
    console.log(`   - Adjuntos inválidos: ${adjuntosInvalidos}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
    process.exit(0);
  }
}

analizarAdjuntos();
