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

  // Campos organizados en dos columnas
  leftColumnFields = [
    { value: 'titulo', label: 'DOWNLOAD_MODAL.FIELDS.TITLE' },
    { value: 'tipoEvento', label: 'DOWNLOAD_MODAL.FIELDS.TYPE' },
    { value: 'departamento', label: 'DOWNLOAD_MODAL.FIELDS.DEPARTMENT' },
    { value: 'descripcion', label: 'DOWNLOAD_MODAL.FIELDS.DESCRIPTION' },
    { 
      value: 'ubicaciones', 
      label: 'DOWNLOAD_MODAL.FIELDS.LOCATIONS',
      isGroup: true,
      subFields: [
        { value: 'fecha', label: 'DOWNLOAD_MODAL.FIELDS.DATE' },
        { value: 'horaInicio', label: 'DOWNLOAD_MODAL.FIELDS.START_TIME' },
        { value: 'horaFin', label: 'DOWNLOAD_MODAL.FIELDS.END_TIME' },
        { value: 'lugar', label: 'DOWNLOAD_MODAL.FIELDS.PLACE' }
      ]
    }
  ];

  rightColumnFields = [
    { value: 'ponente', label: 'DOWNLOAD_MODAL.FIELDS.SPEAKER' },
    { value: 'actividad', label: 'DOWNLOAD_MODAL.FIELDS.ACTIVITY' },
    { value: 'servicios', label: 'DOWNLOAD_MODAL.FIELDS.SERVICES' },
    { value: 'enlaces', label: 'DOWNLOAD_MODAL.FIELDS.LINKS' },
    { value: 'adjuntos', label: 'DOWNLOAD_MODAL.FIELDS.ATTACHMENTS' }
  ];

  // Control para mostrar/ocultar subfields de ubicaciones
  mostrarSubcamposUbicaciones = false;

  options: DownloadOptions = {
    formats: {
      json: false,
      csv: false,
      pdf: false,
      word: false
    },
    fields: {
      titulo: false,
      tipoEvento: false,
      departamento: false,
      descripcion: false,
      ubicaciones: false,
      fecha: false,
      horaInicio: false,
      horaFin: false,
      lugar: false,
      ponente: false,
      actividad: false,
      servicios: false,
      enlaces: false,
      adjuntos: false
    }
  };

  constructor(private translateService: TranslateService) {}

  // Método para manejar el checkbox agrupador de ubicaciones
  onUbicacionesChange(value: boolean) {
    this.options.fields['ubicaciones'] = value;
    
    // Si se marca el grupo, marcar todos los subcampos
    if (value) {
      this.options.fields['fecha'] = true;
      this.options.fields['horaInicio'] = true;
      this.options.fields['horaFin'] = true;
      this.options.fields['lugar'] = true;
    } else {
      // Si se desmarca el grupo, desmarcar todos los subcampos
      this.options.fields['fecha'] = false;
      this.options.fields['horaInicio'] = false;
      this.options.fields['horaFin'] = false;
      this.options.fields['lugar'] = false;
    }
  }

  // Método para manejar cambios en subcampos de ubicaciones
  onSubcampoUbicacionChange() {
    const subcampos = ['fecha', 'horaInicio', 'horaFin', 'lugar'];
    const todosMarcados = subcampos.every(campo => this.options.fields[campo]);
    const algunoMarcado = subcampos.some(campo => this.options.fields[campo]);
    
    // Si todos están marcados, marcar el grupo
    if (todosMarcados) {
      this.options.fields['ubicaciones'] = true;
    } else if (!algunoMarcado) {
      // Si ninguno está marcado, desmarcar el grupo
      this.options.fields['ubicaciones'] = false;
    } else {
      // Si algunos están marcados pero no todos, desmarcar el grupo
      this.options.fields['ubicaciones'] = false;
    }
  }

  // Método para alternar la visibilidad de subcampos
  toggleSubcamposUbicaciones() {
    this.mostrarSubcamposUbicaciones = !this.mostrarSubcamposUbicaciones;
  }

  // Getter para verificar si hay algún subcampo de ubicación marcado
  get tieneSubcamposMarcados(): boolean {
    return this.options.fields['fecha'] || 
           this.options.fields['horaInicio'] || 
           this.options.fields['horaFin'] || 
           this.options.fields['lugar'];
  }

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