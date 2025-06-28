import { Component, inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormBuilder, ReactiveFormsModule, Validators, FormArray, AbstractControl } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { BasicosValidator } from '../../validadores/basicos.validator';
import { EnlacesValidator } from '../../validadores/enlaces.validator';
import { ServiciosValidator } from '../../validadores/servicios.validator';
import { UbicacionValidator } from '../../validadores/ubicacion.validator';
import { EventoService } from '../../servicios/evento.service';
import { ProgresoSubidaComponent } from '../../componentes/progreso-subida/progreso-subida.component';
import { CompresionService } from '../../servicios/compresion.service';
import { Router } from '@angular/router';
import { EventType } from '../../enums/event-type.enum';
import { OpcionesSincronizadasService } from '../../servicios/opciones-sincronizadas.service';

interface Servicio {
  servicios: string;
  grado?: string;
}

@Component({
  selector: 'app-formulario',
  imports: [ReactiveFormsModule, CommonModule, FormsModule, TranslateModule, ProgresoSubidaComponent],
  templateUrl: './formulario.component.html',
  styleUrl: './formulario.component.css',
  standalone: true
})
export class FormularioComponent {
  currentLang: string;
  private translateService = inject(TranslateService);

  // Propiedades para progreso de subida
  mostrarProgreso = false;
  progresoSubida = 0;
  tituloProgreso = 'Procesando archivos...';
  mensajeProgreso = 'Comprimiendo y procesando archivos adjuntos...';
  
  // NUEVO: Opción para deshabilitar compresión (para archivos pequeños o conexión rápida)
  deshabilitarCompresion = false;

  mostrarError: boolean = false
  opcionSeleccionada: string = '0'
  seleccionado : string = ''
  mostrarErrorTipo = false;
  mostrarErrorUrl = false;
  mostrarNotificacion = false;
  mostrarNotificacionerror = false;
  mostrarDialog = false;
  mostrarInputActividad = false;
  nuevaActividad: string = '';
  mostrarErrorActividad = false;
  mensajeErrorActividad = '';
  mostrarErrorGrado = false;
  mostrarHorarioCompleto: boolean = false;
  
  // Array de actividades disponibles
  actividadesRelacionadas: string[] = [];
  actividadesPorDefecto: string[] = ['Semana de la Ciencia'];

  // Devuelve la lista de actividades para el selector (sin traducción)
  get actividadesRelacionadasTraducidas(): string[] {
    return this.actividadesRelacionadas;
  }

  // Añadir nueva propiedad para manejar errores por índice
  enlacesConError: { [key: number]: { tipo: boolean, url: boolean } } = {};

  // Método para agregar nueva actividad
  async agregarNuevaActividad() {
    const actividadTrimmed = this.nuevaActividad.trim();
    if (actividadTrimmed) {
      // Comprobar si la actividad ya existe (ignorando mayúsculas/minúsculas)
      const actividadExiste = this.actividadesRelacionadas.some(
        actividad => actividad.toLowerCase() === actividadTrimmed.toLowerCase()
      );

      if (actividadExiste) {
        this.mostrarErrorActividad = true;
        this.mensajeErrorActividad = 'Esta actividad ya existe. Por favor, comprueba el listado de actividades.';
        return;
      }
      this.actividadesRelacionadas.push(actividadTrimmed);
      // Guardar en localStorage
      const customActs = localStorage.getItem('actividadesPersonalizadas');
      const customActsArr = customActs ? JSON.parse(customActs) : [];
      customActsArr.push(actividadTrimmed);
      localStorage.setItem('actividadesPersonalizadas', JSON.stringify(customActsArr));
      
      // Notificar al servicio de sincronización
      this.opcionesSincronizadasService.agregarActividad(actividadTrimmed);
      
      this.formularioEvento.patchValue({
        actividad_relacionada: actividadTrimmed
      });
      this.nuevaActividad = '';
      this.mostrarInputActividad = false;
      this.mostrarErrorActividad = false;
    }
  }

  // Método para mostrar/ocultar el input de nueva actividad
  toggleInputActividad() {
    this.mostrarInputActividad = !this.mostrarInputActividad;
    if (!this.mostrarInputActividad) {
      this.nuevaActividad = '';
      this.mostrarErrorActividad = false;
    }
  }

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
},
]
  tiposEnlace = [
    { nombre: 'YouTube', icono: '/assets/iconosenlaces/youtube.png' },
    { nombre: 'Instagram', icono: '/assets/iconosenlaces/Instagram.png' },
    { nombre: 'TikTok', icono: '/assets/iconosenlaces/tiktok.png' },
    { nombre: 'Periódico', icono: '/assets/iconosenlaces/periodico.png' },
    { nombre: 'LinkedIn', icono: '/assets/iconosenlaces/linkedin.png' },
    {nombre: 'X', icono : '/assets/iconosenlaces/x.avif'},
    { nombre: 'Otros', icono: '/assets/iconosenlaces/otros.png'},
  ]

  // Types of events available
  tiposEvento = Object.values(EventType);

  formularioEvento: FormGroup
  constructor(
    private fb: FormBuilder,
    private eventoService: EventoService,
    private compresionService: CompresionService,
    private router: Router,
    private opcionesSincronizadasService: OpcionesSincronizadasService
  ){
    this.formularioEvento = this.fb.group({
      titulo: ['', [Validators.required]],
      departamento: ['', [Validators.required]], // Departamento organizador
      tipoEvento: ['', Validators.required],
      descripcion: ['', [Validators.required]],
      adjuntos: [''], // Sin validadores
      servicios: this.fb.array([this.crearCampoServicio()]), // Sin required
      enlaces: this.fb.array([this.crearEnlace()]), // Sin validadores a nivel de array
      actividad_relacionada: [''], // Sin required
      ubicaciones: this.fb.array([this.crearUbicacion()]), // Requerido: fecha, tipo horario, lugar
      ponentes: this.fb.array([
        this.fb.group({
          id: [0],
          nombre: [''], // Sin required
          afiliacion: ['']
        })
      ])
    });
    // Inicializar arrays auxiliares para la primera ubicación
    this.lugaresPersonalizados = [[]];
    this.mostrarInputLugar = [false];
    this.nuevoLugar = [''];
    this.mostrarErrorLugar = [false];
    this.mensajeErrorLugar = [''];

    // Suscripción existente para tipoHorario
    this.formularioEvento.get('tipoHorario')?.valueChanges.subscribe(tipo => {
      const horaFin = this.formularioEvento.get('horaFin');
      if (tipo === 'horario') {
        horaFin?.setValidators([Validators.required]);
      } else {
        horaFin?.clearValidators();
      }
      horaFin?.updateValueAndValidity();
    });

    this.currentLang = this.translateService.currentLang || this.translateService.getDefaultLang();
    this.translateService.onLangChange.subscribe(event => {
      this.currentLang = event.lang;
    });

    // Recuperar actividades personalizadas de localStorage
    const customActs = localStorage.getItem('actividadesPersonalizadas');
    const customActsArr = customActs ? JSON.parse(customActs) : [];
    this.actividadesRelacionadas = [...this.actividadesPorDefecto, ...customActsArr];
  }

  get listadoServicios(){
    return this.formularioEvento.get('servicios') as FormArray
  }
  

  anadirCampoServicio() {
    // Ya no validamos que los servicios estén llenos porque no son requeridos
    this.listadoServicios.push(this.crearCampoServicio());
    this.mostrarError = false;
    this.mostrarErrorGrado = false;
  }

  crearCampoServicio(): FormGroup {
    return this.fb.group({
      servicios: [''], // Sin required - servicios no son obligatorios
      grado: [''] // Sin validadores
    });
  }

  eliminarServicio(index: number){
    if (this.listadoServicios.length > 1){
      this.listadoServicios.removeAt(index)
    }
   
  }

  obtenerGrados(facultad: string): string[] {
    const facultadEncontrada = this.facultadesGrados.find(f => f.facultad === facultad);
    return facultadEncontrada ? facultadEncontrada.grados : [];
  }
  
  esFacultadSeleccionada(servicio: string): boolean {
    return this.facultadesGrados.some(f => f.facultad === servicio);
  }


  
  get listadoEnlaces() {
    return this.formularioEvento.get('enlaces') as FormArray;
  }

  // Definir el tipo para los validadores de redes sociales
  private socialMediaValidators: { [key: string]: (url: string) => boolean } = {
    'Instagram': (url: string) => /^https?:\/\/(www\.)?instagram\.com/.test(url),
    'X': (url: string) => /^https?:\/\/(www\.)?(twitter\.com|x\.com)/.test(url),
    'TikTok': (url: string) => /^https?:\/\/(www\.)?tiktok\.com/.test(url),
    'YouTube': (url: string) => /^https?:\/\/(www\.)?youtube\.com/.test(url),
    'LinkedIn': (url: string) => /^https?:\/\/(www\.)?linkedin\.com/.test(url),
    'Periódico': (url: string) => /^https?:\/\//.test(url),
    'Otros': (url: string) => /^https?:\/\//.test(url)
  };

  // Función para validar URLs de redes sociales
  private validateSocialMediaUrl(tipo: string, url: string): boolean {
    if (this.socialMediaValidators[tipo]) {
      return this.socialMediaValidators[tipo](url);
    }
    return true; // Si no es una red social, no aplicamos validación específica
  }

  // Crear un nuevo enlace con validaciones
  private crearEnlace(): FormGroup {
    return this.fb.group({
      tipo: [''], // Sin required
      url: ['']  // Sin required ni validadores personalizados
    });
  }

  // Método para añadir un nuevo enlace
  anadirEnlace() {
    const ultimoIndex = this.listadoEnlaces.length - 1;
    const ultimoEnlace = this.listadoEnlaces.at(ultimoIndex);
    
    if (!ultimoEnlace.get('tipo')?.value || !ultimoEnlace.get('url')?.value) {
      this.enlacesConError[ultimoIndex] = {
        tipo: !ultimoEnlace.get('tipo')?.value,
        url: !ultimoEnlace.get('url')?.value
      };
      return;
    }

    // Validar URL según el tipo de enlace
    const tipo = ultimoEnlace.get('tipo')?.value;
    const url = ultimoEnlace.get('url')?.value;
    
    if (tipo && this.socialMediaValidators[tipo]) {
      if (!this.validateSocialMediaUrl(tipo, url)) {
        this.enlacesConError[ultimoIndex] = {
          tipo: false,
          url: true
        };
        return;
      }
    }

    // Si el enlace es válido, limpiar su error
    delete this.enlacesConError[ultimoIndex];
    
    // Añadir nuevo enlace
    this.listadoEnlaces.push(this.crearEnlace());
  }

  // Método para verificar si un enlace tiene error
  tieneError(index: number, tipo: 'tipo' | 'url'): boolean {
    return this.enlacesConError[index]?.[tipo] || false;
  }

  // Método para eliminar un enlace
  eliminarEnlace(index: number) {
    if (this.listadoEnlaces.length > 1) {
      this.listadoEnlaces.removeAt(index);
      // Limpiar los errores del enlace eliminado
      delete this.enlacesConError[index];
      // Reajustar los índices de los errores
      const nuevosErrores: typeof this.enlacesConError = {};
      Object.keys(this.enlacesConError).forEach(key => {
        const numKey = parseInt(key);
        if (numKey > index) {
          nuevosErrores[numKey - 1] = this.enlacesConError[numKey];
        } else if (numKey < index) {
          nuevosErrores[numKey] = this.enlacesConError[numKey];
        }
      });
      this.enlacesConError = nuevosErrores;
    }
  }

  obtenerIcono(tipo: string): string {
    const tipoEncontrado = this.tiposEnlace.find(t => t.nombre === tipo);
    return tipoEncontrado ? `${tipoEncontrado.icono}` : '';
  }
  
  @ViewChild('adjuntosInput') adjuntosInput!: ElementRef<HTMLInputElement>;

  selectedAdjuntos: string[] = [];

  // Lista de nombres de los archivos adjuntos (sincronizada con selectedAdjuntos)
  nombresAdjuntos: string[] = [];

  trackByIndex(index: number, item: any): any {
    return index;
  }

  onAdjuntosSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (!input.files) return;
    this.selectedAdjuntos = [];
    this.nombresAdjuntos = []; // Reiniciar la lista de nombres
    Array.from(input.files).forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e: any) => this.selectedAdjuntos.push(e.target.result);
        reader.readAsDataURL(file);
      }
      this.nombresAdjuntos.push(file.name); // Agregar el nombre del archivo
    });
    // Si el usuario borra todos los archivos, limpiar el input correctamente
    if (input.files.length === 0) {
      this.selectedAdjuntos = [];
      this.nombresAdjuntos = [];
      if (this.adjuntosInput && this.adjuntosInput.nativeElement) {
        this.adjuntosInput.nativeElement.value = '';
      }
    }
  }

  // Método para convertir archivo a Base64
  private convertFileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  }

  closeDialog(): void {
    this.mostrarDialog = false;
    this.router.navigate(['/']);
  }

  async onSubmit(): Promise<void> {
    console.log('🚀 onSubmit ejecutado');
    
    // Marcar todos los campos como tocados para mostrar errores
    Object.keys(this.formularioEvento.controls).forEach(key => {
      const control = this.formularioEvento.get(key);
      if (control instanceof FormArray) {
        control.markAsTouched();
        control.controls.forEach(ctrl => {
          if (ctrl instanceof FormGroup) {
            ctrl.markAsTouched();
            Object.entries(ctrl.controls).forEach(([subKey, c]) => {
              if (c instanceof FormControl) {
                c.markAsTouched();
              }
            });
          }
        });
      } else {
        control?.markAsTouched();
      }
    });

    console.log('📋 Validez del formulario:', this.formularioEvento.valid);
    console.log('📋 Valores actuales del formulario:', this.formularioEvento.value);

    // Verificar campos requeridos específicos
    const camposRequeridos = {
      titulo: this.formularioEvento.get('titulo')?.value,
      departamento: this.formularioEvento.get('departamento')?.value,
      tipoEvento: this.formularioEvento.get('tipoEvento')?.value,
      descripcion: this.formularioEvento.get('descripcion')?.value,
    };

    console.log('📋 Campos requeridos:', camposRequeridos);

    // Verificar que todos los campos requeridos estén llenos
    const camposRequeridosValidos = Object.values(camposRequeridos).every(valor => 
      valor !== null && valor !== undefined && valor !== ''
    );

    console.log('✅ Campos requeridos válidos:', camposRequeridosValidos);

    // Verificar ubicaciones
    const ubicaciones = this.listadoUbicaciones.controls;
    const ubicacionValida = ubicaciones.length > 0 && ubicaciones.every(ub => {
      const fecha = ub.get('fecha')?.value;
      const tipoHorario = ub.get('tipoHorario')?.value;
      const horaInicio = ub.get('horaInicio')?.value;
      const horaFin = ub.get('horaFin')?.value;
      const lugar = ub.get('lugar')?.value;

      console.log('� Validando ubicación:', { fecha, tipoHorario, horaInicio, horaFin, lugar });

      // Verificar campos requeridos de ubicación
      if (!fecha || !tipoHorario || !horaInicio || !lugar) {
        return false;
      }

      // Si el tipo de horario es "horario", horaFin es requerida
      if (tipoHorario === 'horario' && !horaFin) {
        return false;
      }

      return true;
    });

    console.log('📍 Ubicación válida:', ubicacionValida);

    if (!camposRequeridosValidos || !ubicacionValida) {
      console.log('❌ Formulario inválido - faltan campos requeridos');
      return;
    }

    console.log('✅ Formulario válido, continuando...');

    if (this.formularioEvento.valid) {
      console.log('🔗 Validando enlaces...');
      const enlaces = this.formularioEvento.get('enlaces') as FormArray;
      let enlacesValidos = true;

      enlaces.controls.forEach((enlace, index) => {
        const tipo = enlace.get('tipo')?.value;
        const url = enlace.get('url')?.value;
        console.log(`🔍 Validando enlace ${index}: tipo="${tipo}", url="${url}"`);
        
        // Solo validar si ambos campos tienen valores
        if (tipo && url) {
          if (this.socialMediaValidators[tipo] && !this.validateSocialMediaUrl(tipo, url)) {
            enlacesValidos = false;
            this.mostrarErrorUrl = true;
            console.log(`❌ Enlace ${index} inválido`);
          }
        }
      });

      console.log('🔗 Enlaces válidos:', enlacesValidos);

      // Si los enlaces no son válidos, salir de la función
      if (!enlacesValidos) {
        console.log('🛑 Saliendo por enlaces inválidos');
        return;
      }

      // --- NUEVO: Asignar la carátula seleccionada como imagen principal ---
      let imagenCaratula = '';
      if (this.caratulaSeleccionada !== null && this.selectedAdjuntos[this.caratulaSeleccionada]) {
        imagenCaratula = this.selectedAdjuntos[this.caratulaSeleccionada];
      }
      
      console.log('📦 Preparando datos como JSON...');
      
      // Crear objeto de datos del evento
      const eventoData: any = {};
      Object.keys(this.formularioEvento.controls).forEach(key => {
        if (key !== 'adjuntos' && key !== 'actividad_relacionada') {
          eventoData[key] = this.formularioEvento.get(key)?.value;
        }
      });
      
      // Enviar el campo actividad correctamente
      const actividad = this.formularioEvento.get('actividad_relacionada')?.value;
      if (actividad) {
        eventoData.actividad = actividad;
      }
      
      // Convertir archivos a Base64 con compresión
      const files: FileList | null = this.adjuntosInput.nativeElement.files;
      console.log('📁 Archivos encontrados:', files ? files.length : 0);
      
      eventoData.adjuntos = [];
      if (files && files.length > 0) {
        try {
          // Mostrar progreso
          this.mostrarProgreso = true;
          this.progresoSubida = 0;

          // OPTIMIZACIÓN: Evaluar si necesitamos compresión
          const tamanoTotal = Array.from(files).reduce((total, file) => total + file.size, 0);
          const necesitaCompresion = tamanoTotal > 10 * 1024 * 1024 || // > 10MB total
                                   Array.from(files).some(file => file.size > 2 * 1024 * 1024); // algún archivo > 2MB

          if (necesitaCompresion && !this.deshabilitarCompresion) {
            this.tituloProgreso = 'Optimizando archivos...';
            this.mensajeProgreso = 'Comprimiendo archivos grandes para mejorar la subida...';
            
            console.log('🔄 Iniciando compresión de archivos...');
            
            // Comprimir archivos con callback de progreso
            const archivosComprimidos = await this.compresionService.comprimirArchivos(
              files, 
              (progreso) => {
                this.progresoSubida = progreso;
                this.mensajeProgreso = `Procesando archivo ${Math.ceil(progreso * files.length / 100)} de ${files.length}...`;
              }
            );

            // Extraer solo las strings base64 para el modelo de MongoDB
            eventoData.adjuntos = archivosComprimidos.map((archivo: any) => archivo.data || archivo);
          } else {
            // Procesamiento rápido sin compresión
            this.tituloProgreso = 'Procesando archivos...';
            this.mensajeProgreso = 'Convirtiendo archivos...';
            
            console.log('⚡ Procesamiento rápido sin compresión');
            
            const filePromises: Promise<string>[] = [];
            for (let i = 0; i < files.length; i++) {
              const file = files[i];
              const promise = this.convertFileToBase64(file);
              filePromises.push(promise);
            }
            
            eventoData.adjuntos = await Promise.all(filePromises);
          }

          this.progresoSubida = 100;
          this.mensajeProgreso = 'Archivos procesados. Enviando al servidor...';
          
        } catch (error) {
          this.mostrarProgreso = false;
          console.error('❌ Error al procesar archivos:', error);
          alert('Error al procesar los archivos adjuntos. Por favor, intenta con archivos más pequeños.');
          return;
        }
      }
      
      // Adjuntar la carátula como campo extra
      if (imagenCaratula) {
        eventoData.imagen = imagenCaratula;
        console.log('🖼️ Carátula adjuntada');
      }
      
      // Submit como JSON puro
      console.log('🚀 Enviando formulario al servidor como JSON...');
      this.tituloProgreso = 'Enviando evento...';
      this.mensajeProgreso = 'Guardando el evento en el servidor...';
      
      this.eventoService.agregarEvento(eventoData).subscribe({
        next: (response) => {
          this.mostrarProgreso = false; // Ocultar progreso
          console.log('✅ Evento creado exitosamente:', response);
          console.log('📱 Mostrando diálogo de confirmación...');
          console.log('📱 Estado actual de mostrarDialog:', this.mostrarDialog);
          this.mostrarDialog = true;
          console.log('📱 Estado después de asignar true:', this.mostrarDialog);
          this.formularioEvento.reset();
          // CORRECCIÓN: Solo se puede asignar una cadena vacía al input file
          if (this.adjuntosInput && this.adjuntosInput.nativeElement) {
            this.adjuntosInput.nativeElement.value = '';
          }
          this.selectedAdjuntos = [];
          this.nombresAdjuntos = [];
          this.caratulaSeleccionada = null;
        },
        error: (err) => {
          this.mostrarProgreso = false; // Ocultar progreso
          console.error('❌ Error al crear evento:', err);
          console.log('🚨 Código de estado HTTP:', err.status);
          console.log('🚨 Mensaje de error:', err.message);
          
          let mensajeError = 'Error al crear el evento.';
          
          if (err.status === 413) {
            mensajeError = 'El evento es demasiado grande. Intenta con menos archivos adjuntos o imágenes más pequeñas.';
          } else if (err.status === 0) {
            mensajeError = 'Error de conexión. Verifica tu conexión a internet y vuelve a intentarlo.';
          } else if (err.userMessage) {
            mensajeError = err.userMessage;
          } else if (err.error && err.error.message) {
            mensajeError = err.error.message;
          }
          
          alert(mensajeError);
        }
      });
    } else {
      console.log('Formulario inválido');
      // Mostrar los errores específicos
      Object.keys(this.formularioEvento.controls).forEach(key => {
        const control = this.formularioEvento.get(key);
        if (control?.errors) {
          console.log(`Errores en ${key}:`, control.errors);
        }
      });
    }
  }

  toggleTipoHorario(mostrarHorarioCompleto: boolean, ubicacionControl: AbstractControl) {
    if (mostrarHorarioCompleto) {
      ubicacionControl.get('horaFin')?.setValidators([Validators.required]);
    } else {
      ubicacionControl.get('horaFin')?.clearValidators();
      ubicacionControl.get('horaFin')?.setValue('');
    }
    ubicacionControl.get('tipoHorario')?.setValidators([Validators.required]);
    ubicacionControl.get('tipoHorario')?.updateValueAndValidity();
    ubicacionControl.get('horaInicio')?.updateValueAndValidity();
    ubicacionControl.get('horaFin')?.updateValueAndValidity();
  }

  get listadoUbicaciones() {
    return this.formularioEvento.get('ubicaciones') as FormArray;
  }

  crearUbicacion(): FormGroup {
    const ubicacionGroup = this.fb.group({
      fecha: ['', Validators.required], // Requerido
      tipoHorario: ['hora', Validators.required], // Requerido
      horaInicio: ['', Validators.required], // Requerido
      horaFin: [''], // Condicional: requerido solo si tipoHorario es "horario"
      lugar: ['', Validators.required], // Requerido
    });

    // Agregar validación condicional para horaFin
    ubicacionGroup.get('tipoHorario')?.valueChanges.subscribe(tipo => {
      const horaFin = ubicacionGroup.get('horaFin');
      if (tipo === 'horario') {
        horaFin?.setValidators([Validators.required]);
      } else {
        horaFin?.clearValidators();
      }
      horaFin?.updateValueAndValidity();
    });

    return ubicacionGroup;
  }

  agregarUbicacion() {
    this.listadoUbicaciones.push(this.crearUbicacion());
    this.lugaresPersonalizados.push([]);
    this.mostrarInputLugar.push(false);
    this.nuevoLugar.push('');
    this.mostrarErrorLugar.push(false);
    this.mensajeErrorLugar.push('');
  }

  eliminarUbicacion(index: number) {
    if (this.listadoUbicaciones.length > 1) {
      this.listadoUbicaciones.removeAt(index);
      this.lugaresPersonalizados.splice(index, 1);
      this.mostrarInputLugar.splice(index, 1);
      this.nuevoLugar.splice(index, 1);
      this.mostrarErrorLugar.splice(index, 1);
      this.mensajeErrorLugar.splice(index, 1);
    }
  }

  // Listas fijas para selects traducibles
  serviciosFijos: string[] = [
    'SERVICES.GESTION_INVESTIGACION',
    'SERVICES.UNIDAD_EMPLEABILIDAD',
    'SERVICES.MOVILIDAD_INTERNACIONAL',
    'SERVICES.CAPELLANIA',
    'SERVICES.DEPORTES',
    'SERVICES.CORO',
    'SERVICES.ASISTENCIA_PSICOLOGICA',
    'SERVICES.CULTURA_CIENTIFICA',
    'SERVICES.UNIDAD_IGUALDAD',
    'SERVICES.VOLUNTARIADO'
  ];
  vicerrectorados: string[] = [
    'InvestigacionTransferencia',
    'OrdenacionAcademica',
    'FormacionPermanente',
    'ComunidadUniversitaria',
    'InternacionalesCooperacion'
  ];
  lugaresPresenciales: string[] = [
    'FACULTY',
    'AULA_MAGNA',
    'HUBdeInnovacion',
    'LIBRARY',
    'AuditorioJuanPablo',
    'S-41'
  ];
  lugaresVirtuales: string[] = [
    'ONLINE'
  ];

  // --- DEPARTAMENTO ORGANIZADOR PERSONALIZADO ---
  opcionesDepartamento: string[] = [
    'Biblioteca',
    'UCI',
    'GIT',
    'Facultad',
    'Formación Permanente',
    'Internacionales'
  ];
  departamentosPersonalizados: string[] = [];
  mostrarInputDepartamento = false;
  nuevoDepartamento = '';
  mostrarErrorDepartamento = false;
  mensajeErrorDepartamento = '';

  getOpcionesDepartamento(): string[] {
    return [...this.opcionesDepartamento, ...this.departamentosPersonalizados];
  }

  toggleInputNuevoDepartamento() {
    this.mostrarInputDepartamento = !this.mostrarInputDepartamento;
    if (!this.mostrarInputDepartamento) {
      this.nuevoDepartamento = '';
      this.mostrarErrorDepartamento = false;
      this.mensajeErrorDepartamento = '';
    }
  }

  onNuevoDepartamentoInput(event: Event) {
    const value = (event.target as HTMLInputElement)?.value ?? '';
    this.nuevoDepartamento = value;
    this.mostrarErrorDepartamento = false;
    this.mensajeErrorDepartamento = '';
  }

  agregarNuevoDepartamento() {
    const valor = this.nuevoDepartamento?.trim();
    const existe = this.getOpcionesDepartamento().some(
      opcion => opcion.toLowerCase() === valor?.toLowerCase()
    );
    if (valor && existe) {
      this.mostrarErrorDepartamento = true;
      this.mensajeErrorDepartamento = 'Este departamento ya existe. Por favor, comprueba el listado.';
      return;
    }
    if (valor && !this.opcionesDepartamento.includes(valor) && !this.departamentosPersonalizados.includes(valor)) {
      this.departamentosPersonalizados.push(valor);
      localStorage.setItem('departamentosPersonalizados', JSON.stringify(this.departamentosPersonalizados));
      
      // Notificar al servicio de sincronización
      this.opcionesSincronizadasService.agregarDepartamento(valor);
      
      this.formularioEvento.get('departamento')?.setValue(valor);
      this.mostrarInputDepartamento = false;
      this.nuevoDepartamento = '';
      this.mostrarErrorDepartamento = false;
      this.mensajeErrorDepartamento = '';
    }
  }

  private cargarDepartamentosPersonalizados() {
    const data = localStorage.getItem('departamentosPersonalizados');
    this.departamentosPersonalizados = data ? JSON.parse(data) : [];
  }

  ngOnInit() {
    this.cargarDepartamentosPersonalizados();
    // Asegurar que los arrays auxiliares están sincronizados con el número de ubicaciones
    const numUbicaciones = this.listadoUbicaciones.length;
    this.lugaresPersonalizados = Array(numUbicaciones).fill(null).map(() => []);
    this.mostrarInputLugar = Array(numUbicaciones).fill(false);
    this.nuevoLugar = Array(numUbicaciones).fill('');
    this.mostrarErrorLugar = Array(numUbicaciones).fill(false);
    this.mensajeErrorLugar = Array(numUbicaciones).fill('');
    this.translateService.onLangChange.subscribe(event => {
      const customActs = localStorage.getItem('actividadesPersonalizadas');
      const customActsArr = customActs ? JSON.parse(customActs) : [];
      this.actividadesRelacionadas = [...this.actividadesPorDefecto, ...customActsArr];
      this.currentLang = event.lang;
      // Forzar actualización del valor seleccionado si existe
      const selected = this.formularioEvento.get('actividad_relacionada')?.value;
      if (selected && !this.actividadesRelacionadas.includes(selected)) {
        this.formularioEvento.patchValue({ actividad_relacionada: '' });
      }
    });
    // Inicialización normal
    const customActs = localStorage.getItem('actividadesPersonalizadas');
    const customActsArr = customActs ? JSON.parse(customActs) : [];
    this.actividadesRelacionadas = [...this.actividadesPorDefecto, ...customActsArr];
  }

  get listadoPonentes() {
    return this.formularioEvento.get('ponentes') as FormArray;
  }

  // Generador simple de IDs únicos para ponentes
  private ponenteIdCounter = 0;

  agregarPonente() {
    this.listadoPonentes.push(this.fb.group({
      id: [this.ponenteIdCounter++],
      nombre: ['', Validators.required],
      afiliacion: ['']
    }));
  }

  eliminarPonente(index: number) {
    if (this.listadoPonentes.length > 1) {
      this.listadoPonentes.removeAt(index);
    }
  }

  // Devuelve solo los nombres de las facultades para el selector
  get nombresFacultades(): string[] {
    return this.facultadesGrados.map(f => f.facultad);
  }

  // Índice de la imagen seleccionada como carátula
  caratulaSeleccionada: number | null = null;

  // Devuelve true si la cadena base64 es una imagen válida
  esImagenAdjunta(dataUrl: string): boolean {
    return /^data:image\/(jpeg|jpg|png|gif|bmp|webp)/.test(dataUrl);
  }

  // Marca una imagen como carátula
  marcarComoCaratula(index: number): void {
    this.caratulaSeleccionada = index;
  }

  // Devuelve el nombre del archivo adjunto a partir del índice
  obtenerNombreAdjunto(index: number): string {
    // Si tienes un array de archivos originales, usa ese array para obtener el nombre real
    // Aquí se asume que tienes un array this.nombresAdjuntos[] sincronizado con selectedAdjuntos
    if (this.nombresAdjuntos && this.nombresAdjuntos[index]) {
      return this.nombresAdjuntos[index];
    }
    // Si no, intenta extraer el nombre del dataURL (no recomendado, pero fallback)
    return 'Archivo ' + (index + 1);
  }

  // --- LUGARES PERSONALIZADOS POR UBICACIÓN ---
  lugaresPersonalizados: string[][] = [];
  mostrarInputLugar: boolean[] = [];
  nuevoLugar: string[] = [];
  mostrarErrorLugar: boolean[] = [];
  mensajeErrorLugar: string[] = [];

  // Función utilitaria para normalizar cadenas (sin tildes, minúsculas, sin espacios extra)
  private normalizarLugar(lugar: string): string {
    return lugar
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Elimina tildes
      .replace(/\s+/g, ' ')
      .trim();
  }

  // Mapeo de valores internos a etiquetas legibles
  private labelsLugares: { [key: string]: string } = {
    'FACULTY': 'Facultad',
    'AULA_MAGNA': 'Aula de grado',
    'HUBdeInnovacion': 'HUB de Innovación',
    'LIBRARY': 'Biblioteca',
    'AuditorioJuanPablo': 'Auditorio Juan Pablo II',
    'S-41': 'S-41',
    'ONLINE': 'Online'
  };

  // Devuelve la etiqueta legible para un lugar
  getLabelLugar(lugar: string): string {
    return this.labelsLugares[lugar] || lugar;
  }

  // Devuelve todas las opciones de lugar para la ubicación i (presenciales + personalizados + virtuales, sin duplicados)
  getOpcionesLugarUnificado(i: number): string[] {
    const normalizadosPresenciales = this.lugaresPresenciales.map(l => this.normalizarLugar(l));
    const personalizadosFiltrados = (this.lugaresPersonalizados[i] || []).filter(
      pers => !normalizadosPresenciales.includes(this.normalizarLugar(pers))
    );
    // Unir presenciales, personalizados y virtuales, sin duplicados
    const todos = [
      ...this.lugaresPresenciales,
      ...personalizadosFiltrados,
      ...this.lugaresVirtuales
    ];
    // Eliminar duplicados por normalización
    const vistos = new Set<string>();
    return todos.filter(lugar => {
      const norm = this.normalizarLugar(lugar);
      if (vistos.has(norm)) return false;
      vistos.add(norm);
      return true;
    });
  }

  // Devuelve todos los valores visibles del selector de lugar para la ubicación i (normalizados, incluye traducciones)
  private getTodosLugaresVisiblesNormalizados(i: number): string[] {
    const lugares = this.getOpcionesLugarUnificado(i);
    // Normalizar tanto el valor interno como la etiqueta traducida
    return lugares.flatMap(lugar => [
      this.normalizarLugar(lugar),
      this.normalizarLugar(this.getLabelLugar(lugar))
    ]);
  }

  // Al mostrar el input de nuevo lugar, inicializar el valor a ''
  toggleInputNuevoLugar(i: number) {
    this.mostrarInputLugar[i] = !this.mostrarInputLugar[i];
    if (this.mostrarInputLugar[i]) {
      this.nuevoLugar[i] = '';
      this.mostrarErrorLugar[i] = false;
      this.mensajeErrorLugar[i] = '';
    }
  }

  // Al escribir en el input de nuevo lugar
  onNuevoLugarInput(event: Event, i: number) {
    const value = (event.target as HTMLInputElement)?.value ?? '';
    this.nuevoLugar[i] = value;
    this.mostrarErrorLugar[i] = false;
    this.mensajeErrorLugar[i] = '';
  }

  // Añadir nuevo lugar personalizado
  agregarNuevoLugar(i: number) {
    const valor = this.nuevoLugar[i]?.trim();
    if (!valor) return;
    const valorNormalizado = this.normalizarLugar(valor);
    // Comprobar contra todos los valores visibles en el selector (normalizados)
    const lugaresVisiblesNormalizados = this.getTodosLugaresVisiblesNormalizados(i);
    const existe = lugaresVisiblesNormalizados.includes(valorNormalizado);
    if (existe) {
      this.mostrarErrorLugar[i] = true;
      this.mensajeErrorLugar[i] = 'Este lugar ya existe. Por favor, comprueba el listado.';
      return;
    }
    // Añadir el nuevo lugar personalizado y seleccionarlo automáticamente
    this.lugaresPersonalizados[i].push(valor);
    
    // Notificar al servicio de sincronización
    this.opcionesSincronizadasService.agregarLugar(valor);
    
    this.formularioEvento.get('ubicaciones')?.get(''+i)?.get('lugar')?.setValue(valor);
    this.mostrarInputLugar[i] = false;
    this.nuevoLugar[i] = '';
    this.mostrarErrorLugar[i] = false;
    this.mensajeErrorLugar[i] = '';
  }
}