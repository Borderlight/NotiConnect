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
import jsPDF from 'jspdf';
import 'jspdf-autotable';

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
    // Tipos de eventos disponibles
  tiposEvento = Object.values(EventType);

  // Actividades relacionadas
  actividadesRelacionadas = ['Semana de la Ciencia'];

  // Facultades y servicios disponibles
  serviciosDisponibles = [
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
  ];

  // Lugares disponibles
  lugares: { key: string, value: string }[] = [];

  // Facultades, servicios y vicerrectorados para el filtro
  facultadesGrados = [
    { facultad: 'Facultad de Comunicación' },
    { facultad: 'Facultad de Derecho Canónico' },
    { facultad: 'Facultad de Educación' },
    { facultad: 'Facultad de Enfermería y Fisioterapia Salus Infirmorum' },
    { facultad: 'Facultad de Filosofía' },
    { facultad: 'Facultad de Informática' },
    { facultad: 'Facultad de Psicología' },
    { facultad: 'Facultad de Teología' },
    { facultad: 'Facultad de Ciencias de la Salud' },
    { facultad: 'Facultad de Ciencias del Seguro, Jurídicas y de la Empresa' },
    { facultad: 'Facultad de Ciencias Humanas y Sociales' }
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

  constructor(
    private fb: FormBuilder,
    private eventoService: EventoService,
    private navigationService: NavigationService,
    private translate: TranslateService
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

      if (filtros.horaInicio) {
        const horaFiltro = new Date(`1970-01-01T${filtros.horaInicio}:00`);
        const horaEvento = new Date(`1970-01-01T${evento.horaInicio}:00`);
        if (horaFiltro.getHours() !== horaEvento.getHours()) {
          cumpleFiltros = false;
        }
      }

      if (filtros.horaFin && evento.horaFin !== filtros.horaFin) {
        cumpleFiltros = false;
      }

      if (filtros.lugar && evento.lugar !== filtros.lugar) {
        cumpleFiltros = false;
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

      const camposSeleccionados = ['titulo', 'ponente', 'empresaOrganizadora', 'tipoEvento', 'fecha', 'horaInicio', 'horaFin', 'lugar', 'descripcion', 'actividad', 'adjuntos', 'enlaces', 'servicios'];
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