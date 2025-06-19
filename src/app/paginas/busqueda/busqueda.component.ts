import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { EventoComponent } from '../../componentes/evento/evento.component';
import { DescargarModalComponent } from '../../componentes/descargar-modal/descargar-modal.component';
import { Evento } from '../../interfaces/evento.interface';
import { EventType } from '../../enums/event-type.enum';
import { EventoService } from '../../servicios/evento.service';
import { NavigationService } from '../../servicios/navigation.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DescargaService } from '../../servicios/descarga.service';

@Component({
  selector: 'app-busqueda',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, EventoComponent, DescargarModalComponent, TranslateModule],
  templateUrl: './busqueda.component.html',
  styleUrls: ['./busqueda.component.css']
})
export class BusquedaComponent implements OnInit {
  formularioBusqueda: FormGroup;
  eventosFiltrados: Evento[] = [];
  eventosDisponibles: Evento[] = [];
  mostrarResultados: boolean = false;
  mostrarModalDescarga = false;
  tiposEvento = Object.values(EventType);
  actividadesRelacionadas = ['Semana de la Ciencia'];
  serviciosDisponibles = [
    'Gestión de la Investigación y Transferencia',
    'Unidad de Empleabilidad y Prácticas',
    'Movilidad Internacional',
    'Capellanía',
    'Deportes',
    'Coro',
    'FormacionPermanente',
    'ComunidadUniversitaria',
    'InternacionalesCooperacion'
  ];

  // === Filtros avanzados ===
  facultadesGrados = [
    { facultad: 'Facultad de Ciencias de la Salud', grados: [
      'Grado en Logopedia',
      'Grado en Enfermería',
      'Grado en Fisioterapia',
      'Grado en Nutrición Humana y Dietética'
    ]},
    { facultad: 'Facultad de Ciencias del Seguro, Jurídicas y de la Empresa', grados: [
      'Grado en Administración y Dirección de Empresas',
      'Grado en Relaciones Internacionales',
      'Grado en Derecho'
    ]},
    { facultad: 'Facultad de Ciencias Humanas y Sociales', grados: [
      'Máster de Formación Permanente en Gobernanza Ética',
      'Grado en Filosofía'
    ]},
    { facultad: 'Facultad de Comunicación', grados: [
      'Grado en Periodismo',
      'Grado en Comunicación Audiovisual'
    ]},
    { facultad: 'Facultad de Derecho Canónico', grados: [
      'Doctorado Eclesiástico en Derecho Canónico',
      'Licenciatura en Derecho Canónico'
    ]},
    { facultad: 'Facultad de Educación', grados: [
      'Grado en Ciencias de la Actividad Física y del Deporte',
      'Grado en Maestro en Educación Infantil',
      'Grado en Maestro en Educación Primaria',
      'Curso de Formación Pedagógica y Didáctica',
      'Máster en Formación Permanente en Musicoterapia',
      'Máster en Formación Permanente en Entrenamiento y Rendimiento en Fútbol',
      'Máster Universitario en Formación del Profesorado de ESO y Bachillerato, FP y Enseñanza de Idiomas',
      'Doble Grado en Maestro en Educación Primaria y Maestro en Educación Infantil',
      'Máster Universitario en Psicopedagogía',
      'Máster de Formación Permanente en Gestión en Situaciones de Crisis'
    ]},
    { facultad: 'Facultad de Enfermería y Fisioterapia Salus Infirmorum', grados: [
      'Grado en Fisioterapia (Madrid)',
      'Grado en Enfermería (Madrid)'
    ]},
    { facultad: 'Facultad de Informática', grados: [
      'Doble Grado en ADE Tecnológico e Ingeniería Informática',
      'Grado en Administración y Dirección de Empresas Tecnológicas',
      'Doble Grado en Ingeniería Informática y ADET',
      'Grado en Ingeniería Informática',
      'Diploma de Especialista en Inteligencia Artificial & Big Data Analytics',
      'Máster Universitario en Informática Móvil',
      'Máster Universitario en Dirección en Proyectos Informáticos y Servicios Tecnológicos'
    ]},
    { facultad: 'Facultad de Psicología', grados: [
      'Grado en Psicología',
      'Máster Universitario en Psicología General Sanitaria',
      'Diploma de Experto en Invtervención Psicosocial'
    ]},
    { facultad: 'Facultad de Teología', grados: [
      'Bachiller en Teología',
      'Licenciatura en Teología Bíblica',
      'Licenciatura en Teología Dogmática',
      'Licenciatura en Teología Práctica',
      'Licenciatura en Teología Pastoral',
      'Doctorado Eclesiástico en Teología Bíblica',
      'Doctorado Eclesiástico en Teología Dogmática',
      'Doctorado Eclesiástico en Teología Práctica',
      'Doctorado Eclesiástico en Teología Pastoral',
      'Doctorado Eclesiástico en Teología de la Vida Consagrada',
      'Máster Universitario en Doctrina Social de la Iglesia'
    ]}
  ];

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
  lugares: { key: string, value: string }[] = [];

  eventoDescargaIndividual: Evento | null = null;

  constructor(
    private fb: FormBuilder,
    private eventoService: EventoService,
    private navigationService: NavigationService,
    private translate: TranslateService,
    private descargaService: DescargaService
  ) {
    this.formularioBusqueda = this.fb.group({
      tipoEvento: [''],
      ponente: [''],
      actividad: [''],
      servicio: [''],
      fechaInicio: [''],
      fechaFin: [''],
      horaInicio: [''],
      horaFin: [''],
      lugar: ['']
    });
  }

  ngOnInit() {
    this.eventoService.getEventos().subscribe(eventos => {
      this.eventosDisponibles = eventos;
    });

    // Prepare translation keys for lugares
    const updateLugares = () => {
      this.lugares = [
        { key: 'LOCATIONS.FACULTY', value: 'Facultad' },
        { key: 'LOCATIONS.AULA_MAGNA', value: 'Aula Magna' },
        { key: 'LOCATIONS.LIBRARY', value: 'Biblioteca' },
        { key: 'LOCATIONS.HUBdeInnovacion', value: 'Hub de Innovación' },
        { key: 'LOCATIONS.AuditorioJuanPablo', value: 'Auditorio Juan Pablo' },
        { key: 'LOCATIONS.ONLINE', value: 'Online' }
      ];
    };

    updateLugares();
    this.translate.onLangChange.subscribe(() => updateLugares());
  }

  buscarEventos() {
    this.mostrarResultados = true;
    const filtrosRaw = this.formularioBusqueda.value;
    // Solo enviar filtros con valor definido y no vacío
    const filtros: any = {};
    Object.keys(filtrosRaw).forEach(key => {
      if (filtrosRaw[key] !== undefined && filtrosRaw[key] !== null && filtrosRaw[key] !== '') {
        filtros[key] = filtrosRaw[key];
      }
    });
    this.eventoService.getEventosFiltrados(filtros).subscribe(eventos => {
      console.log('Eventos recibidos:', eventos); // <-- Depuración
      // Aplanar ubicaciones: si hay una sola, copiar sus campos a la raíz
      this.eventosFiltrados = eventos.map(ev => {
        if (Array.isArray(ev.ubicaciones) && ev.ubicaciones.length > 0) {
          const ub = ev.ubicaciones[0];
          // Soportar ambos tipos de ubicaciones (hora única y horario)
          let horaInicio = '';
          let horaFin = undefined;
          if (ub.horaInicio) {
            horaInicio = ub.horaInicio;
            horaFin = ub.horaFin;
          } else if (ub.hora) {
            horaInicio = ub.hora;
          }
          return {
            ...ev,
            fecha: ub.fecha,
            lugar: ub.lugar,
            aula: ub.aula,
            horaInicio,
            horaFin
          };
        }
        return ev;
      }) as Evento[];
      console.log('Eventos filtrados:', this.eventosFiltrados); // <-- Depuración
    });
  }

  limpiarFiltros() {
    this.formularioBusqueda.reset();
    this.mostrarResultados = false;
    this.eventosFiltrados = [];
  }

  eliminarEvento(eventoId: string) {
    this.eventoService.eliminarEvento(eventoId).subscribe({
      next: () => {
        this.eventosDisponibles = this.eventosDisponibles.filter(evento => evento._id !== eventoId);
        this.eventosFiltrados = this.eventosFiltrados.filter(evento => evento._id !== eventoId);
        if (this.eventosFiltrados.length === 0) {
          this.mostrarResultados = false;
        }
      },
      error: (error: Error) => {
        console.error('Error al eliminar el evento:', error);
      }
    });
  }

  eliminarEventosFiltrados() {
    const idsAEliminar = this.eventosFiltrados.map(evento => evento._id).filter((id): id is string => id !== undefined);
    if (idsAEliminar.length === 0) return;
    let eliminados = 0;
    idsAEliminar.forEach(id => {
      this.eventoService.eliminarEvento(id).subscribe({
        next: () => {
          eliminados++;
          this.eventosDisponibles = this.eventosDisponibles.filter(evento => evento._id !== id);
          this.eventosFiltrados = this.eventosFiltrados.filter(evento => evento._id !== id);
          // Cuando se hayan eliminado todos, refrescar búsqueda
          if (eliminados === idsAEliminar.length) {
            this.buscarEventos();
          }
        },
        error: (error: Error) => {
          console.error('Error al eliminar el evento:', error);
        }
      });
    });
  }

  abrirModalDescarga() {
    this.mostrarModalDescarga = true;
  }

  abrirModalDescargaIndividual(evento: Evento) {
    this.eventoDescargaIndividual = evento;
    this.mostrarModalDescarga = true;
  }

  cerrarModalDescarga() {
    this.mostrarModalDescarga = false;
    this.eventoDescargaIndividual = null;
  }

  manejarDescarga(options: any) {
    const eventosParaDescargar = (this.eventoDescargaIndividual ? [this.eventoDescargaIndividual] : this.eventosFiltrados).map(evento => {
      const eventoFiltrado: any = {};
      Object.keys(options.fields).forEach(field => {
        if (options.fields[field]) {
          eventoFiltrado[field] = evento[field as keyof Evento];
        }
      });
      return eventoFiltrado;
    });

    let nombreBase = 'eventos_filtrados';
    if (eventosParaDescargar.length === 1 && eventosParaDescargar[0].titulo) {
      nombreBase = eventosParaDescargar[0].titulo.replace(/[^a-zA-Z0-9-_]/g, '_').substring(0, 40);
    }

    if (options.formats.json) {
      this.descargaService.descargarJSON(eventosParaDescargar, nombreBase);
    }
    if (options.formats.csv) {
      this.descargaService.descargarCSV(eventosParaDescargar, nombreBase);
    }
    if (options.formats.pdf) {
      this.descargaService.descargarPDF(eventosParaDescargar, nombreBase, this.obtenerEtiquetaCampo.bind(this));
    }
    if (options.formats.word) {
      this.descargaService.descargarWord(eventosParaDescargar, nombreBase, this.obtenerEtiquetaCampo.bind(this));
    }
    this.cerrarModalDescarga();
  }

  private obtenerEtiquetaCampo(campo: string): string {
    const etiquetas: { [key: string]: string } = {
      titulo: 'Título',
      ponente: 'Ponente',
      empresaOrganizadora: 'Empresa Organizadora',
      tipoEvento: 'Tipo de Evento',
      fecha: 'Fecha',
      horaInicio: 'Hora de Inicio',
      horaFin: 'Hora de Fin',
      lugar: 'Lugar',
      descripcion: 'Descripción',
      actividad: 'Actividad',
      adjuntos: 'Adjuntos',
      enlaces: 'Enlaces',
      servicios: 'Servicios'
    };
    return etiquetas[campo] || campo;
  }

  private obtenerValorCampo(evento: Evento, campo: string): string | null {
    switch (campo) {
      case 'titulo':
        return evento.titulo || null;
      case 'ponente':
        return evento.ponente || null;
      case 'empresaOrganizadora':
        return evento.empresaOrganizadora || null;
      case 'tipoEvento':
        return evento.tipoEvento || null;
      case 'fecha':
        return evento.fecha ? new Date(evento.fecha).toLocaleDateString() : null;
      case 'horaInicio':
        return evento.horaInicio ? new Date(evento.horaInicio).toLocaleTimeString() : null;
      case 'horaFin':
        return evento.horaFin ? new Date(evento.horaFin).toLocaleTimeString() : null;
      case 'lugar':
        return evento.lugar || null;
      case 'descripcion':
        return evento.descripcion || null;
      case 'actividad':
        return evento.actividad || null;
      case 'adjuntos':
        return evento.adjuntos ? evento.adjuntos.join(', ') : null;
      case 'enlaces':
        return evento.enlaces ? evento.enlaces.join(', ') : null;
      case 'servicios':
        return evento.servicios ? evento.servicios.map(s => s.servicios).join(', ') : null;
      default:
        return null;
    }
  }

  goBack(): void {
    this.navigationService.goBack();
  }

  actualizarEvento(eventoEditado: Partial<Evento>) {
    if (!eventoEditado._id) return;
    // Buscar el evento original
    const original = this.eventosDisponibles.find(ev => ev._id === eventoEditado._id);
    if (!original) return;
    // Crear objeto completo para el backend
    const eventoParaActualizar: Evento = { ...original, ...eventoEditado };
    this.eventoService.actualizarEvento(eventoParaActualizar._id as string, eventoParaActualizar).subscribe({
      next: (eventoActualizado) => {
        this.eventosDisponibles = this.eventosDisponibles.map(ev =>
          ev._id === eventoActualizado._id ? { ...ev, ...eventoActualizado } : ev
        );
        this.eventosFiltrados = this.eventosFiltrados.map(ev =>
          ev._id === eventoActualizado._id ? { ...ev, ...eventoActualizado } : ev
        );
      },
      error: (error) => {
        console.error('Error al actualizar el evento:', error);
      }
    });
  }
}