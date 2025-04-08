import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, FormBuilder, ReactiveFormsModule, Validators, FormArray, AbstractControl } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { BasicosValidator } from '../../validadores/basicos.validator';
import { EnlacesValidator } from '../../validadores/enlaces.validator';
import { ServiciosValidator } from '../../validadores/servicios.validator';
import { UbicacionValidator } from '../../validadores/ubicacion.validator';
import { EventoService } from '../../servicios/evento.service';
import { Router } from '@angular/router';

interface Servicio {
  servicios: string;
  grado?: string;
}

@Component({
  selector: 'app-formulario',
  imports: [ReactiveFormsModule, CommonModule, FormsModule],
  templateUrl: './formulario.component.html',
  styleUrl: './formulario.component.css',
  standalone: true
})
export class FormularioComponent {
  //serviciosValidator = inject(ServiciosValidator)
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
  actividadesRelacionadas: string[] = ['Semana de la Ciencia'];

  // Añadir nueva propiedad para manejar errores por índice
  enlacesConError: { [key: number]: { tipo: boolean, url: boolean } } = {};

  // Método para agregar nueva actividad
  agregarNuevaActividad() {
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

  eventos: any [] = []

  formularioEvento: FormGroup
  constructor(
    private fb: FormBuilder,
    private eventoService: EventoService,
    private router: Router
  ){
    this.formularioEvento = this.fb.group({
      titulo: ['', [Validators.required, BasicosValidator.soloLetrasYEspacios()]],
      ponente: ['', [Validators.required, BasicosValidator.soloLetrasYEspacios()]],
      empresaOrganizadora: ['', [Validators.required, BasicosValidator.soloLetrasYEspacios()]],
      tipoEvento: ['', Validators.required],
      descripcion: ['', [Validators.required, BasicosValidator.descripcionMinima(20)]],
      adjuntos: ['', [Validators.required, BasicosValidator.adjuntosRequeridos()]],
      servicios: this.fb.array([this.crearCampoServicio()]),
      enlaces: this.fb.array([this.crearEnlace()], [EnlacesValidator.requiereEnlaces()]),
      actividad_relacionada: ['', Validators.required],
      ubicaciones: this.fb.array([this.crearUbicacion()])
    });

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

    // Verificar si hay una facultad seleccionada sin grado
    const facultadSinGrado = serviciosActuales.some((servicio: Servicio) => 
      this.esFacultadSeleccionada(servicio.servicios) && !servicio.grado
    );

    if (facultadSinGrado) {
      this.mostrarErrorGrado = true;
      return;
    }

    this.listadoServicios.push(this.crearCampoServicio());
    this.mostrarError = false;
    this.mostrarErrorGrado = false;
  }

  crearCampoServicio(): FormGroup {
    return this.fb.group({
      servicios: ['', [Validators.required, ServiciosValidator.servicioSeleccionado()]],
      grado: ['', ServiciosValidator.gradoRequerido()]
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
      tipo: ['', Validators.required],
      url: ['', [
        Validators.required,
        EnlacesValidator.urlValida(),
        EnlacesValidator.socialMediaUrl()
      ]]
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
  
  

  closeDialog() {
    this.formularioEvento.reset();
    this.mostrarDialog = false;
    this.listadoServicios.clear();
    this.listadoServicios.push(this.crearCampoServicio());
    this.listadoEnlaces.clear();
    this.listadoEnlaces.push(this.crearEnlace());
  }

  onSubmit() {
    // Marcar todos los campos como tocados para mostrar errores
    Object.keys(this.formularioEvento.controls).forEach(key => {
      const control = this.formularioEvento.get(key);
      if (control instanceof FormArray) {
        control.markAsTouched();  // Marcar el FormArray como tocado
        control.controls.forEach(ctrl => {
          if (ctrl instanceof FormGroup) {
            ctrl.markAsTouched();  // Marcar el FormGroup como tocado
            Object.values(ctrl.controls).forEach(c => {
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

      if (!enlacesValidos) {
        return;
      }

      // Agregar el evento usando el servicio
      const nuevoEvento = this.eventoService.agregarEvento(this.formularioEvento.value);
      
      // Mostrar el diálogo existente
      this.mostrarDialog = true;
      
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
  }

  eliminarUbicacion(index: number) {
    if (this.listadoUbicaciones.length > 1) {
      this.listadoUbicaciones.removeAt(index);
    }
  }

}
