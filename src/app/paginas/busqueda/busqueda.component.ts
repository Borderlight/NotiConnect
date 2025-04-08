import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { EventoComponent } from '../../componentes/evento/evento.component';
import { DescargarModalComponent } from '../../componentes/descargar-modal/descargar-modal.component';
import { Evento } from '../../interfaces/evento.interface';
import { EventoService } from '../../servicios/evento.service';
import { NavigationService } from '../../servicios/navigation.service';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

@Component({
  selector: 'app-busqueda',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, EventoComponent, DescargarModalComponent],
  templateUrl: './busqueda.component.html',
  styleUrls: ['./busqueda.component.css']
})
export class BusquedaComponent implements OnInit {
  formularioBusqueda: FormGroup;
  eventosFiltrados: Evento[] = [];
  eventosDisponibles: Evento[] = [];
  mostrarResultados: boolean = false;
  mostrarModalDescarga = false;
  
  // Tipos de eventos disponibles
  tiposEvento = [
    'Evento',
    'Curso',
    'Taller',
    'Congreso/Conferencia',
    'Presentación de Libro',
    'Charla',
    'Exposición',
    'Certamen o Concurso',
    'Visita',
    'Entrevista',
    'Resultados de Investigación',
    'Espectáculos',
    'Visitas o Excursiones'
  ];

  // Actividades relacionadas
  actividadesRelacionadas = ['Semana de la Ciencia'];

  // Lugares disponibles
  lugares = [
    'Facultad',
    'Aula de grados',
    'HUB de Innovación',
    'Biblioteca Vargas-Zuñiga',
    'Auditorio Juan Pablo II',
    'Online'
  ];

  // Servicios y facultades
  servicios = {
    facultades: [
      {
        facultad: "Facultad de Ciencias de la Salud",
        grados: [
          "Grado en Logopedia",
          "Grado en Enfermería",
          "Grado en Fisioterapia",
          "Grado en Nutrición Humana y Dietética"
        ]
      },
      {
        facultad: "Facultad de Ciencias del Seguro, Jurídicas y de la Empresa",
        grados: [
          "Grado en Administración y Dirección de Empresas",
          "Grado en Relaciones Internacionales",
          "Grado en Derecho"
        ]
      },
      {
        facultad: "Facultad de Ciencias Humanas y Sociales",
        grados: [
          "Máster de Formación Permanente en Gobernanza Ética",
          "Grado en Filosofía"
        ]
      },
      {
        facultad: "Facultad de Comunicación",
        grados: [
          "Grado en Periodismo",
          "Grado en Comunicación Audiovisual"
        ]
      },
      {
        facultad: "Facultad de Derecho Canónico",
        grados: [
          "Doctorado Eclesiástico en Derecho Canónico",
          "Licenciatura en Derecho Canónico"
        ]
      },
      {
        facultad: "Facultad de Educación",
        grados: [
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
        facultad: "Facultad de Enfermería y Fisioterapia Salus Infirmorum",
        grados: [
          "Grado en Fisioterapia (Madrid)",
          "Grado en Enfermería (Madrid)"
        ]
      },
      {
        facultad: "Facultad de Informática",
        grados: [
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
        facultad: "Facultad de Psicología",
        grados: [
          "Grado en Psicología",
          "Máster Universitario en Psicología General Sanitaria",
          "Diploma de Experto en Invtervención Psicosocial"
        ]
      },
      {
        facultad: "Facultad de Teología",
        grados: [
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
    ],
    otros: [
      'Gestión de la Investigación y Transferencia',
      'Unidad de Empleabilidad y Prácticas',
      'Movilidad Internacional',
      'Capellanía',
      'Deportes',
      'Coro',
      'Servicio de Asistencia Psicológica Sanitaria',
      'Unidad de Cultura Científica y de la Innovación',
      'Unidad de Igualdad',
      'Voluntariado'
    ],
    vicerrectorados: [
      'Vicerrectorado de Investigación y Transferencia',
      'Vicerrectorado de Ordenación Académica, Profesorado y Calidad',
      'Vicerrectorado de Formación Permanente y Doctorado',
      'Vicerrectorado de Comunidad Universitaria y Estudiantes',
      'Vicerrectorado de Relaciones Internacionales y Cooperación'
    ]
  };

  constructor(
    private fb: FormBuilder,
    private eventoService: EventoService,
    private navigationService: NavigationService
  ) {
    this.formularioBusqueda = this.fb.group({
      tipoEvento: [''],
      ponente: [''],
      actividad: [''],
      servicio: [''],
      fecha: [''],
      horaInicio: [''],
      horaFin: [''],
      lugar: ['']
    });
  }

  ngOnInit() {
    this.eventoService.getEventos().subscribe(eventos => {
      this.eventosDisponibles = eventos;
    });
  }

  buscarEventos() {
    this.mostrarResultados = true;
    let eventos = this.eventosDisponibles;
    const filtros = this.formularioBusqueda.value;

    eventos = eventos.filter(evento => {
      let cumpleFiltros = true;

      if (filtros.tipoEvento && evento.tipoEvento !== filtros.tipoEvento) {
        cumpleFiltros = false;
      }

      if (filtros.ponente) {
        const ponenteNormalizado = evento.ponente.toLowerCase();
        const busquedaNormalizada = filtros.ponente.toLowerCase();
        if (!ponenteNormalizado.includes(busquedaNormalizada)) {
          cumpleFiltros = false;
        }
      }

      if (filtros.actividad && evento.actividad !== filtros.actividad) {
        cumpleFiltros = false;
      }

      if (filtros.servicio && !evento.servicios?.some(s => s.servicios === filtros.servicio)) {
        cumpleFiltros = false;
      }

      if (filtros.fecha) {
        const fechaFiltro = new Date(filtros.fecha);
        const fechaEvento = new Date(evento.fecha);
        if (fechaFiltro.toDateString() !== fechaEvento.toDateString()) {
          cumpleFiltros = false;
        }
      }

      if (filtros.horaInicio && evento.horaInicio !== filtros.horaInicio) {
        cumpleFiltros = false;
      }

      if (filtros.horaFin && evento.horaFin !== filtros.horaFin) {
        cumpleFiltros = false;
      }

      if (filtros.lugar) {
        if (filtros.lugar === 'Facultad') {
          if (evento.lugar !== 'Facultad' || !evento.aula) {
            cumpleFiltros = false;
          }
        } else {
          if (evento.lugar !== filtros.lugar) {
            cumpleFiltros = false;
          }
        }
      }

      return cumpleFiltros;
    });

    this.eventosFiltrados = eventos;
  }

  limpiarFiltros() {
    this.formularioBusqueda.reset();
    this.mostrarResultados = false;
    this.eventosFiltrados = [];
  }

  eliminarEventosFiltrados() {
    // Obtener los IDs de los eventos filtrados que no son undefined
    const idsAEliminar = this.eventosFiltrados
      .map(evento => evento._id)
      .filter((id): id is string => id !== undefined);
    
    // Eliminar cada evento usando el servicio
    idsAEliminar.forEach(id => {
      this.eventoService.eliminarEvento(id).subscribe({
        next: () => {
          // Actualizar las listas locales después de eliminar cada evento
          this.eventosDisponibles = this.eventosDisponibles.filter(evento => evento._id !== id);
          this.eventosFiltrados = this.eventosFiltrados.filter(evento => evento._id !== id);
          
          // Si no quedan eventos filtrados, ocultar los resultados
          if (this.eventosFiltrados.length === 0) {
            this.mostrarResultados = false;
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

  cerrarModalDescarga() {
    this.mostrarModalDescarga = false;
  }

  manejarDescarga(options: any) {
    const eventosParaDescargar = this.eventosFiltrados.map(evento => {
      const eventoFiltrado: any = {};
      Object.keys(options.fields).forEach(field => {
        if (options.fields[field]) {
          eventoFiltrado[field] = evento[field as keyof Evento];
        }
      });
      return eventoFiltrado;
    });

    if (options.formats.json) {
      this.descargarJSON(eventosParaDescargar);
    }

    if (options.formats.csv) {
      this.descargarCSV(eventosParaDescargar);
    }

    if (options.formats.pdf) {
      this.descargarPDF(eventosParaDescargar);
    }

    this.cerrarModalDescarga();
  }

  private descargarJSON(eventos: any[]) {
    const contenido = JSON.stringify(eventos, null, 2);
    this.descargarArchivo(contenido, 'eventos_filtrados.json', 'application/json');
  }

  private descargarCSV(eventos: any[]) {
    if (eventos.length === 0) return;

    const headers = Object.keys(eventos[0]);
    const csvRows = [
      headers.join(','),
      ...eventos.map(evento => 
        headers.map(header => {
          let cell = evento[header]?.toString() || '';
          // Escapar comas y comillas
          if (cell.includes(',') || cell.includes('"')) {
            cell = `"${cell.replace(/"/g, '""')}"`;
          }
          return cell;
        }).join(',')
      )
    ];

    const contenido = csvRows.join('\n');
    this.descargarArchivo(contenido, 'eventos_filtrados.csv', 'text/csv');
  }

  private descargarPDF(eventos: any[]) {
    const doc = new jsPDF();
    let y = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);

    eventos.forEach((evento, index) => {
      // Si no es el primer evento y nos quedamos sin espacio, añadir nueva página
      if (index > 0 && y > 250) {
        doc.addPage();
        y = 20;
      }

      // Título del evento
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      doc.text('Evento', margin, y);
      y += 10;

      // Línea separadora
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, y, pageWidth - margin, y);
      y += 15;

      // Campos del evento
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');

      const camposSeleccionados = ['titulo', 'ponente', 'empresaOrganizadora', 'tipoEvento', 'fecha', 'horaInicio', 'horaFin', 'lugar', 'aula', 'descripcion', 'actividad', 'adjuntos', 'enlaces', 'servicios'];
      camposSeleccionados.forEach(campo => {
        const valor = this.obtenerValorCampo(evento, campo);
        if (valor) {
          // Etiqueta del campo
          doc.setFont('helvetica', 'bold');
          const label = this.obtenerEtiquetaCampo(campo) + ':';
          doc.text(label, margin, y);
          
          // Valor del campo
          doc.setFont('helvetica', 'normal');
          const lines = doc.splitTextToSize(valor.toString(), contentWidth);
          doc.text(lines, margin + 5, y + 5);
          
          y += (lines.length * 7) + 10; // Ajustar según el número de líneas
        }
      });

      // Espacio entre eventos
      y += 20;
    });

    doc.save('eventos_filtrados.pdf');
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
      aula: 'Aula',
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
      case 'aula':
        return evento.aula || null;
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

  eliminarEvento(eventoId: string) {
    this.eventoService.eliminarEvento(eventoId).subscribe({
      next: () => {
        // Actualizar las listas locales después de eliminar el evento
        this.eventosDisponibles = this.eventosDisponibles.filter(evento => evento._id !== eventoId);
        this.eventosFiltrados = this.eventosFiltrados.filter(evento => evento._id !== eventoId);
        
        // Si no quedan eventos filtrados, ocultar la sección de resultados
        if (this.eventosFiltrados.length === 0) {
          this.mostrarResultados = false;
        }
      },
      error: (error: Error) => {
        console.error('Error al eliminar el evento:', error);
      }
    });
  }

  goBack(): void {
    this.navigationService.goBack();
  }
}
