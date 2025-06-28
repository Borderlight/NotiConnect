import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Evento, ArchivoAdjunto } from '../../interfaces/evento.interface';
import { TranslateModule } from '@ngx-translate/core';
import { IdiomaService } from '../../servicios/idioma.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-evento',
  standalone: true,
  imports: [CommonModule, TranslateModule, FormsModule, ReactiveFormsModule],
  templateUrl: './evento.component.html',
  styleUrls: ['./evento.component.css']
})
export class EventoComponent {
  @Input() evento!: Evento;
  @Output() eliminar = new EventEmitter<string>();
  @Output() actualizar = new EventEmitter<Partial<Evento>>();
  @Output() descargarIndividual = new EventEmitter<Evento>();
  @Output() solicitarConfirmacionEliminar = new EventEmitter<string>();
  currentLang: string = 'es';

  editMode = false;
  editForm!: FormGroup;
  mostrarDetalles = false;

  constructor(
    private idiomaService: IdiomaService,
    private fb: FormBuilder
  ) {
    this.idiomaService.obtenerIdiomaActual().subscribe(
      lang => this.currentLang = lang
    );
  }

  // Función eliminada - ya no navegamos a detalles, solo expandimos la card

  eliminarEvento(event: Event) {
    event.stopPropagation();
    console.log('ID del evento a eliminar:', this.evento._id);
    console.log('Evento completo:', this.evento);
    this.solicitarConfirmacionEliminar.emit(this.evento._id);
  }

  editarEvento(event: Event) {
    event.stopPropagation();
    this.editMode = true;
    // Usar los nuevos campos de ubicaciones y ponentes
    const primerPonente = this.evento.ponentes?.[0]?.nombre || '';
    const primeraUbicacion = this.evento.ubicaciones?.[0];
    
    this.editForm = this.fb.group({
      titulo: [this.evento.titulo, Validators.required],
      departamento: [this.evento.departamento || '', Validators.required],
      ponente: [primerPonente, Validators.required],
      fecha: [primeraUbicacion?.fecha || this.evento.fecha, Validators.required],
      horaInicio: [primeraUbicacion?.horaInicio || this.evento.horaInicio, Validators.required],
      horaFin: [primeraUbicacion?.horaFin || this.evento.horaFin],
      lugar: [primeraUbicacion?.lugar || this.evento.lugar, Validators.required],
      aula: [this.evento.aula || ''],
      actividad: [this.evento.actividad],
      descripcion: [this.descripcionTexto],
      servicios: [this.serviciosTexto],
      adjuntos: [this.adjuntosTexto],
      enlaces: [this.enlacesTexto]
    });
  }

  cancelarEdicion(event: Event) {
    event.stopPropagation();
    this.editMode = false;
  }

  get serviciosTexto(): string {
    if (!this.evento?.servicios || !Array.isArray(this.evento.servicios)) {
      return '';
    }
    return this.evento.servicios.map(s => s.servicios).join(', ') || '';
  }
  set serviciosTexto(valor: string) {
    if (!valor || valor.trim() === '') {
      this.evento.servicios = [];
      return;
    }
    this.evento.servicios = valor.split(',').map(s => ({ servicios: s.trim() })).filter(s => s.servicios);
  }

  get adjuntosTexto(): string {
    if (!this.evento?.adjuntos || !Array.isArray(this.evento.adjuntos)) {
      return '';
    }
    return this.evento.adjuntos.map(a => a.name || a).join(', ') || '';
  }
  set adjuntosTexto(valor: string) {
    if (!valor || valor.trim() === '') {
      this.evento.adjuntos = [];
      return;
    }
    // Convertir strings a objetos ArchivoAdjunto básicos
    this.evento.adjuntos = valor.split(',').map(a => {
      const nombre = a.trim();
      return nombre ? { name: nombre, type: '', size: 0, data: '' } : null;
    }).filter(a => a) as any[];
  }

  get enlacesTexto(): string {
    if (!this.evento?.enlaces || !Array.isArray(this.evento.enlaces)) {
      return '';
    }
    return this.evento.enlaces.map(e => e.url).join(', ') || '';
  }
  set enlacesTexto(valor: string) {
    if (!valor || valor.trim() === '') {
      this.evento.enlaces = [];
      return;
    }
    this.evento.enlaces = valor.split(',').map(url => ({ tipo: 'otro', url: url.trim() })).filter(e => e.url);
  }

  get descripcionTexto(): string {
    return this.evento?.descripcion || '';
  }
  set descripcionTexto(valor: string) {
    this.evento.descripcion = valor;
  }

  get ponentesTexto(): string {
    return this.evento?.ponentes?.map(p => p.nombre).filter(n => n).join(', ') || '';
  }

  get ponentesDetallados(): any[] {
    if (!this.evento?.ponentes || !Array.isArray(this.evento.ponentes)) {
      return [];
    }
    return this.evento.ponentes.filter(p => p.nombre).map(p => ({
      nombre: p.nombre,
      afiliacion: p.afiliacion || null
    }));
  }

  get serviciosDetallados(): any[] {
    if (!this.evento?.servicios || !Array.isArray(this.evento.servicios)) {
      return [];
    }
    return this.evento.servicios.filter(s => s.servicios).map(s => ({
      servicio: s.servicios,
      grado: s.grado || null
    }));
  }

  get enlacesDetallados(): any[] {
    if (!this.evento?.enlaces || !Array.isArray(this.evento.enlaces)) {
      return [];
    }
    return this.evento.enlaces.filter(e => e.url).map(e => ({
      tipo: e.tipo || 'Otro',
      url: e.url
    }));
  }

  get adjuntosDetallados(): any[] {
    if (!this.evento?.adjuntos || !Array.isArray(this.evento.adjuntos)) {
      return [];
    }
    return this.evento.adjuntos.filter(a => a).map(a => {
      if (typeof a === 'string') {
        return { name: a, type: '', size: 0 };
      }
      return a;
    });
  }

  get ubicacionesTexto(): string {
    if (!this.evento?.ubicaciones || this.evento.ubicaciones.length === 0) {
      // Retrocompatibilidad
      const fecha = this.fechaFormateada;
      const hora = this.horaTexto;
      const lugar = this.lugarTexto;
      return `${fecha} | ${hora} | ${lugar}`;
    }

    return this.evento.ubicaciones.map(ubicacion => {
      const fecha = new Date(ubicacion.fecha).toLocaleDateString('es-ES', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
      });
      const hora = ubicacion.tipoHorario === 'horario' && ubicacion.horaFin 
        ? `${ubicacion.horaInicio} - ${ubicacion.horaFin}`
        : ubicacion.horaInicio || ubicacion.hora || '';
      const lugar = ubicacion.aula ? `${ubicacion.lugar} - ${ubicacion.aula}` : ubicacion.lugar;
      
      return `${fecha} | ${hora} | ${lugar}`;
    }).join('\n');
  }

  get horaTexto(): string {
    if (this.evento?.ubicaciones && this.evento.ubicaciones.length > 0) {
      const ubicacion = this.evento.ubicaciones[0];
      if (ubicacion.tipoHorario === 'horario' && ubicacion.horaFin) {
        return `${ubicacion.horaInicio} - ${ubicacion.horaFin}`;
      }
      return ubicacion.horaInicio || '';
    }
    // Retrocompatibilidad
    if (this.evento?.horaFin) {
      return `${this.evento.horaInicio} - ${this.evento.horaFin}`;
    }
    return this.evento?.horaInicio || '';
  }

  get lugarTexto(): string {
    if (this.evento?.ubicaciones && this.evento.ubicaciones.length > 0) {
      return this.evento.ubicaciones[0].lugar || '';
    }
    // Retrocompatibilidad
    return this.evento?.lugar || '';
  }

  get fechaFormateada(): string {
    // Buscar la fecha en las ubicaciones
    if (this.evento?.ubicaciones && this.evento.ubicaciones.length > 0) {
      const fecha = new Date(this.evento.ubicaciones[0].fecha);
      const opciones: Intl.DateTimeFormatOptions = {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
      };
      return fecha.toLocaleDateString('es-ES', opciones);
    }
    // Retrocompatibilidad con el campo fecha antiguo
    if (this.evento?.fecha) {
      const fecha = new Date(this.evento.fecha);
      const opciones: Intl.DateTimeFormatOptions = {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
      };
      return fecha.toLocaleDateString('es-ES', opciones);
    }
    return '';
  }

  // Al guardar, sincroniza los campos complejos
  guardarEdicion(event: Event) {
    event.stopPropagation();
    if (this.editForm.valid) {
      // Sincronizar campos complejos usando los setters
      this.descripcionTexto = this.editForm.value.descripcion;
      this.serviciosTexto = this.editForm.value.servicios;
      this.adjuntosTexto = this.editForm.value.adjuntos;
      this.enlacesTexto = this.editForm.value.enlaces;
      
      // Actualizar ponentes (convertir de string individual a array)
      const ponenteNombre = this.editForm.value.ponente;
      if (ponenteNombre && ponenteNombre.trim()) {
        this.evento.ponentes = [{ 
          id: 1, 
          nombre: ponenteNombre.trim() 
        }];
      }
      
      // Actualizar ubicaciones
      if (!this.evento.ubicaciones || this.evento.ubicaciones.length === 0) {
        this.evento.ubicaciones = [{
          lugar: this.editForm.value.lugar || '',
          fecha: new Date(this.editForm.value.fecha),
          tipoHorario: 'horario' as const,
          horaInicio: this.editForm.value.horaInicio || ''
        }];
      }
      
      // Actualizar la primera ubicación con los datos del formulario
      const ubicacion = this.evento.ubicaciones[0];
      ubicacion.fecha = new Date(this.editForm.value.fecha);
      ubicacion.horaInicio = this.editForm.value.horaInicio;
      ubicacion.horaFin = this.editForm.value.horaFin;
      ubicacion.lugar = this.editForm.value.lugar;
      ubicacion.aula = this.editForm.value.aula;
      ubicacion.tipoHorario = this.editForm.value.horaFin ? 'horario' : 'hora';
      
      // Emitir los cambios al componente padre
      this.actualizar.emit({
        _id: this.evento._id,
        titulo: this.editForm.value.titulo,
        departamento: this.editForm.value.departamento,
        ponentes: this.evento.ponentes,
        ubicaciones: this.evento.ubicaciones,
        actividad: this.editForm.value.actividad,
        descripcion: this.evento.descripcion,
        servicios: this.evento.servicios,
        adjuntos: this.evento.adjuntos,
        enlaces: this.evento.enlaces
      });
      
      // Actualizar campos directos en el evento local
      this.evento.titulo = this.editForm.value.titulo;
      this.evento.departamento = this.editForm.value.departamento;
      this.evento.actividad = this.editForm.value.actividad;
      
      this.editMode = false;
    } else {
      this.editForm.markAllAsTouched();
    }
  }

  descargarEvento(event: Event) {
    event.stopPropagation();
    this.descargarIndividual.emit(this.evento);
  }

  toggleDetalles(event: Event) {
    event.stopPropagation();
    this.mostrarDetalles = !this.mostrarDetalles;
  }

  private descargarArchivo(contenido: string, nombreArchivo: string, tipo: string) {
    const blob = new Blob([contenido], { type: tipo });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nombreArchivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }

  private convertirEventoACSV(evento: any): string {
    const headers = Object.keys(evento);
    const values = headers.map(h => {
      let cell = evento[h]?.toString() || '';
      if (cell.includes(',') || cell.includes('"')) {
        cell = `"${cell.replace(/"/g, '""')}"`;
      }
      return cell;
    });
    return headers.join(',') + '\n' + values.join(',');
  }

  private descargarPDF(evento: any) {
    // Solo si jsPDF está disponible
    if (typeof window !== 'undefined' && (window as any).jsPDF) {
      const doc = new (window as any).jsPDF();
      let y = 20;
      doc.setFontSize(16);
      doc.text('Evento', 20, y);
      y += 10;
      doc.setFontSize(12);
      Object.keys(evento).forEach(key => {
        doc.text(`${key}: ${evento[key]}`, 20, y);
        y += 8;
      });
      doc.save(`evento_${evento._id}.pdf`);
    }
  }

  // Métodos para manejo de adjuntos
  esImagen(adjunto: string | ArchivoAdjunto): boolean {
    const data = typeof adjunto === 'string' ? adjunto : adjunto.data;
    return data.startsWith('data:image/');
  }

  obtenerTipoAdjunto(adjunto: string | ArchivoAdjunto): string {
    const data = typeof adjunto === 'string' ? adjunto : adjunto.data;
    if (data.startsWith('data:image/')) {
      return 'Imagen';
    } else if (data.startsWith('data:application/pdf')) {
      return 'PDF';
    } else if (data.startsWith('data:application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
      return 'Word';
    } else if (data.startsWith('data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')) {
      return 'Excel';
    } else if (data.startsWith('data:application/vnd.openxmlformats-officedocument.presentationml.presentation')) {
      return 'PowerPoint';
    } else if (data.startsWith('data:text/')) {
      return 'Texto';
    } else {
      return 'Archivo';
    }
  }

  obtenerIconoAdjunto(adjunto: string | ArchivoAdjunto): string {
    const data = typeof adjunto === 'string' ? adjunto : adjunto.data;
    if (data.startsWith('data:application/pdf')) {
      return '📄'; // PDF
    } else if (data.startsWith('data:application/vnd.openxmlformats-officedocument.wordprocessingml.document')) {
      return '📝'; // Word
    } else if (data.startsWith('data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet')) {
      return '📊'; // Excel
    } else if (data.startsWith('data:application/vnd.openxmlformats-officedocument.presentationml.presentation')) {
      return '📽️'; // PowerPoint
    } else if (data.startsWith('data:text/')) {
      return '📄'; // Texto
    } else {
      return '📎'; // Archivo genérico
    }
  }

  obtenerNombreAdjunto(adjunto: string | ArchivoAdjunto, index: number): string {
    if (typeof adjunto === 'string') {
      // Para adjuntos tipo string (formato antiguo), intentar determinar la extensión del tipo MIME
      const mimeMatch = adjunto.match(/data:([^;]+);/);
      if (mimeMatch) {
        const mimeType = mimeMatch[1];
        let extension = '';
        switch (mimeType) {
          case 'image/jpeg': extension = '.jpg'; break;
          case 'image/png': extension = '.png'; break;
          case 'image/gif': extension = '.gif'; break;
          case 'image/webp': extension = '.webp'; break;
          case 'application/pdf': extension = '.pdf'; break;
          case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document': extension = '.docx'; break;
          case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': extension = '.xlsx'; break;
          case 'application/vnd.openxmlformats-officedocument.presentationml.presentation': extension = '.pptx'; break;
          case 'text/plain': extension = '.txt'; break;
          default: extension = '.file'; break;
        }
        return `adjunto_${index + 1}${extension}`;
      }
      return `adjunto_${index + 1}`;
    } else {
      // Para adjuntos tipo ArchivoAdjunto (formato nuevo), usar siempre el nombre original del archivo
      return adjunto.name || `adjunto_${index + 1}`;
    }
  }

  abrirAdjunto(adjunto: string | ArchivoAdjunto, index: number): void {
    const data = typeof adjunto === 'string' ? adjunto : adjunto.data;
    const nombre = this.obtenerNombreAdjunto(adjunto, index);
    
    // Crear un blob a partir del data URL
    const byteCharacters = atob(data.split(',')[1]);
    const byteNumbers = new Array(byteCharacters.length);
    for (let i = 0; i < byteCharacters.length; i++) {
      byteNumbers[i] = byteCharacters.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    
    // Determinar el tipo MIME
    const mimeMatch = data.match(/data:([^;]+);/);
    const mimeType = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
    
    const blob = new Blob([byteArray], { type: mimeType });
    const url = URL.createObjectURL(blob);
    
    // Abrir en nueva ventana
    const nuevaVentana = window.open(url, '_blank');
    if (!nuevaVentana) {
      // Si no se puede abrir en nueva ventana, descargar el archivo
      const link = document.createElement('a');
      link.href = url;
      link.download = nombre;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    
    // Limpiar el URL después de un tiempo
    setTimeout(() => URL.revokeObjectURL(url), 10000);
  }
}