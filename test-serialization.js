// Script para probar el comportamiento de serialización de objetos
// antes de envío HTTP en Angular

function testSerialization() {
  console.log('=== PRUEBA DE SERIALIZACIÓN ===');
  
  // Simular un objeto adjunto
  const archivoObj = {
    name: 'test.jpg',
    type: 'image/jpeg',
    size: 12345,
    data: 'base64StringHere'
  };
  
  console.log('1. Objeto original:', archivoObj);
  console.log('2. Tipo:', typeof archivoObj);
  console.log('3. Es objeto:', typeof archivoObj === 'object');
  
  // Probar serialización JSON
  const jsonString = JSON.stringify(archivoObj);
  console.log('4. JSON stringificado:', jsonString);
  
  const parsedObject = JSON.parse(jsonString);
  console.log('5. Objeto parseado:', parsedObject);
  console.log('6. Tipo después de parsear:', typeof parsedObject);
  
  // Probar en un array
  const adjuntosArray = [archivoObj];
  console.log('7. Array con objeto:', adjuntosArray);
  
  const arrayJson = JSON.stringify(adjuntosArray);
  console.log('8. Array serializado:', arrayJson);
  
  const arrayParsed = JSON.parse(arrayJson);
  console.log('9. Array deserializado:', arrayParsed);
  console.log('10. Tipo del primer elemento:', typeof arrayParsed[0]);
  
  // Probar con eventoData simulado
  const eventoData = {
    titulo: 'Test Event',
    adjuntos: adjuntosArray
  };
  
  console.log('11. EventoData completo:', eventoData);
  const eventoJson = JSON.stringify(eventoData);
  console.log('12. EventoData serializado:', eventoJson);
  
  const eventoParsed = JSON.parse(eventoJson);
  console.log('13. EventoData deserializado:', eventoParsed);
  console.log('14. Tipo de adjuntos[0]:', typeof eventoParsed.adjuntos[0]);
}

// Ejecutar prueba
testSerialization();
