import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { EventoComponent } from '../../componentes/evento/evento.component';
import { DescargarModalComponent } from '../../componentes/descargar-modal/descargar-modal.component';
import { ConfirmarModalComponent } from '../../componentes/confirmar-modal/confirmar-modal.component';
import { Evento } from '../../interfaces/evento.interface';
import { EventType } from '../../enums/event-type.enum';
import { EventoService } from '../../servicios/evento.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DescargaService } from '../../servicios/descarga.service';
import { Location } from '@angular/common';
import { OpcionesSincronizadasService } from '../../servicios/opciones-sincronizadas.service';

@Component({
  selector: 'app-busqueda',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, EventoComponent, DescargarModalComponent, TranslateModule, ConfirmarModalComponent],
  templateUrl: './busqueda.component.html',
  styleUrls: ['./busqueda.component.css']
})
export class BusquedaComponent implements OnInit {
  formularioBusqueda: FormGroup;
  eventosFiltrados: Evento[] = [];
  eventosDisponibles: Evento[] = [];
  mostrarResultados: boolean = false;
  mostrarModalDescarga = false;
  mostrarModalConfirmar = false;
  mensajeConfirmar = '';
  borradoPendiente: 'masivo' | 'individual' | null = null;
  idEventoAEliminar: string | null = null;
  tiposEvento = Object.values(EventType);
  actividadesRelacionadas: string[] = [];
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
    private location: Location,
    private translate: TranslateService,
    private descargaService: DescargaService,
    private opcionesSincronizadasService: OpcionesSincronizadasService
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

    // Cargar opciones desde el servicio sincronizado
    this.cargarOpcionesSincronizadas();

    // Suscribirse a cambios en las opciones
    this.opcionesSincronizadasService.getActividades().subscribe((actividades: string[]) => {
      this.actividadesRelacionadas = actividades;
    });

    this.opcionesSincronizadasService.getLugares().subscribe((lugaresDisponibles: string[]) => {
      this.actualizarLugares(lugaresDisponibles);
    });

    // Actualizar cuando cambie el idioma
    this.translate.onLangChange.subscribe(() => {
      // Obtener lugares actuales y re-actualizarlos para que se traduzcan
      this.opcionesSincronizadasService.getLugares().subscribe((lugaresDisponibles: string[]) => {
        this.actualizarLugares(lugaresDisponibles);
      });
    });
  }

  private cargarOpcionesSincronizadas() {
    // Cargar actividades
    this.opcionesSincronizadasService.getActividades().subscribe((actividades: string[]) => {
      this.actividadesRelacionadas = actividades;
    });
    
    // Cargar lugares
    this.opcionesSincronizadasService.getLugares().subscribe((lugaresDisponibles: string[]) => {
      this.actualizarLugares(lugaresDisponibles);
    });
  }

  private actualizarLugares(lugaresDisponibles: string[]) {
    this.lugares = lugaresDisponibles.map(lugar => {
      // Si es un lugar con clave de traducción, usarla; si no, mostrar el valor tal como está
      const claveTraduccion = this.obtenerClaveTraduccionLugar(lugar);
      return {
        key: claveTraduccion || lugar,
        value: lugar
      };
    });
  }

  private obtenerClaveTraduccionLugar(lugar: string): string | null {
    const mapaLugares: { [key: string]: string } = {
      'Facultad': 'LOCATIONS.FACULTY',
      'Aula Magna': 'LOCATIONS.AULA_MAGNA',
      'Biblioteca': 'LOCATIONS.LIBRARY',
      'HUB de Innovación': 'LOCATIONS.HUBdeInnovacion',
      'Hub de Innovación': 'LOCATIONS.HUBdeInnovacion',
      'Auditorio Juan Pablo II': 'LOCATIONS.AuditorioJuanPablo',
      'Auditorio Juan Pablo': 'LOCATIONS.AuditorioJuanPablo',
      'Online': 'LOCATIONS.ONLINE'
    };
    return mapaLugares[lugar] || null;
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
      // Mantener los eventos completos para exportación, pero agregar campos de la primera ubicación para visualización
      this.eventosFiltrados = eventos.map(ev => {
        if (Array.isArray(ev.ubicaciones) && ev.ubicaciones.length > 0) {
          const ub = ev.ubicaciones[0]; // Solo para campos de visualización
          // Soportar ambos tipos de ubicaciones (hora única y horario)
          let horaInicio = '';
          let horaFin = undefined;
          if (ub.horaInicio) {
            horaInicio = ub.horaInicio;
            // Solo asignar horaFin si existe y no es un valor por defecto como 23:59
            if (ub.horaFin && ub.horaFin !== '23:59' && ub.horaFin !== '00:00' && ub.horaFin.trim() !== '' && ub.horaFin !== ub.horaInicio) {
              horaFin = ub.horaFin;
            }
          } else if (ub.hora) {
            horaInicio = ub.hora;
          }
          
          // Mantener el evento completo pero agregar campos de la primera ubicación para visualización
          const eventoConVisualizacion: any = {
            ...ev, // Mantener todo el evento original incluidos todos los arrays
            // Campos de visualización basados en la primera ubicación
            fechaVisualizacion: ub.fecha,
            lugarVisualizacion: ub.lugar,
            aulaVisualizacion: ub.aula,
            horaInicioVisualizacion: horaInicio
          };
          
          if (horaFin) {
            eventoConVisualizacion.horaFinVisualizacion = horaFin;
          }
          
          return eventoConVisualizacion;
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

  // Cambia el handler del evento de la card
  onSolicitarConfirmacionEliminar(id: string) {
    this.mensajeConfirmar = '¿Estás seguro de borrar este evento?';
    this.mostrarModalConfirmar = true;
    this.borradoPendiente = 'individual';
    this.idEventoAEliminar = id;
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
          // Si el campo es 'ubicaciones', incluirlo con formato agrupado
          if (field === 'ubicaciones') {
            const valor = this.obtenerValorCampo(evento, field);
            if (valor !== null) {
              eventoFiltrado[field] = valor;
            }
            return;
          }
          
          // Para subcampos de ubicaciones (fecha, horaInicio, horaFin, lugar), 
          // solo incluirlos si no se ha seleccionado el campo agrupador 'ubicaciones'
          if (['fecha', 'horaInicio', 'horaFin', 'lugar'].includes(field) && options.fields['ubicaciones']) {
            return;
          }
          
          // Usar el método obtenerValorCampo para obtener el valor correcto
          const valor = this.obtenerValorCampo(evento, field);
          
          // Para horaFin, siempre incluir el campo aunque sea null (aparecerá vacío)
          if (field === 'horaFin') {
            eventoFiltrado[field] = valor || '';
          } else if (valor !== null) {
            // Para otros campos, solo incluir si tienen valor
            eventoFiltrado[field] = valor;
          }
        }
      });
      return eventoFiltrado;
    });

    let nombreBase = 'eventos_filtrados';
    if (eventosParaDescargar.length === 1 && eventosParaDescargar[0].titulo) {
      nombreBase = eventosParaDescargar[0].titulo.replace(/[^a-zA-Z0-9-_]/g, '_').substring(0, 40);
    }

    // Para CSV y JSON, convertir adjuntos complejos a formato simple
    const eventosParaCSVJSON = eventosParaDescargar.map(evento => {
      const eventoSimple = { ...evento };
      if (eventoSimple.adjuntos) {
        try {
          const adjuntos = JSON.parse(eventoSimple.adjuntos);
          eventoSimple.adjuntos = adjuntos.map((a: any) => a.nombre).join(', ');
        } catch (error) {
          // Si no es JSON, mantener el valor original
        }
      }
      if (eventoSimple.enlaces) {
        try {
          const enlaces = JSON.parse(eventoSimple.enlaces);
          eventoSimple.enlaces = enlaces.map((e: any) => e.texto).join('; ');
        } catch (error) {
          // Si no es JSON, mantener el valor original
        }
      }
      return eventoSimple;
    });

    if (options.formats.json) {
      this.descargaService.descargarJSON(eventosParaCSVJSON, nombreBase);
    }
    if (options.formats.csv) {
      this.descargaService.descargarCSV(eventosParaCSVJSON, nombreBase, this.obtenerEtiquetaCampo.bind(this));
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
      tipoEvento: 'Tipo de Evento',
      departamento: 'Departamento',
      descripcion: 'Descripción',
      ubicaciones: 'Ubicaciones',
      fecha: 'Fecha',
      horaInicio: 'Hora de Inicio',
      horaFin: 'Hora de Fin',
      lugar: 'Lugar',
      ponente: 'Ponente',
      actividad: 'Actividad',
      servicios: 'Servicios',
      enlaces: 'Enlaces',
      adjuntos: 'Adjuntos'
    };
    return etiquetas[campo] || campo;
  }

  private obtenerValorCampo(evento: Evento, campo: string): string | null {
    switch (campo) {
      case 'titulo':
        return evento.titulo || null;
      case 'departamento':
        return evento.departamento || evento.empresaOrganizadora || null;
      case 'tipoEvento':
        return evento.tipoEvento ? this.traducirTipoEvento(evento.tipoEvento) : null;
      case 'descripcion':
        return evento.descripcion || null;
      case 'fecha':
        return evento.fecha ? new Date(evento.fecha).toLocaleDateString() : null;
      case 'horaInicio':
        return evento.horaInicio ? (new Date(evento.horaInicio).toString() !== 'Invalid Date' ? new Date(evento.horaInicio).toLocaleTimeString() : evento.horaInicio.toString()) : null;
      case 'horaFin':
        return evento.horaFin ? (new Date(evento.horaFin).toString() !== 'Invalid Date' ? new Date(evento.horaFin).toLocaleTimeString() : evento.horaFin.toString()) : null;
      case 'lugar':
        return evento.lugar || null;
      case 'ubicaciones':
        if (!evento.ubicaciones || evento.ubicaciones.length === 0) return null;
        return evento.ubicaciones.map((u, index) => {
          const fecha = u.fecha ? new Date(u.fecha).toLocaleDateString() : '';
          const horaInicio = u.horaInicio || '';
          // Solo incluir horaFin si realmente existe y no es un valor por defecto
          let horaFin = '';
          if (u.horaFin && 
              u.horaFin.trim() !== '' && 
              u.horaFin !== '23:59' && 
              u.horaFin !== '00:00' && 
              u.horaFin !== horaInicio) {
            horaFin = u.horaFin;
          }
          const lugar = u.lugar || '';
          
          return `Ubicación ${index + 1} (fecha: ${fecha}, hora inicio: ${horaInicio}, hora fin: ${horaFin}, lugar: ${lugar})`;
        }).join(', ');
      case 'ponente':
        return evento.ponente || (evento.ponentes ? evento.ponentes.map(p => {
          if (p.afiliacion && p.afiliacion.trim() !== '') {
            return `${p.nombre} (${p.afiliacion})`;
          }
          return p.nombre;
        }).join(', ') : null);
      case 'actividad':
        return evento.actividad || null;
      case 'enlaces':
        if (!evento.enlaces || evento.enlaces.length === 0) return null;
        // Para exportación avanzada, devolver información detallada de cada enlace
        return JSON.stringify(evento.enlaces.map(e => ({
          tipo: e.tipo || 'Otro',
          url: e.url,
          texto: `${e.tipo || 'Otro'}: ${e.url}`
        })));
      case 'servicios':
        return evento.servicios ? evento.servicios.map(s => this.traducirServicio(s.servicios) + (s.grado ? ` (${s.grado})` : '')).join(', ') : null;
      case 'adjuntos':
        if (!evento.adjuntos || evento.adjuntos.length === 0) return null;
        // Para exportación avanzada, devolver información detallada de cada adjunto
        return JSON.stringify(evento.adjuntos.map(a => {
          const nombre = a.name || 'Archivo adjunto';
          const tipo = a.type || '';
          const data = a.data || a;
          const esImagen = tipo.startsWith('image/') || (typeof data === 'string' && data.startsWith('data:image/'));
          
          return {
            nombre: nombre,
            tipo: tipo,
            data: data,
            esImagen: esImagen
          };
        }));
      default:
        return null;
    }
  }

  goBack(): void {
    this.location.back();
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

  // Cambia el botón para solo mostrar el modal, no ejecutar el borrado directamente
  mostrarConfirmacionBorradoMasivo() {
    if (this.mostrarModalConfirmar) return; // Evita doble apertura
    this.mensajeConfirmar = '¿Estás seguro de borrar todos los eventos filtrados?';
    this.mostrarModalConfirmar = true;
    this.borradoPendiente = 'masivo';
  }

  onConfirmarBorrado() {
    this.mostrarModalConfirmar = false;
    if (this.borradoPendiente === 'masivo') {
      setTimeout(() => {
        this.eliminarEventosFiltrados();
        this.borradoPendiente = null;
      }, 0);
    } else if (this.borradoPendiente === 'individual' && this.idEventoAEliminar) {
      const idAEliminar = this.idEventoAEliminar; // Guardar el ID antes de resetear
      setTimeout(() => {
        this.eliminarEventoDesdePadre(idAEliminar);
        this.borradoPendiente = null;
        this.idEventoAEliminar = null;
      }, 0);
    } else {
      // Reset si no hay borrado pendiente
      this.borradoPendiente = null;
      this.idEventoAEliminar = null;
    }
  }

  eliminarEventoDesdePadre(id: string) {
    console.log('ID recibido para eliminar:', id);
    this.eventoService.eliminarEvento(id).subscribe({
      next: () => {
        console.log('Evento eliminado exitosamente');
        this.eventosDisponibles = this.eventosDisponibles.filter(evento => evento._id !== id);
        this.eventosFiltrados = this.eventosFiltrados.filter(evento => evento._id !== id);
        if (this.eventosFiltrados.length === 0) {
          this.mostrarResultados = false;
        }
      },
      error: (error: Error) => {
        console.error('Error al eliminar el evento:', error);
        console.error('URL de la petición:', `http://localhost:3000/api/eventos/${id}`);
      }
    });
  }

  onCancelarBorrado() {
    this.mostrarModalConfirmar = false;
    this.borradoPendiente = null;
    this.idEventoAEliminar = null;
  }

  private traducirTipoEvento(tipoEvento: string): string {
    const traducciones: { [key: string]: string } = {
      'INTERVIEW': 'Entrevista',
      'WORKSHOP': 'Taller',
      'EXHIBITION': 'Exposición',
      'TALK': 'Charla',
      'CONFERENCE_OR_CONGRESS': 'Conferencia o Congreso',
      'BOOK_PRESENTATION': 'Presentación de Libro',
      'EVENT': 'Evento',
      'VISITS_OR_EXCURSIONS': 'Visitas o Excursiones',
      'CONTEST_OR_COMPETITION': 'Concurso o Competición',
      'VISIT': 'Visita',
      'COURSE': 'Curso',
      'ROUND_TABLE': 'Mesa Redonda',
      'HACKATHON': 'Hackathón',
      'OPEN_DAY': 'Jornada de Puertas Abiertas',
      'SEMINAR': 'Seminario'
    };
    return traducciones[tipoEvento] || tipoEvento;
  }

  private traducirServicio(servicio: string): string {
    const traducciones: { [key: string]: string } = {
      'SERVICES.GESTION_INVESTIGACION': 'Gestión de Investigación',
      'SERVICES.UNIDAD_EMPLEABILIDAD': 'Unidad de Empleabilidad',
      'SERVICES.MOVILIDAD_INTERNACIONAL': 'Movilidad Internacional',
      'SERVICES.CAPELLANIA': 'Capellanía',
      'SERVICES.DEPORTES': 'Deportes',
      'SERVICES.CORO': 'Coro',
      'SERVICES.ASISTENCIA_PSICOLOGICA': 'Asistencia Psicológica',
      'SERVICES.CULTURA_CIENTIFICA': 'Cultura Científica',
      'SERVICES.UNIDAD_IGUALDAD': 'Unidad de Igualdad',
      'SERVICES.VOLUNTARIADO': 'Voluntariado',
      'InvestigacionTransferencia': 'Investigación y Transferencia',
      'OrdenacionAcademica': 'Ordenación Académica',
      'FormacionPermanente': 'Formación Permanente',
      'ComunidadUniversitaria': 'Comunidad Universitaria',
      'InternacionalesCooperacion': 'Cooperación Internacional',
      'Sin especificar': 'Sin especificar'
    };
    return traducciones[servicio] || servicio;
  }
}