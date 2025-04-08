import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Evento } from '../../interfaces/evento.interface';

interface DownloadOptions {
  formats: {
    json: boolean;
    csv: boolean;
    pdf: boolean;
  };
  fields: {
    [key: string]: boolean;
  };
}

@Component({
  selector: 'app-descargar-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './descargar-modal.component.html',
  styleUrls: ['./descargar-modal.component.css']
})
export class DescargarModalComponent {
  @Input() eventos: Evento[] = [];
  @Output() cerrar = new EventEmitter<void>();
  @Output() descargar = new EventEmitter<DownloadOptions>();

  options: DownloadOptions = {
    formats: {
      json: false,
      csv: false,
      pdf: false
    },
    fields: {
      titulo: false,
      ponente: false,
      empresaOrganizadora: false,
      tipoEvento: false,
      fecha: false,
      horaInicio: false,
      horaFin: false,
      lugar: false,
      aula: false,
      descripcion: false,
      actividad: false,
      adjuntos: false,
      enlaces: false,
      servicios: false
    }
  };

  availableFields = [
    { value: 'titulo', label: 'Título' },
    { value: 'ponente', label: 'Ponente' },
    { value: 'empresaOrganizadora', label: 'Empresa Organizadora' },
    { value: 'tipoEvento', label: 'Tipo de Evento' },
    { value: 'fecha', label: 'Fecha' },
    { value: 'horaInicio', label: 'Hora de Inicio' },
    { value: 'horaFin', label: 'Hora de Fin' },
    { value: 'lugar', label: 'Lugar' },
    { value: 'aula', label: 'Aula' },
    { value: 'descripcion', label: 'Descripción' },
    { value: 'actividad', label: 'Actividad' },
    { value: 'adjuntos', label: 'Adjuntos' },
    { value: 'enlaces', label: 'Enlaces' },
    { value: 'servicios', label: 'Servicios' }
  ];

  isValidSelection(): boolean {
    const hasFormat = Object.values(this.options.formats).some(v => v);
    const hasField = Object.values(this.options.fields).some(v => v);
    return hasFormat && hasField;
  }

  descargarSeleccionado() {
    this.descargar.emit(this.options);
  }

  cerrarModal() {
    this.cerrar.emit();
  }
} 