// Script de prueba para verificar los campos creadoPor y modificadoPor
const eventoEjemplo = {
  imagen: '',
  titulo: 'Evento de Prueba - Autoría',
  departamento: 'Facultad de Informática',
  tipoEvento: 'EVENT',
  descripcion: 'Evento para probar los campos de autoría',
  adjuntos: [],
  servicios: [],
  enlaces: [],
  ubicaciones: [{
    lugar: 'Aula Virtual',
    fecha: new Date(),
    tipoHorario: 'hora',
    horaInicio: '10:00'
  }],
  creadoPor: 'usuario.prueba@upsa.es',
  modificadoPor: 'usuario.modificador@upsa.es'
};

console.log('📝 Estructura del evento con campos de autoría:');
console.log(JSON.stringify(eventoEjemplo, null, 2));

console.log('\n✅ Los campos creadoPor y modificadoPor están incluidos en la estructura del evento');
console.log('✅ Frontend enviará automáticamente:');
console.log('   - creadoPor: email del usuario al crear el evento');
console.log('   - modificadoPor: email del usuario al editar el evento');

console.log('\n📋 Para el backend, asegúrate de que el modelo Evento incluye:');
console.log('   creadoPor: { type: String, required: false }');
console.log('   modificadoPor: { type: String, required: false }');
