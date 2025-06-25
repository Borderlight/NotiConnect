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
import { Router } from '@angular/router';
import { EventType } from '../../enums/event-type.enum';

interface Servicio {
  servicios: string;
  grado?: string;
}

@Component({
  selector: 'app-formulario',
  imports: [ReactiveFormsModule, CommonModule, FormsModule, TranslateModule],
  templateUrl: './formulario.component.html',
  styleUrl: './formulario.component.css',
  standalone: true
})
export class FormularioComponent {
  currentLang: string;
  private translateService = inject(TranslateService);

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
    private router: Router
  ){
    this.formularioEvento = this.fb.group({
      titulo: ['', [Validators.required]],
      ponente: ['', [Validators.required]],
      empresaOrganizadora: ['', [Validators.required]],
      tipoEvento: ['', Validators.required],
      descripcion: ['', [Validators.required]],
      adjuntos: [''], // Sin validadores
      servicios: this.fb.array([this.crearCampoServicio()]),
      enlaces: this.fb.array([this.crearEnlace()]), // Sin validadores a nivel de array
      actividad_relacionada: ['', Validators.required],
      ubicaciones: this.fb.array([this.crearUbicacion()]),
      ponentes: this.fb.array([
        this.fb.group({
          id: [0],
          nombre: ['', Validators.required],
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

    // Suscribirse a cambios en lugar para actualizar validaciones del aula
    this.formularioEvento.get('lugar')?.valueChanges.subscribe(lugar => {
      const aulaControl = this.formularioEvento.get('aula');
      if (lugar === 'Facultad') {
        aulaControl?.setValidators([Validators.required]);
      } else {
        aulaControl?.clearValidators();
        aulaControl?.setValue('');
      }
      aulaControl?.updateValueAndValidity();
    });

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
    const serviciosActuales = this.listadoServicios.value as Servicio[];
    if (serviciosActuales.some((s: Servicio) => !s.servicios)) { 
      this.mostrarError = true;
      return;
    }
    // Ya no se requiere grado para facultad, así que eliminamos la restricción
    this.listadoServicios.push(this.crearCampoServicio());
    this.mostrarError = false;
    this.mostrarErrorGrado = false;
  }

  crearCampoServicio(): FormGroup {
    return this.fb.group({
      servicios: ['', [Validators.required, ServiciosValidator.servicioSeleccionado()]],
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

  closeDialog(): void {
    this.mostrarDialog = false;
  }

  onSubmit(): void {
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

    // Marcar específicamente horaInicio como tocado
    this.listadoUbicaciones.controls.forEach(ubicacion => {
      ubicacion.get('horaInicio')?.markAsTouched();
    });

    if (!this.formularioEvento.valid) {
      // Log detallado de errores
      const errores: any = {};
      Object.keys(this.formularioEvento.controls).forEach(key => {
        const control = this.formularioEvento.get(key);
        if (control instanceof FormArray) {
          errores[key] = [];
          control.controls.forEach((ctrl, idx) => {
            if (ctrl instanceof FormGroup) {
              const subErrores: any = {};
              Object.entries(ctrl.controls).forEach(([subKey, c]) => {
                if (c.errors) {
                  subErrores[subKey] = c.errors;
                }
              });
              if (Object.keys(subErrores).length > 0) {
                errores[key][idx] = subErrores;
              }
            } else if (ctrl.errors) {
              errores[key][idx] = ctrl.errors;
            }
          });
        } else if (control?.errors) {
          errores[key] = control.errors;
        }
      });
      console.log('Errores de validación detallados:', errores);
      return;
    }

    // Marcar específicamente horaInicio como tocado
    this.listadoUbicaciones.controls.forEach(ubicacion => {
      ubicacion.get('horaInicio')?.markAsTouched();
    });

    if (this.formularioEvento.valid) {
      const enlaces = this.formularioEvento.get('enlaces') as FormArray;
      let enlacesValidos = true;

      enlaces.controls.forEach((enlace, index) => {
        const tipo = enlace.get('tipo')?.value;
        const url = enlace.get('url')?.value;
        if (tipo && this.socialMediaValidators[tipo] && !this.validateSocialMediaUrl(tipo, url)) {
          enlacesValidos = false;
          this.mostrarErrorUrl = true;
        }
      });

      // --- NUEVO: Asignar la carátula seleccionada como imagen principal ---
      let imagenCaratula = '';
      if (this.caratulaSeleccionada !== null && this.selectedAdjuntos[this.caratulaSeleccionada]) {
        imagenCaratula = this.selectedAdjuntos[this.caratulaSeleccionada];
      }
      // Aquí puedes adaptar el envío según si usas FormData o JSON
      // Si usas FormData:
      const formData = new FormData();
      Object.keys(this.formularioEvento.controls).forEach(key => {
        if (key !== 'adjuntos') {
          const value = this.formularioEvento.get(key)?.value;
          formData.append(key, value);
        }
      });
      // Adjuntar archivos
      const files: FileList | null = this.adjuntosInput.nativeElement.files;
      if (files) {
        for (let i = 0; i < files.length; i++) {
          formData.append('adjuntos', files[i], files[i].name);
        }
      }
      // Adjuntar la carátula como campo extra
      if (imagenCaratula) {
        formData.append('imagen', imagenCaratula);
      }
      // Submit as multipart/form-data
      this.eventoService.agregarEvento(formData).subscribe({
        next: () => {
          this.mostrarDialog = true;
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
          console.error('Error al crear evento:', err);
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

  // Suscripción para el lugar
  private setupLugarValidation(ubicacionControl: AbstractControl) {
    ubicacionControl.get('lugar')?.valueChanges.subscribe(lugar => {
      const aulaControl = ubicacionControl.get('aula');
      if (lugar === 'Facultad') {
        aulaControl?.setValidators([Validators.required]);
      } else {
        aulaControl?.clearValidators();
        aulaControl?.setValue('');
      }
      aulaControl?.updateValueAndValidity();
    });
  }

  get listadoUbicaciones() {
    return this.formularioEvento.get('ubicaciones') as FormArray;
  }

  crearUbicacion(): FormGroup {
    return this.fb.group({
      fecha: ['', Validators.required],
      tipoHorario: ['hora', Validators.required],
      horaInicio: ['', Validators.required],
      horaFin: ['', [UbicacionValidator.horaFinRequerida(), UbicacionValidator.horaFinPosterior()]],
      lugar: ['', Validators.required],
      aula: ['', UbicacionValidator.aulaRequerida()]
    });
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
    'S-41', // Nueva opción añadida
    'S-42', // Puedes añadir más aquí si lo deseas
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
      this.formularioEvento.get('empresaOrganizadora')?.setValue(valor);
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

  trackByPonenteId(index: number, ponente: AbstractControl) {
    return ponente.get('id')?.value;
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
    const existe = this.getOpcionesLugar(i).some(
      opcion => opcion.toLowerCase() === valor?.toLowerCase()
    );
    if (valor && existe) {
      this.mostrarErrorLugar[i] = true;
      this.mensajeErrorLugar[i] = 'Este lugar ya existe. Por favor, comprueba el listado.';
      return;
    }
    if (valor && !this.lugaresPersonalizados[i].includes(valor)) {
      this.lugaresPersonalizados[i].push(valor);
      this.formularioEvento.get('ubicaciones')?.get(''+i)?.get('lugar')?.setValue(valor);
      this.mostrarInputLugar[i] = false;
      this.nuevoLugar[i] = '';
      this.mostrarErrorLugar[i] = false;
      this.mensajeErrorLugar[i] = '';
    }
  }

  // Devuelve las opciones de lugar para el selector, agrupadas
  getOpcionesLugar(i: number): string[] {
    return [
      ...this.lugaresPresenciales,
      ...(this.lugaresPersonalizados[i] || []),
      ...this.lugaresVirtuales
    ];
  }
}