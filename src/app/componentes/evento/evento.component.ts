import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Evento, ArchivoAdjunto } from '../../interfaces/evento.interface';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { IdiomaService } from '../../servicios/idioma.service';
import { FormBuilder, FormGroup, FormArray, Validators } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { OpcionesSincronizadasService } from '../../servicios/opciones-sincronizadas.service';
import { AuthService } from '../../servicios/auth.service';

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
      "grados":[
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
      "facultad":"Facultad de Comunicación",
      "grados": [
          "Grado en Periodismo",
          "Grado en Comunicación Audiovisual"
      ]
    },
    {
      "facultad":"Facultad de Derecho Canónico", 
      "grados":[
          "Doctorado Eclesiástico en Derecho Canónico",
          "Licenciatura en Derecho Canónico"
      ]
    },
    {
      "facultad":"Facultad de Educación",
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
      "facultad":"Facultad de Enfermería y Fisioterapia Salus Infirmorum", 
      "grados":[
          "Grado en Fisioterapia (Madrid)",
          "Grado en Enfermería (Madrid)"
      ]
    },
    {
      "facultad":"Facultad de Informática",
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
      "facultad":"Facultad de Psicología",
      "grados": [
          "Grado en Psicología",
          "Máster Universitario en Psicología General Sanitaria",
          "Diploma de Experto en Invtervención Psicosocial"
      ]
    },
    {
      "facultad":"Facultad de Teología",
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

  // Mapeo para traducir lugares guardados en la BD (claves) a nombres legibles
  private lugaresTraduccion: { [key: string]: string } = {
    'FACULTAD': 'Facultad',
    'FACULTY': 'Facultad', // Retrocompatibilidad
    'AULA_MAGNA': 'Aula de grado',
    'HUB_INNOVACION': 'HUB de Innovación',
    'HUBdeInnovacion': 'HUB de Innovación', // Retrocompatibilidad
    'BIBLIOTECA': 'Biblioteca',
    'LIBRARY': 'Biblioteca', // Retrocompatibilidad
    'AUDITORIO_JUAN_PABLO': 'Auditorio Juan Pablo II',
    'AuditorioJuanPablo': 'Auditorio Juan Pablo II', // Retrocompatibilidad
    'S-41': 'S-41',
    'ONLINE': 'Online'
  };

  constructor(
    private idiomaService: IdiomaService,
    private fb: FormBuilder,
    private opcionesSincronizadasService: OpcionesSincronizadasService,
    private translateService: TranslateService,
    private authService: AuthService
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
    this.caratulaOriginal = this.evento.imagen;
    this.adjuntosOriginales = this.evento.adjuntos ? [...this.evento.adjuntos] : [];
    this.editMode = true;
    
    this.editForm = this.fb.group({
      tipoEvento: [this.evento.tipoEvento || '', Validators.required],
      titulo: [this.evento.titulo, Validators.required],
      departamento: [this.normalizarDepartamento(this.evento.departamento || this.evento.empresaOrganizadora || ''), Validators.required],
      descripcion: [this.evento.descripcion || ''],
      actividad: [this.normalizarActividad(this.evento.actividad || ''), ''],
      ubicaciones: this.fb.array([]),
      ponentes: this.fb.array([]),
      servicios: this.fb.array([]),
      enlaces: this.fb.array([])
    });

    this.initUbicaciones();
    this.initPonentes();
    this.initServicios();
    this.initEnlaces();
  }

  cancelarEdicion(event: Event) {
    event.stopPropagation();
    if (this.caratulaOriginal !== undefined) {
      this.evento.imagen = this.caratulaOriginal;
    }
    if (this.adjuntosOriginales.length > 0 || this.evento.adjuntos?.length !== this.adjuntosOriginales.length) {
      this.evento.adjuntos = [...this.adjuntosOriginales];
    }
    this.editMode = false;
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

  // Getter para construir correctamente la URL de la imagen de portada
  get imagenPortadaUrl(): string | null {
    if (!this.evento?.imagen) {
      return null;
    }

    // Si ya es una data URL completa, usarla directamente
    if (this.evento.imagen.startsWith('data:')) {
      return this.evento.imagen;
    }

    // Si es base64 puro, construir la data URL
    if (this.evento.imagen.length > 100) { // Asumimos que strings largos son base64
      return `data:image/jpeg;base64,${this.evento.imagen}`;
    }

    // Si es una URL normal, usarla directamente
    return this.evento.imagen;
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
      // Verificar si es horario basándose en múltiples condiciones
      const esHorario = ubicacion.tipoHorario === 'horario' || 
                       (ubicacion.horaFin && 
                        ubicacion.horaFin.trim() !== '' && 
                        ubicacion.horaFin !== '00:00' && 
                        ubicacion.horaFin !== '23:59' &&
                        ubicacion.horaFin !== ubicacion.horaInicio);
      
      if (esHorario) {
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
      
      // Verificar si es horario basándose en múltiples condiciones
      const esHorario = ubicacion.tipoHorario === 'horario' || 
                       (ubicacion.horaFin && 
                        ubicacion.horaFin.trim() !== '' && 
                        ubicacion.horaFin !== '00:00' && 
                        ubicacion.horaFin !== '23:59' &&
                        ubicacion.horaFin !== ubicacion.horaInicio);
      
      if (esHorario) {
        return `${ubicacion.horaInicio} - ${ubicacion.horaFin}`;
      }
      return ubicacion.horaInicio || '';
    }
    // Retrocompatibilidad
    if (this.evento?.horaFin && 
        this.evento.horaFin.trim() !== '' && 
        this.evento.horaFin !== '00:00' && 
        this.evento.horaFin !== '23:59' &&
        this.evento.horaFin !== this.evento.horaInicio) {
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
    

    console.log('📄 Evento antes de editar:', {
      id: this.evento._id,
      titulo: this.evento.titulo,
      creadoPor: this.evento.creadoPor,
      modificadoPor: this.evento.modificadoPor
    });
    
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
      
      // Actualizar ponentes - solo incluir los que tienen nombre
      this.evento.ponentes = formValue.ponentes
        .filter((p: any) => p.nombre && p.nombre.trim() !== '')
        .map((ponente: any, index: number) => ({
          id: index + 1,
          nombre: ponente.nombre.trim(),
          afiliacion: ponente.afiliacion && ponente.afiliacion.trim() ? ponente.afiliacion.trim() : undefined
        }));
      
      // Actualizar servicios - solo incluir los que tienen servicio seleccionado
      this.evento.servicios = formValue.servicios
        .filter((s: any) => s.servicios && s.servicios.trim() !== '')
        .map((servicio: any) => ({
          servicios: servicio.servicios.trim(),
          grado: servicio.grado && servicio.grado.trim() ? servicio.grado.trim() : undefined
        }));
      
      // Actualizar enlaces - solo incluir los que tienen URL válida
      this.evento.enlaces = formValue.enlaces
        .filter((e: any) => e.url && e.url.trim() !== '')
        .map((enlace: any) => ({
          tipo: enlace.tipo || 'Otro',
          url: enlace.url.trim()
        }));
      
      // Agregar el usuario modificador automáticamente
      const usuarioActual = this.authService.getUsuarioActual();
      const datosActualizacion: any = {
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
        imagen: this.evento.imagen,
        adjuntos: this.evento.adjuntos
      };
      
      // Añadir modificadoPor si hay usuario autenticado
      if (usuarioActual) {
        datosActualizacion.modificadoPor = usuarioActual.email;

      }
      
      // Emitir los cambios al componente padre
      this.actualizar.emit(datosActualizacion);
      
      // Actualizar campos directos en el evento local
      this.evento.tipoEvento = formValue.tipoEvento;
      this.evento.titulo = formValue.titulo;
      this.evento.departamento = formValue.departamento;
      this.evento.descripcion = formValue.descripcion;
      this.evento.actividad = formValue.actividad;
      
      // Actualizar también el campo modificadoPor localmente
      if (usuarioActual) {
        this.evento.modificadoPor = usuarioActual.email;

      }
      
      console.log('✅ Evento después de editar:', {
        id: this.evento._id,
        titulo: this.evento.titulo,
        creadoPor: this.evento.creadoPor,
        modificadoPor: this.evento.modificadoPor
      });
      
      this.editMode = false;
    } else {
      // Marcar campos como tocados para mostrar errores
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



  // Funciones auxiliares para adjuntos
  esImagen(adjunto: string | ArchivoAdjunto): boolean {
    if (typeof adjunto === 'string') {
      // Para strings muy largos, verificar solo si es data URL de imagen
      if (adjunto.length > 50000) {
        return adjunto.startsWith('data:image/');
      }
      
      // Si es una URL, verificar si contiene extensiones de imagen
      return /\.(jpg|jpeg|png|gif|bmp|webp|svg)$/i.test(adjunto) || 
             adjunto.startsWith('data:image/');
    }
    
    // Si es un objeto ArchivoAdjunto, verificar el tipo
    if (adjunto && typeof adjunto === 'object') {
      return adjunto.type ? adjunto.type.startsWith('image/') : false;
    }
    
    return false;
  }

  // Método para construir correctamente la URL de un adjunto
  construirUrlAdjunto(adjunto: string | ArchivoAdjunto): string | null {
    if (typeof adjunto === 'string') {
      // Si ya es una data URL completa, usarla directamente
      if (adjunto.startsWith('data:')) {
        return adjunto;
      }

      // Si es base64 puro, construir la data URL
      if (adjunto.length > 100) { // Asumimos que strings largos son base64
        // Detectar el tipo de imagen basado en la cabecera del base64
        const imgType = this.detectarTipoImagen(adjunto);
        return `data:${imgType};base64,${adjunto}`;
      }

      // Si es una URL normal, usarla directamente
      return adjunto;
    }

    // Si es un objeto ArchivoAdjunto
    if (adjunto && typeof adjunto === 'object' && adjunto.data) {
      // Si ya es una data URL completa, usarla directamente
      if (adjunto.data.startsWith('data:')) {
        return adjunto.data;
      }

      // Si es base64 puro, construir la data URL usando el tipo del objeto
      const mimeType = adjunto.type || 'application/octet-stream';
      return `data:${mimeType};base64,${adjunto.data}`;
    }

    return null;
  }

  // Método auxiliar para detectar el tipo de imagen desde base64
  private detectarTipoImagen(base64: string): string {
    // Tomar los primeros caracteres para detectar la signature
    const signature = base64.substring(0, 10);
    
    if (signature.startsWith('/9j/')) return 'image/jpeg';
    if (signature.startsWith('iVBORw')) return 'image/png';
    if (signature.startsWith('R0lGOD')) return 'image/gif';
    if (signature.startsWith('UklGR')) return 'image/webp';
    
    // Por defecto, asumir JPEG
    return 'image/jpeg';
  }

  // Método auxiliar para inferir MIME type por extensión
  private inferirMimeType(filename: string): string {
    if (/\.(pdf)$/i.test(filename)) return 'application/pdf';
    if (/\.(jpg|jpeg)$/i.test(filename)) return 'image/jpeg';
    if (/\.(png)$/i.test(filename)) return 'image/png';
    if (/\.(gif)$/i.test(filename)) return 'image/gif';
    if (/\.(webp)$/i.test(filename)) return 'image/webp';
    if (/\.(doc)$/i.test(filename)) return 'application/msword';
    if (/\.(docx)$/i.test(filename)) return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    if (/\.(xls)$/i.test(filename)) return 'application/vnd.ms-excel';
    if (/\.(xlsx)$/i.test(filename)) return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
    if (/\.(txt)$/i.test(filename)) return 'text/plain';
    
    return 'application/octet-stream';
  }

  abrirAdjunto(adjunto: string | ArchivoAdjunto, index: number): void {
    let filename: string = '';
    let mimeType: string = '';
    let dataUrl: string = '';
    
    // Extraer metadatos del adjunto
    if (typeof adjunto === 'string') {
      filename = this.obtenerNombreAdjunto(adjunto, index);
      dataUrl = adjunto.startsWith('data:') ? adjunto : `data:application/octet-stream;base64,${adjunto}`;
      
      if (adjunto.startsWith('data:')) {
        const mimeMatch = adjunto.match(/data:([^;]+);/);
        mimeType = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
      } else {
        mimeType = this.inferirMimeType(filename);
        dataUrl = `data:${mimeType};base64,${adjunto}`;
      }
    } else if (adjunto && typeof adjunto === 'object') {
      filename = adjunto.name || this.obtenerNombreAdjunto(adjunto, index);
      mimeType = adjunto.type || 'application/octet-stream';
      dataUrl = adjunto.data.startsWith('data:') ? adjunto.data : `data:${mimeType};base64,${adjunto.data}`;
    }
    
    if (dataUrl) {
      // Método simplificado: abrir directamente
      this.abrirArchivoDirectamente(dataUrl, filename, mimeType);
    }
  }

  // Método simplificado para abrir archivos directamente
  private abrirArchivoDirectamente(dataUrl: string, filename: string, mimeType: string): void {
    try {
      // Crear blob con nombre correcto
      const byteCharacters = atob(dataUrl.split(',')[1]);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: mimeType });
      
      // Crear URL del blob
      const blobUrl = URL.createObjectURL(blob);
      
      // Crear un elemento <a> temporal para simular descarga pero sin descarga real
      const link = document.createElement('a');
      link.href = blobUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      
      // Para navegadores que soportan, asignar el nombre del archivo
      // pero sin activar descarga
      if (mimeType.startsWith('image/') || mimeType.includes('pdf')) {
        // Para imágenes y PDFs, abrir directamente sin nombre de descarga
        link.click();
      } else {
        // Para otros archivos, intentar que se abra en el navegador
        link.click();
      }
      
      // Limpiar después de un breve tiempo
      setTimeout(() => {
        URL.revokeObjectURL(blobUrl);
        if (link.parentNode) {
          link.parentNode.removeChild(link);
        }
      }, 5000);
      
    } catch (error) {
      console.error('Error al abrir archivo:', error);
      // Fallback: usar la data URL directamente
      const newWindow = window.open();
      if (newWindow) {
        newWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>${filename}</title>
            <style>
              body { margin: 0; padding: 20px; font-family: Arial, sans-serif; }
              img { max-width: 100%; height: auto; }
              iframe { width: 100%; height: 100vh; border: none; }
              .container { text-align: center; }
            </style>
          </head>
          <body>
            <div class="container">
              <h3>${filename}</h3>
              ${mimeType.startsWith('image/') 
                ? `<img src="${dataUrl}" alt="${filename}" />` 
                : mimeType.includes('pdf')
                  ? `<iframe src="${dataUrl}"></iframe>`
                  : `<p>Archivo: ${filename}</p><a href="${dataUrl}" download="${filename}">Descargar</a>`
              }
            </div>
          </body>
          </html>
        `);
        newWindow.document.close();
      }
    }
  }

  private descargarAdjunto(adjunto: string | ArchivoAdjunto, filename: string): void {
    try {
      const url = typeof adjunto === 'string' ? adjunto : adjunto.data;
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error('ERROR: No se pudo descargar el adjunto:', error);
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



  obtenerNombreAdjunto(adjunto: string | ArchivoAdjunto, index: number): string {
    // PRIORIDAD 1: Si es un objeto ArchivoAdjunto válido, usar su nombre real
    if (adjunto && typeof adjunto === 'object' && adjunto.name) {
      return adjunto.name;
    }
    
    if (typeof adjunto === 'string') {
      // Para strings muy largos, probablemente es base64
      if (adjunto.length > 500) {
        // Si empieza con data:, extraer tipo MIME para generar nombre apropiado
        if (adjunto.startsWith('data:')) {
          const mimeMatch = adjunto.match(/data:([^;]+);/);
          if (mimeMatch) {
            const mimeType = mimeMatch[1];
            if (mimeType.startsWith('image/')) {
              const ext = mimeType.split('/')[1] || 'jpg';
              return `Imagen_${index + 1}.${ext}`;
            } else if (mimeType.includes('pdf')) {
              return `Documento_${index + 1}.pdf`;
            } else if (mimeType.includes('word')) {
              return `Documento_${index + 1}.docx`;
            } else if (mimeType.includes('excel')) {
              return `Documento_${index + 1}.xlsx`;
            }
          }
        }
        
        // Para cualquier string largo sin info de tipo, usar nombre genérico
        return `Adjunto_${index + 1}`;
      }
      
      // Si es una URL, extraer el nombre del archivo de la URL
      try {
        const url = new URL(adjunto);
        const pathname = url.pathname;
        const filename = pathname.split('/').pop();
        return filename && filename.length > 0 ? filename : `Adjunto_${index + 1}`;
      } catch {
        // Si no es una URL válida y es corto, puede ser un nombre de archivo válido
        const cleanString = adjunto.trim();
        if (cleanString && cleanString.length > 0 && cleanString.length < 100) {
          return cleanString;
        }
        
        return `Adjunto_${index + 1}`;
      }
    }
    
    // Fallback final
    return `Adjunto_${index + 1}`;
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
        
        // Si ya tiene tipoHorario definido, usar ese
        if (ubicacion.tipoHorario) {
          tipoHorario = ubicacion.tipoHorario;
        } else {
          // Si no tiene tipoHorario, inferir basado en la presencia de horaFin válida
          if (ubicacion.horaFin && 
              ubicacion.horaFin.trim() !== '' && 
              ubicacion.horaFin !== '00:00' && 
              ubicacion.horaFin !== '23:59' &&
              ubicacion.horaFin !== ubicacion.horaInicio) {
            tipoHorario = 'horario';
          }
        }
        
        ubicacionesArray.push(this.fb.group({
          fecha: [this.formatDateForInput(ubicacion.fecha), Validators.required],
          tipoHorario: [tipoHorario],
          horaInicio: [ubicacion.horaInicio || '', Validators.required],
          horaFin: [tipoHorario === 'horario' ? (ubicacion.horaFin || '') : ''],
          lugar: [this.normalizarLugar(ubicacion.lugar || ''), Validators.required]
        }));
      });
    } else {
      // Crear una ubicación por defecto con datos legacy si existen
      const fechaDefault = this.evento.fecha ? this.formatDateForInput(this.evento.fecha) : '';
      const horaDefault = this.evento.horaInicio || '';
      const horaFinDefault = this.evento.horaFin || '';
      const lugarDefault = this.evento.lugar || '';
      
      // Determinar tipo de horario para datos legacy
      let tipoHorarioDefault = 'hora';
      if (horaFinDefault && 
          horaFinDefault.trim() !== '' && 
          horaFinDefault !== '00:00' && 
          horaFinDefault !== '23:59' &&
          horaFinDefault !== horaDefault) {
        tipoHorarioDefault = 'horario';
      }
      
      ubicacionesArray.push(this.fb.group({
        fecha: [fechaDefault, Validators.required],
        tipoHorario: [tipoHorarioDefault],
        horaInicio: [horaDefault, Validators.required],
        horaFin: [tipoHorarioDefault === 'horario' ? horaFinDefault : ''],
        lugar: [this.normalizarLugar(lugarDefault), Validators.required]
      }));
    }
  }

  private initPonentes(): void {
    const ponentesArray = this.editForm.get('ponentes') as FormArray;
    
    // Solo agregar ponentes que tengan nombre válido
    if (this.evento.ponentes && this.evento.ponentes.length > 0) {
      this.evento.ponentes.forEach(ponente => {
        // Solo agregar si el ponente tiene nombre
        if (ponente.nombre && ponente.nombre.trim() !== '') {
          ponentesArray.push(this.fb.group({
            nombre: [ponente.nombre || '', Validators.required],
            afiliacion: [ponente.afiliacion || '']
          }));
        }
      });
    }
    // Si no hay ponentes válidos, dejar el array vacío para mostrar el mensaje
  }

  private initServicios(): void {
    const serviciosArray = this.editForm.get('servicios') as FormArray;
    
    // Solo agregar servicios que tengan servicio válido
    if (this.evento.servicios && this.evento.servicios.length > 0) {
      this.evento.servicios.forEach(servicio => {
        // Solo agregar si el servicio tiene servicios
        if (servicio.servicios && servicio.servicios.trim() !== '') {
          serviciosArray.push(this.fb.group({
            servicios: [servicio.servicios || '', Validators.required],
            grado: [servicio.grado || '']
          }));
        }
      });
    }
    // Si no hay servicios válidos, dejar el array vacío para mostrar el mensaje
  }

  private initEnlaces(): void {
    const enlacesArray = this.editForm.get('enlaces') as FormArray;
    
    // Solo agregar enlaces que tengan URL válida
    if (this.evento.enlaces && this.evento.enlaces.length > 0) {
      this.evento.enlaces.forEach(enlace => {
        // Solo agregar si el enlace tiene URL
        if (enlace.url && enlace.url.trim() !== '') {
          enlacesArray.push(this.fb.group({
            tipo: [enlace.tipo || '', Validators.required],
            url: [enlace.url || '', Validators.required]
          }));
        }
      });
    }
    // Si no hay enlaces válidos, dejar el array vacío para mostrar el mensaje
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
      const adjuntoAEliminar = this.evento.adjuntos[index];
      
      // Verificar si el adjunto que se va a eliminar es la carátula actual
      const esCaratulaActual = this.esCaratulaSeleccionada(adjuntoAEliminar);
      
      // Eliminar el adjunto
      this.evento.adjuntos.splice(index, 1);
      
      // Si el adjunto eliminado era la carátula, quitar la carátula
      if (esCaratulaActual) {
        this.evento.imagen = '';
      }
      
      // En modo edición, los cambios se emitirán al guardar
      // Si no estamos en modo edición, emitir inmediatamente
      if (!this.editMode) {
        const updateData: any = {
          _id: this.evento._id,
          adjuntos: this.evento.adjuntos
        };
        
        // Si se eliminó la carátula, incluir la actualización de imagen
        if (esCaratulaActual) {
          updateData.imagen = '';
        }
        
        this.actualizar.emit(updateData);
      }
    }
  }

  // Utilidad para formatear fecha para input
  private formatDateForInput(fecha: any): string {
    if (!fecha) return '';
    const date = new Date(fecha);
    return date.toISOString().substring(0, 10);
  }

  // Método para traducir nombres de lugares (de claves guardadas a nombres legibles)
  traducirLugar(lugar: string): string {
    return this.lugaresTraduccion[lugar] || lugar;
  }

  // Métodos para manejar facultades y grados
  esFacultad(servicio: string): boolean {
    return this.facultadesGrados.some(f => f.facultad === servicio);
  }

  obtenerGrados(facultad: string): string[] {
    const facultadEncontrada = this.facultadesGrados.find(f => f.facultad === facultad);
    return facultadEncontrada ? facultadEncontrada.grados : [];
  }

  // Método para obtener opciones de lugar
  obtenerOpcionesLugar(): Array<{key: string, value: string}> {
    // Usar directamente lugaresDisponibles que ya están traducidos
    return this.lugaresDisponibles.map(lugar => ({
      key: lugar,
      value: lugar
    }));
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

  // Método para traducir servicios (simplificado)
  traducirServicio(servicio: string): string {
    const serviciosBasicos: { [key: string]: string } = {
      'SERVICES.DEPORTES': 'SERVICES.DEPORTES',
      'SERVICES.CORO': 'SERVICES.CORO',
      'SERVICES.GESTION_INVESTIGACION': 'SERVICES.GESTION_INVESTIGACION',
      'SERVICES.UNIDAD_EMPLEABILIDAD': 'SERVICES.UNIDAD_EMPLEABILIDAD',
      'SERVICES.MOVILIDAD_INTERNACIONAL': 'SERVICES.MOVILIDAD_INTERNACIONAL',
      'SERVICES.CAPELLANIA': 'SERVICES.CAPELLANIA',
      'SERVICES.ASISTENCIA_PSICOLOGICA': 'SERVICES.ASISTENCIA_PSICOLOGICA',
      'SERVICES.CULTURA_CIENTIFICA': 'SERVICES.CULTURA_CIENTIFICA',
      'SERVICES.UNIDAD_IGUALDAD': 'SERVICES.UNIDAD_IGUALDAD',
      'SERVICES.VOLUNTARIADO': 'SERVICES.VOLUNTARIADO'
    };

    const vicerrectorados: { [key: string]: string } = {
      'InvestigacionTransferencia': 'VICERRECTORADOS.InvestigacionTransferencia',
      'OrdenacionAcademica': 'VICERRECTORADOS.OrdenacionAcademica',
      'FormacionPermanente': 'VICERRECTORADOS.FormacionPermanente',
      'ComunidadUniversitaria': 'VICERRECTORADOS.ComunidadUniversitaria',
      'InternacionalesCooperacion': 'VICERRECTORADOS.InternacionalesCooperacion'
    };
    
    // Si es una facultad, devolverlo tal como está
    if (this.esFacultad(servicio)) {
      return servicio;
    }
    
    // Si es un vicerrectorado (sin prefijo), convertirlo a su clave de traducción
    if (vicerrectorados[servicio]) {
      return vicerrectorados[servicio];
    }
    
    // Si es un servicio básico, usar su clave de traducción
    return serviciosBasicos[servicio] || servicio;
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
    
    if (tipoHorario === 'hora') {
      // Si se cambia a "hora específica", limpiar la hora fin
      ubicacionControl.get('horaFin')?.setValue('');
    } else if (tipoHorario === 'horario') {
      // Si se cambia a "horario" y no hay hora fin, establecer una por defecto
      const horaFin = ubicacionControl.get('horaFin')?.value;
      if (!horaFin || horaFin.trim() === '') {
        const horaInicio = ubicacionControl.get('horaInicio')?.value;
        if (horaInicio) {
          // Establecer hora fin una hora después de la hora inicio como ejemplo
          const [hora, minutos] = horaInicio.split(':');
          const horaFinDefault = `${(parseInt(hora) + 1).toString().padStart(2, '0')}:${minutos}`;
          ubicacionControl.get('horaFin')?.setValue(horaFinDefault);
        }
      }
    }
  }

  // Método para verificar si un departamento está en las opciones disponibles
  departamentoExiste(departamento: string): boolean {
    return this.departamentosDisponibles.includes(departamento);
  }

  // Método para obtener el departamento válido o vacío si no existe
  obtenerDepartamentoValido(departamento: string): string {
    return this.departamentoExiste(departamento) ? departamento : '';
  }

  get departamentoTexto(): string {
    return this.evento?.departamento || this.evento?.empresaOrganizadora || 'No especificado';
  }

  // Método para normalizar lugares (convierte claves viejas a nombres actuales)
  private normalizarLugar(lugar: string): string {
    if (!lugar || lugar.trim() === '') return '';
    
    // Si el lugar está en el mapeo de traducción, devolver la traducción
    if (this.lugaresTraduccion[lugar]) {
      return this.lugaresTraduccion[lugar];
    }
    
    // Si ya está en lugaresDisponibles, devolverlo tal como está
    if (this.lugaresDisponibles.includes(lugar)) {
      return lugar;
    }
    
    // Si no está en ningún lado, es un lugar personalizado - agregarlo al servicio
    if (lugar.trim() !== '') {
      this.opcionesSincronizadasService.agregarLugar(lugar);
      return lugar;
    }
    
    return lugar;
  }

  // Método para normalizar departamentos
  private normalizarDepartamento(departamento: string): string {
    if (!departamento || departamento.trim() === '') return '';
    
    // Si ya está en departamentosDisponibles, devolverlo tal como está
    if (this.departamentosDisponibles.includes(departamento)) {
      return departamento;
    }
    
    // Si no está, es un departamento personalizado - agregarlo al servicio
    if (departamento.trim() !== '') {
      this.opcionesSincronizadasService.agregarDepartamento(departamento);
      return departamento;
    }
    
    return departamento;
  }

  // Método para normalizar actividades
  private normalizarActividad(actividad: string): string {
    if (!actividad || actividad.trim() === '') return '';
    
    // Si ya está en actividadesDisponibles, devolverlo tal como está
    if (this.actividadesDisponibles.includes(actividad)) {
      return actividad;
    }
    
    // Si no está, es una actividad personalizada - agregarla al servicio
    if (actividad.trim() !== '') {
      this.opcionesSincronizadasService.agregarActividad(actividad);
      return actividad;
    }
    
    return actividad;
  }

  // Método auxiliar para obtener información de autoría
  obtenerInfoAutoria(): { mostrarCreado: boolean, mostrarModificado: boolean } {
    const mostrarCreado = !!this.evento.creadoPor;
    const mostrarModificado = !!this.evento.modificadoPor && 
                             this.evento.modificadoPor !== this.evento.creadoPor;
    
    console.log('📋 Info de autoría:', {
      creadoPor: this.evento.creadoPor,
      modificadoPor: this.evento.modificadoPor,
      mostrarCreado,
      mostrarModificado
    });
    
    return { mostrarCreado, mostrarModificado };
  }
}

