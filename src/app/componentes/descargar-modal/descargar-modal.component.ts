import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Evento } from '../../interfaces/evento.interface';

interface DownloadOptions {
  formats: {
    json: boolean;
    csv: boolean;
    pdf: boolean;
    word: boolean;
  };
  fields: {
    [key: string]: boolean;
  };
}

@Component({
  selector: 'app-descargar-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule],
  templateUrl: './descargar-modal.component.html',
  styleUrls: ['./descargar-modal.component.css']
})
export class DescargarModalComponent {
  @Input() eventos: Evento[] = [];
  @Output() cerrar = new EventEmitter<void>();
  @Output() descargar = new EventEmitter<DownloadOptions>();

  availableFields = [
    { value: 'titulo', label: 'DOWNLOAD_MODAL.FIELDS.TITLE' },
    { value: 'ponente', label: 'DOWNLOAD_MODAL.FIELDS.SPEAKER' },
    { value: 'empresaOrganizadora', label: 'DOWNLOAD_MODAL.FIELDS.ORGANIZER' },
    { value: 'tipoEvento', label: 'DOWNLOAD_MODAL.FIELDS.TYPE' },
    { value: 'fecha', label: 'DOWNLOAD_MODAL.FIELDS.DATE' },
    { value: 'horaInicio', label: 'DOWNLOAD_MODAL.FIELDS.START_TIME' },
    { value: 'horaFin', label: 'DOWNLOAD_MODAL.FIELDS.END_TIME' },
    { value: 'lugar', label: 'DOWNLOAD_MODAL.FIELDS.PLACE' },
    { value: 'aula', label: 'DOWNLOAD_MODAL.FIELDS.CLASSROOM' },
    { value: 'descripcion', label: 'DOWNLOAD_MODAL.FIELDS.DESCRIPTION' },
    { value: 'actividad', label: 'DOWNLOAD_MODAL.FIELDS.ACTIVITY' },
    { value: 'adjuntos', label: 'DOWNLOAD_MODAL.FIELDS.ATTACHMENTS' },
    { value: 'enlaces', label: 'DOWNLOAD_MODAL.FIELDS.LINKS' },
    { value: 'servicios', label: 'DOWNLOAD_MODAL.FIELDS.SERVICES' }
  ];

  options: DownloadOptions = {
    formats: {
      json: false,
      csv: false,
      pdf: false,
      word: false
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

  constructor(private translateService: TranslateService) {}

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