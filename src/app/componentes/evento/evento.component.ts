import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Evento, ArchivoAdjunto } from '../../interfaces/evento.interface';
import { TranslateModule } from '@ngx-translate/core';
import { IdiomaService } from '../../servicios/idioma.service';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OpcionesSincronizadasService } from '../../servicios/opciones-sincronizadas.service';

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

  // Variable para guardar la carátula original y adjuntos originales
  private caratulaOriginal: string | undefined;
  private adjuntosOriginales: ArchivoAdjunto[] = [];

  // Datos de facultades y grados
  facultadesGrados = [
    {
      "facultad": "Facultad de Ciencias de la Salud",
      "grados": [
        "Grado en Logopedia",
        "Grado en Enfermería",
        "Grado en Fisioterapia",
        "Grado en Nutrición Humana y Dietética"
      ]
    },
    {
      "facultad": "Facultad de Ciencias del Seguro, Jurídicas y de la Empresa",
      "grados": [
        "Grado en Administración y Dirección de Empresas",
        "Grado en Relaciones Internacionales",
        "Grado en Derecho"
      ]
    },
    {
      "facultad": "Facultad de Ciencias Humanas y Sociales",
      "grados": [
        "Máster de Formación Permanente en Gobernanza Ética",
        "Grado en Filosofía"
      ]
    },
    {
      "facultad": "Facultad de Comunicación",
      "grados": [
        "Grado en Periodismo",
        "Grado en Comunicación Audiovisual"
      ]
    },
    {
      "facultad": "Facultad de Derecho Canónico",
      "grados": [
        "Doctorado Eclesiástico en Derecho Canónico",
        "Licenciatura en Derecho Canónico"
      ]
    },
    {
      "facultad": "Facultad de Educación",
      "grados": [
        "Grado en Ciencias de la Actividad Física y del Deporte",
        "Grado en Maestro en Educación Infantil",
        "Grado en Maestro en Educación Primaria",
        "Curso de Formación Pedagógica y Didáctica",
        "Máster en Formación Permanente en Musicoterapia",
        "Máster en Formación Permanente en Entrenamiento y Rendimiento en Fútbol",
        "Máster Universitario en Formación del Profesorado de ESO y Bachillerato, FP y Enseñanza de Idiomas",
        "Doble Grado en Maestro en Educación Primaria y Maestro en Educación Infantil",
        "Máster Universitario en Psicopedagogía",
        "Máster de Formación Permanente en Gestión en Situaciones de Crisis"
      ]
    },
    {
      "facultad": "Facultad de Enfermería y Fisioterapia Salus Infirmorum",
      "grados": [
        "Grado en Fisioterapia (Madrid)",
        "Grado en Enfermería (Madrid)"
      ]
    },
    {
      "facultad": "Facultad de Informática",
      "grados": [
        "Doble Grado en ADE Tecnológico e Ingeniería Informática",
        "Grado en Administración y Dirección de Empresas Tecnológicas",
        "Doble Grado en Ingeniería Informática y ADET",
        "Grado en Ingeniería Informática",
        "Diploma de Especialista en Inteligencia Artificial & Big Data Analytics",
        "Máster Universitario en Informática Móvil",
        "Máster Universitario en Dirección en Proyectos Informáticos y Servicios Tecnológicos"
      ]
    },
    {
      "facultad": "Facultad de Psicología",
      "grados": [
        "Grado en Psicología",
        "Máster Universitario en Psicología General Sanitaria",
        "Diploma de Experto en Invtervención Psicosocial"
      ]
    },
    {
      "facultad": "Facultad de Teología",
      "grados": [
        "Bachiller en Teología",
        "Licenciatura en Teología Bíblica",
        "Licenciatura en Teología Dogmática",
        "Licenciatura en Teología Práctica",
        "Licenciatura en Teología Pastoral",
        "Doctorado Eclesiástico en Teología Bíblica",
        "Doctorado Eclesiástico en Teología Dogmática",
        "Doctorado Eclesiástico en Teología Práctica",
        "Doctorado Eclesiástico en Teología Pastoral",
        "Doctorado Eclesiástico en Teología de la Vida Consagrada",
        "Máster Universitario en Doctrina Social de la Iglesia"
      ]
    }
  ];

  // Propiedades para opciones sincronizadas
  departamentosDisponibles: string[] = [];
  actividadesDisponibles: string[] = [];
  lugaresDisponibles: string[] = [];

  // Mapeo de lugares
  lugaresMap: { [key: string]: string } = {
    'FACULTY': 'Facultad',
    'AULA_MAGNA': 'Aula de grado',
    'HUBdeInnovacion': 'HUB de Innovación',
    'LIBRARY': 'Biblioteca',
    'AuditorioJuanPablo': 'Auditorio Juan Pablo II',
    'S-41': 'S-41',
    'ONLINE': 'Online'
  };

  constructor(
    private idiomaService: IdiomaService,
    private fb: FormBuilder,
    private opcionesSincronizadasService: OpcionesSincronizadasService
  ) {
    this.idiomaService.obtenerIdiomaActual().subscribe(
      lang => this.currentLang = lang
    );
    
    // Suscribirse a los cambios en las opciones sincronizadas
    this.opcionesSincronizadasService.getDepartamentos().subscribe(
      departamentos => this.departamentosDisponibles = departamentos
    );
    
    this.opcionesSincronizadasService.getActividades().subscribe(
      actividades => this.actividadesDisponibles = actividades
    );
    
    this.opcionesSincronizadasService.getLugares().subscribe(
      lugares => this.lugaresDisponibles = lugares
    );
    
    // Inicializar el formulario vacío para evitar errores
    this.editForm = this.fb.group({
      tipoEvento: [''],
      titulo: [''],
      departamento: [''],
      descripcion: [''],
      actividad: [''],
      ubicaciones: this.fb.array([]),
      ponentes: this.fb.array([]),
      servicios: this.fb.array([]),
      enlaces: this.fb.array([])
    });
  }

  // Función eliminada - ya no navegamos a detalles, solo expandimos la card

  eliminarEvento(event: Event) {
    event.stopPropagation();
    this.solicitarConfirmacionEliminar.emit(this.evento._id);
  }

  editarEvento(event: Event) {
    event.stopPropagation();
    
    // Guardar la carátula original y adjuntos originales para poder restaurarlos si se cancela
    this.caratulaOriginal = this.evento.imagen;
    this.adjuntosOriginales = this.evento.adjuntos ? [...this.evento.adjuntos] : [];
    
    this.editMode = true;
    
    // Crear formulario con FormArrays vacíos inicialmente
    this.editForm = this.fb.group({
      tipoEvento: [this.evento.tipoEvento || '', Validators.required],
      titulo: [this.evento.titulo, Validators.required],
      departamento: [this.obtenerDepartamentoValido(this.evento.departamento || ''), Validators.required],
      descripcion: [this.evento.descripcion || ''],
      actividad: [this.evento.actividad || ''],
      ubicaciones: this.fb.array([]),
      ponentes: this.fb.array([]),
      servicios: this.fb.array([]),
      enlaces: this.fb.array([])
    });

    // Llenar FormArrays con datos existentes
    this.initUbicaciones();
    this.initPonentes();
    this.initServicios();
    this.initEnlaces();
  }

  cancelarEdicion(event: Event) {
    event.stopPropagation();
    
    // Restaurar la carátula original y adjuntos originales
    if (this.caratulaOriginal !== undefined) {
      this.evento.imagen = this.caratulaOriginal;
    }
    if (this.adjuntosOriginales.length > 0 || this.evento.adjuntos?.length !== this.adjuntosOriginales.length) {
      this.evento.adjuntos = [...this.adjuntosOriginales];
    }
    
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
      
      // Mejorar la lógica de detección de horario
      let hora = '';
      if (ubicacion.tipoHorario === 'horario' || 
          (ubicacion.horaFin && ubicacion.horaFin.trim() !== '' && ubicacion.horaFin !== '00:00' && ubicacion.horaFin !== '23:59')) {
        hora = `${ubicacion.horaInicio} - ${ubicacion.horaFin}`;
      } else {
        hora = ubicacion.horaInicio || ubicacion.hora || '';
      }
      
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
      const formValue = this.editForm.value;
      
      // Actualizar ubicaciones
      this.evento.ubicaciones = formValue.ubicaciones.map((ubicacion: any) => {
        const ubicacionData: any = {
          fecha: new Date(ubicacion.fecha),
          tipoHorario: ubicacion.tipoHorario,
          horaInicio: ubicacion.horaInicio,
          lugar: ubicacion.lugar
        };
        
        // Solo incluir horaFin si es horario y tiene valor
        if (ubicacion.tipoHorario === 'horario' && ubicacion.horaFin && ubicacion.horaFin.trim() !== '') {
          ubicacionData.horaFin = ubicacion.horaFin;
        }
        
        return ubicacionData;
      });
      
      // Actualizar ponentes
      this.evento.ponentes = formValue.ponentes
        .filter((p: any) => p.nombre && p.nombre.trim())
        .map((ponente: any, index: number) => ({
          id: index + 1,
          nombre: ponente.nombre.trim(),
          afiliacion: ponente.afiliacion || undefined
        }));
      
      // Actualizar servicios
      this.evento.servicios = formValue.servicios
        .filter((s: any) => s.servicios && s.servicios.trim())
        .map((servicio: any) => ({
          servicios: servicio.servicios.trim(),
          grado: servicio.grado || undefined
        }));
      
      // Actualizar enlaces
      this.evento.enlaces = formValue.enlaces
        .filter((e: any) => e.url && e.url.trim())
        .map((enlace: any) => ({
          tipo: enlace.tipo,
          url: enlace.url.trim()
        }));
      
      // Emitir los cambios al componente padre
      this.actualizar.emit({
        _id: this.evento._id,
        tipoEvento: formValue.tipoEvento,
        titulo: formValue.titulo,
        departamento: formValue.departamento,
        descripcion: formValue.descripcion,
        actividad: formValue.actividad,
        ponentes: this.evento.ponentes,
        ubicaciones: this.evento.ubicaciones,
        servicios: this.evento.servicios,
        enlaces: this.evento.enlaces,
        imagen: this.evento.imagen, // Incluir la carátula seleccionada
        adjuntos: this.evento.adjuntos // Incluir los adjuntos modificados
      });
      
      // Actualizar campos directos en el evento local
      this.evento.tipoEvento = formValue.tipoEvento;
      this.evento.titulo = formValue.titulo;
      this.evento.departamento = formValue.departamento;
      this.evento.descripcion = formValue.descripcion;
      this.evento.actividad = formValue.actividad;
      
      this.editMode = false;
    } else {
      // Marcar campos como tocados para mostrar errores
      console.log('Formulario inválido, marcando campos como tocados');
      this.editForm.markAllAsTouched();
      
      // Mostrar errores específicos de cada campo
      Object.keys(this.editForm.controls).forEach(key => {
        const control = this.editForm.get(key);
        if (control && control.errors) {
          console.log(`Error en campo ${key}:`, control.errors);
        }
      });
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

  // Funciones auxiliares para adjuntos
  esImagen(adjunto: string | ArchivoAdjunto): boolean {
    if (typeof adjunto === 'string') {
      // Si es una URL, verificar si contiene extensiones de imagen
      return /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(adjunto) || 
             adjunto.startsWith('data:image/');
    }
    // Si es un objeto ArchivoAdjunto, verificar el tipo
    return adjunto.type ? adjunto.type.startsWith('image/') : false;
  }

  abrirAdjunto(adjunto: string | ArchivoAdjunto, index: number): void {
    console.log('DEBUG: abrirAdjunto called with:', adjunto);
    
    const url = typeof adjunto === 'string' ? adjunto : adjunto.data;
    console.log('DEBUG: URL extracted:', url);
    
    if (url) {
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      console.log('DEBUG: Link clicked with URL:', url);
    } else {
      console.log('DEBUG: No URL found, cannot open adjunto');
    }
  }

  obtenerIconoAdjunto(adjunto: string | ArchivoAdjunto): string {
    if (typeof adjunto === 'string') {
      // Para URLs, inferir tipo por extensión
      if (/\.(pdf)$/i.test(adjunto)) return '📄';
      if (/\.(doc|docx)$/i.test(adjunto)) return '📝';
      if (/\.(xls|xlsx|csv)$/i.test(adjunto)) return '📊';
      if (/\.(ppt|pptx)$/i.test(adjunto)) return '📈';
      if (/\.(txt|md)$/i.test(adjunto)) return '📄';
      if (/\.(zip|rar|7z)$/i.test(adjunto)) return '📦';
      return '📎';
    }
    
    const tipo = adjunto.type || '';
    if (tipo.includes('pdf')) return '📄';
    if (tipo.includes('word') || tipo.includes('document')) return '📝';
    if (tipo.includes('excel') || tipo.includes('spreadsheet')) return '📊';
    if (tipo.includes('powerpoint') || tipo.includes('presentation')) return '📈';
    if (tipo.includes('text')) return '📄';
    if (tipo.includes('zip') || tipo.includes('compressed')) return '📦';
    return '📎';
  }

  obtenerIconoDocumento(adjunto: string | ArchivoAdjunto): string {
    if (typeof adjunto === 'string') {
      // Para URLs, inferir tipo por extensión
      if (/\.(pdf)$/i.test(adjunto)) return 'PDF';
      if (/\.(doc|docx)$/i.test(adjunto)) return 'DOC';
      if (/\.(xls|xlsx|csv)$/i.test(adjunto)) return 'XLS';
      if (/\.(ppt|pptx)$/i.test(adjunto)) return 'PPT';
      if (/\.(txt|md)$/i.test(adjunto)) return 'TXT';
      if (/\.(zip|rar|7z)$/i.test(adjunto)) return 'ZIP';
      return 'FILE';
    }
    
    const tipo = adjunto.type || '';
    if (tipo.includes('pdf')) return 'PDF';
    if (tipo.includes('word') || tipo.includes('document')) return 'DOC';
    if (tipo.includes('excel') || tipo.includes('spreadsheet')) return 'XLS';
    if (tipo.includes('powerpoint') || tipo.includes('presentation')) return 'PPT';
    if (tipo.includes('text')) return 'TXT';
    if (tipo.includes('zip') || tipo.includes('compressed')) return 'ZIP';
    return 'FILE';
  }

  obtenerColorDocumento(adjunto: string | ArchivoAdjunto): string {
    if (typeof adjunto === 'string') {
      if (/\.(pdf)$/i.test(adjunto)) return '#e74c3c';
      if (/\.(doc|docx)$/i.test(adjunto)) return '#2980b9';
      if (/\.(xls|xlsx|csv)$/i.test(adjunto)) return '#27ae60';
      if (/\.(ppt|pptx)$/i.test(adjunto)) return '#e67e22';
      if (/\.(txt|md)$/i.test(adjunto)) return '#95a5a6';
      if (/\.(zip|rar|7z)$/i.test(adjunto)) return '#9b59b6';
      return '#34495e';
    }
    
    const tipo = adjunto.type || '';
    if (tipo.includes('pdf')) return '#e74c3c';
    if (tipo.includes('word') || tipo.includes('document')) return '#2980b9';
    if (tipo.includes('excel') || tipo.includes('spreadsheet')) return '#27ae60';
    if (tipo.includes('powerpoint') || tipo.includes('presentation')) return '#e67e22';
    if (tipo.includes('text')) return '#95a5a6';
    if (tipo.includes('zip') || tipo.includes('compressed')) return '#9b59b6';
    return '#34495e';
  }

  obtenerTipoAdjunto(adjunto: string | ArchivoAdjunto): string {
    if (typeof adjunto === 'string') {
      // Para URLs, inferir tipo por extensión
      if (/\.(pdf)$/i.test(adjunto)) return 'PDF';
      if (/\.(doc|docx)$/i.test(adjunto)) return 'Word';
      if (/\.(xls|xlsx|csv)$/i.test(adjunto)) return 'Excel';
      if (/\.(ppt|pptx)$/i.test(adjunto)) return 'PowerPoint';
      if (/\.(txt|md)$/i.test(adjunto)) return 'Texto';
      if (/\.(zip|rar|7z)$/i.test(adjunto)) return 'Archivo';
      if (this.esImagen(adjunto)) return 'Imagen';
      return 'Archivo';
    }
    
    const tipo = adjunto.type || '';
    if (tipo.includes('pdf')) return 'PDF';
    if (tipo.includes('word') || tipo.includes('document')) return 'Word';
    if (tipo.includes('excel') || tipo.includes('spreadsheet')) return 'Excel';
    if (tipo.includes('powerpoint') || tipo.includes('presentation')) return 'PowerPoint';
    if (tipo.includes('text')) return 'Texto';
    if (tipo.includes('image')) return 'Imagen';
    return 'Archivo';
  }

  obtenerNombreAdjunto(adjunto: string | ArchivoAdjunto, index: number): string {
    console.log('DEBUG: obtenerNombreAdjunto - adjunto:', adjunto);
    
    if (typeof adjunto === 'string') {
      // Si es una URL, extraer el nombre del archivo de la URL
      try {
        const url = new URL(adjunto);
        const pathname = url.pathname;
        const filename = pathname.split('/').pop();
        const result = filename && filename.length > 0 ? filename : `Adjunto ${index + 1}`;
        console.log('DEBUG: String URL, filename extracted:', result);
        return result;
      } catch {
        // Si no es una URL válida, asumir que es un nombre de archivo
        const result = adjunto || `Adjunto ${index + 1}`;
        console.log('DEBUG: String not URL, using as filename:', result);
        return result;
      }
    }
    
    // Para objetos ArchivoAdjunto
    const result = adjunto.name || `Adjunto ${index + 1}`;
    console.log('DEBUG: Object adjunto, name:', result);
    return result;
  }

  // Getters para FormArrays
  get ubicacionesFormArray(): FormArray {
    return this.editForm.get('ubicaciones') as FormArray;
  }

  get ponentesFormArray(): FormArray {
    return this.editForm.get('ponentes') as FormArray;
  }

  get serviciosFormArray(): FormArray {
    return this.editForm.get('servicios') as FormArray;
  }

  get enlacesFormArray(): FormArray {
    return this.editForm.get('enlaces') as FormArray;
  }

  // Métodos de inicialización para FormArrays
  private initUbicaciones(): void {
    const ubicacionesArray = this.editForm.get('ubicaciones') as FormArray;
    
    if (this.evento.ubicaciones && this.evento.ubicaciones.length > 0) {
      this.evento.ubicaciones.forEach(ubicacion => {
        // Determinar el tipo de horario correctamente
        let tipoHorario = 'hora';
        if (ubicacion.tipoHorario) {
          tipoHorario = ubicacion.tipoHorario;
        } else if (ubicacion.horaFin && ubicacion.horaFin.trim() !== '' && ubicacion.horaFin !== '00:00' && ubicacion.horaFin !== '23:59') {
          tipoHorario = 'horario';
        }
        
        ubicacionesArray.push(this.fb.group({
          fecha: [this.formatDateForInput(ubicacion.fecha), Validators.required],
          tipoHorario: [tipoHorario],
          horaInicio: [ubicacion.horaInicio || '', Validators.required],
          horaFin: [tipoHorario === 'horario' ? (ubicacion.horaFin || '') : ''],
          lugar: [ubicacion.lugar || '', Validators.required]
        }));
      });
    } else {
      // Crear una ubicación por defecto con datos legacy si existen
      const fechaDefault = this.evento.fecha ? this.formatDateForInput(this.evento.fecha) : '';
      const horaDefault = this.evento.horaInicio || '';
      const horaFinDefault = this.evento.horaFin || '';
      const lugarDefault = this.evento.lugar || '';
      
      ubicacionesArray.push(this.fb.group({
        fecha: [fechaDefault, Validators.required],
        tipoHorario: [horaFinDefault && horaFinDefault.trim() !== '' ? 'horario' : 'hora'],
        horaInicio: [horaDefault, Validators.required],
        horaFin: [horaFinDefault],
        lugar: [lugarDefault, Validators.required]
      }));
    }
  }

  private initPonentes(): void {
    const ponentesArray = this.editForm.get('ponentes') as FormArray;
    
    if (this.evento.ponentes && this.evento.ponentes.length > 0) {
      this.evento.ponentes.forEach(ponente => {
        ponentesArray.push(this.fb.group({
          nombre: [ponente.nombre || '', Validators.required],
          afiliacion: [ponente.afiliacion || '']
        }));
      });
    }
    // Si no hay ponentes, el usuario puede agregar con el botón +
  }

  private initServicios(): void {
    const serviciosArray = this.editForm.get('servicios') as FormArray;
    
    if (this.evento.servicios && this.evento.servicios.length > 0) {
      this.evento.servicios.forEach(servicio => {
        serviciosArray.push(this.fb.group({
          servicios: [servicio.servicios || '', Validators.required],
          grado: [servicio.grado || '']
        }));
      });
    }
    // Si no hay servicios, el usuario puede agregar con el botón +
  }

  private initEnlaces(): void {
    const enlacesArray = this.editForm.get('enlaces') as FormArray;
    
    if (this.evento.enlaces && this.evento.enlaces.length > 0) {
      this.evento.enlaces.forEach(enlace => {
        enlacesArray.push(this.fb.group({
          tipo: [enlace.tipo || '', Validators.required],
          url: [enlace.url || '', Validators.required]
        }));
      });
    }
    // Si no hay enlaces, el usuario puede agregar con el botón +
  }

  // Métodos para agregar elementos
  agregarUbicacion(): void {
    const ubicacionesArray = this.editForm.get('ubicaciones') as FormArray;
    ubicacionesArray.push(this.fb.group({
      fecha: ['', Validators.required],
      tipoHorario: ['hora'],
      horaInicio: ['', Validators.required],
      horaFin: [''],
      lugar: ['', Validators.required]
    }));
  }

  agregarPonente(): void {
    const ponentesArray = this.editForm.get('ponentes') as FormArray;
    ponentesArray.push(this.fb.group({
      nombre: ['', Validators.required],
      afiliacion: ['']
    }));
  }

  agregarServicio(): void {
    const serviciosArray = this.editForm.get('servicios') as FormArray;
    serviciosArray.push(this.fb.group({
      servicios: [''],
      grado: ['']
    }));
  }

  agregarEnlace(): void {
    const enlacesArray = this.editForm.get('enlaces') as FormArray;
    enlacesArray.push(this.fb.group({
      tipo: ['', Validators.required],
      url: ['', Validators.required]
    }));
  }

  // Métodos para eliminar elementos
  eliminarUbicacion(index: number): void {
    const ubicacionesArray = this.editForm.get('ubicaciones') as FormArray;
    if (ubicacionesArray.length > 1) {
      ubicacionesArray.removeAt(index);
    }
  }

  eliminarPonente(index: number): void {
    const ponentesArray = this.editForm.get('ponentes') as FormArray;
    ponentesArray.removeAt(index);
  }

  eliminarServicio(index: number): void {
    const serviciosArray = this.editForm.get('servicios') as FormArray;
    serviciosArray.removeAt(index);
  }

  eliminarEnlace(index: number): void {
    const enlacesArray = this.editForm.get('enlaces') as FormArray;
    enlacesArray.removeAt(index);
  }

  // Métodos para adjuntos
  agregarAdjunto(): void {
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.click();
    }
  }

  onFileSelected(event: any): void {
    const files = event.target.files;
    if (files && files.length > 0) {
      for (let i = 0; i < files.length; i++) {
        const file = files[i] as File;
        const reader = new FileReader();
        reader.onload = (e) => {
          const resultado = e.target?.result as string;
          if (resultado) {
            const nuevoAdjunto: ArchivoAdjunto = {
              name: file.name,
              type: file.type,
              size: file.size,
              data: resultado
            };
            
            if (!this.evento.adjuntos) {
              this.evento.adjuntos = [];
            }
            this.evento.adjuntos.push(nuevoAdjunto);
            
            // En modo edición, los cambios se emitirán al guardar
            // Si no estamos en modo edición, emitir inmediatamente
            if (!this.editMode) {
              this.actualizar.emit({
                _id: this.evento._id,
                adjuntos: this.evento.adjuntos
              });
            }
          }
        };
        reader.readAsDataURL(file);
      }
    }
    // Limpiar el input
    event.target.value = '';
  }

  eliminarAdjunto(index: number): void {
    if (this.evento.adjuntos && index >= 0 && index < this.evento.adjuntos.length) {
      this.evento.adjuntos.splice(index, 1);
      
      // En modo edición, los cambios se emitirán al guardar
      // Si no estamos en modo edición, emitir inmediatamente
      if (!this.editMode) {
        this.actualizar.emit({
          _id: this.evento._id,
          adjuntos: this.evento.adjuntos
        });
      }
    }
  }

  // Utilidad para formatear fecha para input
  private formatDateForInput(fecha: any): string {
    if (!fecha) return '';
    const date = new Date(fecha);
    return date.toISOString().substring(0, 10);
  }

  // Método para traducir nombres de lugares
  traducirLugar(lugar: string): string {
    const traduccionesLugares: { [key: string]: string } = {
      'FACULTY': 'Facultad',
      'AULA_MAGNA': 'Aula de grado',
      'HUBdeInnovacion': 'HUB de Innovación',
      'LIBRARY': 'Biblioteca',
      'AuditorioJuanPablo': 'Auditorio Juan Pablo II',
      'S-41': 'S-41',
      'ONLINE': 'Online'
    };
    
    return traduccionesLugares[lugar] || lugar;
  }

  // Método para traducir servicios
  traducirServicio(servicio: string): string {
    // Mapeo directo de servicios a claves de traducción
    const serviciosMap: { [key: string]: string } = {
      'SERVICES.DEPORTES': 'SERVICES.DEPORTES',
      'SERVICES.CORO': 'SERVICES.CORO',
      'SERVICES.GESTION_INVESTIGACION': 'SERVICES.GESTION_INVESTIGACION',
      'SERVICES.UNIDAD_EMPLEABILIDAD': 'SERVICES.UNIDAD_EMPLEABILIDAD',
      'SERVICES.MOVILIDAD_INTERNACIONAL': 'SERVICES.MOVILIDAD_INTERNACIONAL',
      'SERVICES.CAPELLANIA': 'SERVICES.CAPELLANIA',
      'SERVICES.ASISTENCIA_PSICOLOGICA': 'SERVICES.ASISTENCIA_PSICOLOGICA',
      'SERVICES.CULTURA_CIENTIFICA': 'SERVICES.CULTURA_CIENTIFICA',
      'SERVICES.UNIDAD_IGUALDAD': 'SERVICES.UNIDAD_IGUALDAD',
      'SERVICES.VOLUNTARIADO': 'SERVICES.VOLUNTARIADO',
      
      // Mapeo para servicios que podrían estar guardados en texto plano
      'Deportes': 'SERVICES.DEPORTES',
      'Coro': 'SERVICES.CORO',
      'Gestión de la Investigación y Transferencia': 'SERVICES.GESTION_INVESTIGACION',
      'Unidad de Empleabilidad y Prácticas': 'SERVICES.UNIDAD_EMPLEABILIDAD',
      'Movilidad Internacional': 'SERVICES.MOVILIDAD_INTERNACIONAL',
      'Capellanía': 'SERVICES.CAPELLANIA',
      'Asistencia Psicológica': 'SERVICES.ASISTENCIA_PSICOLOGICA',
      'Cultura Científica': 'SERVICES.CULTURA_CIENTIFICA',
      'Unidad de Igualdad': 'SERVICES.UNIDAD_IGUALDAD',
      'Voluntariado': 'SERVICES.VOLUNTARIADO',
      
      // Mapeo para vicerrectorados
      'VICERRECTORADOS.InvestigacionTransferencia': 'VICERRECTORADOS.InvestigacionTransferencia',
      'VICERRECTORADOS.OrdenacionAcademica': 'VICERRECTORADOS.OrdenacionAcademica',
      'VICERRECTORADOS.FormacionPermanente': 'VICERRECTORADOS.FormacionPermanente',
      'VICERRECTORADOS.ComunidadUniversitaria': 'VICERRECTORADOS.ComunidadUniversitaria',
      'VICERRECTORADOS.InternacionalesCooperacion': 'VICERRECTORADOS.InternacionalesCooperacion',
      
      // Mapeo para vicerrectorados que podrían estar guardados en texto plano
      'Vicerrectorado de Investigación y Transferencia': 'VICERRECTORADOS.InvestigacionTransferencia',
      'Vicerrectorado de Ordenación Académica': 'VICERRECTORADOS.OrdenacionAcademica',
      'Vicerrectorado de Formación Permanente': 'VICERRECTORADOS.FormacionPermanente',
      'Vicerrectorado de Comunidad Universitaria': 'VICERRECTORADOS.ComunidadUniversitaria',
      'Vicerrectorado de Internacionales y Cooperación': 'VICERRECTORADOS.InternacionalesCooperacion'
    };
    
    // Si es una facultad, devolverla tal como está (sin traducir)
    if (this.esFacultad(servicio)) {
      return servicio;
    }
    
    return serviciosMap[servicio] || servicio;
  }

  // Métodos para manejar facultades y grados
  esFacultad(servicio: string): boolean {
    return this.facultadesGrados.some(f => f.facultad === servicio);
  }

  obtenerGrados(facultad: string): string[] {
    const facultadEncontrada = this.facultadesGrados.find(f => f.facultad === facultad);
    return facultadEncontrada ? facultadEncontrada.grados : [];
  }

  onServicioChange(index: number, event: any): void {
    const servicioSeleccionado = event.target.value;
    const servicioControl = this.serviciosFormArray.at(index);
    
    // Limpiar el grado si no es una facultad
    if (!this.esFacultad(servicioSeleccionado)) {
      servicioControl.get('grado')?.setValue('');
    }
  }

  // Método para manejar cambio de tipo de horario
  onTipoHorarioChange(ubicacionIndex: number, event: any): void {
    const tipoHorario = event.target.value;
    const ubicacionControl = this.ubicacionesFormArray.at(ubicacionIndex);
    
    // Si se cambia a "hora específica", limpiar la hora fin
    if (tipoHorario === 'hora') {
      ubicacionControl.get('horaFin')?.setValue('');
    }
  }

  // Método para obtener opciones de lugar con lugares personalizados
  obtenerOpcionesLugar(): Array<{key: string, value: string}> {
    const opcionesBase = [
      { key: 'FACULTY', value: 'Facultad' },
      { key: 'AULA_MAGNA', value: 'Aula de grado' },
      { key: 'HUBdeInnovacion', value: 'HUB de Innovación' },
      { key: 'LIBRARY', value: 'Biblioteca' },
      { key: 'AuditorioJuanPablo', value: 'Auditorio Juan Pablo II' },
      { key: 'S-41', value: 'S-41' },
      { key: 'ONLINE', value: 'Online' }
    ];

    // Agregar lugares del servicio sincronizado
    this.lugaresDisponibles.forEach(lugar => {
      if (!opcionesBase.some(opcion => opcion.key === lugar)) {
        opcionesBase.push({ key: lugar, value: lugar });
      }
    });

    return opcionesBase;
  }

  // Método para verificar si un departamento está en las opciones disponibles
  departamentoExiste(departamento: string): boolean {
    return this.departamentosDisponibles.includes(departamento);
  }

  // Método para obtener el departamento válido o vacío si no existe
  obtenerDepartamentoValido(departamento: string): string {
    return this.departamentoExiste(departamento) ? departamento : '';
  }

  // Sistema de selección de carátula
  seleccionarCaratula(adjunto: string | ArchivoAdjunto, event: Event): void {
    event.stopPropagation(); // Evitar que se abra el adjunto
    
    const adjuntoData = typeof adjunto === 'string' ? adjunto : adjunto.data;
    
    // Actualizar la imagen del evento localmente
    this.evento.imagen = adjuntoData;
    
    // En modo edición, los cambios se emitirán al guardar
    // Si no estamos en modo edición, emitir inmediatamente (para casos especiales)
    if (!this.editMode) {
      this.actualizar.emit({ 
        _id: this.evento._id, 
        imagen: adjuntoData 
      });
    }
  }

  esCaratulaSeleccionada(adjunto: string | ArchivoAdjunto): boolean {
    const adjuntoData = typeof adjunto === 'string' ? adjunto : adjunto.data;
    return this.evento.imagen === adjuntoData;
  }
}