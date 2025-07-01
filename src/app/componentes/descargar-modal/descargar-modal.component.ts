import { Component, EventEmitter, Input, Output, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
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
  imports: [CommonModule, FormsModule],
  templateUrl: './descargar-modal.component.html',
  styleUrls: ['./descargar-modal.component.css']
})
export class DescargarModalComponent implements OnInit {
  @Input() eventos: Evento[] = [];
  @Output() cerrar = new EventEmitter<void>();
  @Output() descargar = new EventEmitter<DownloadOptions>();

  // Campos organizados en dos columnas
  leftColumnFields = [
    { value: 'titulo', label: 'Título' },
    { value: 'tipoEvento', label: 'Tipo de evento' },
    { value: 'departamento', label: 'Departamento' },
    { value: 'numeroParticipantes', label: 'Número de participantes' },
    { value: 'descripcion', label: 'Descripción' },
    { 
      value: 'ubicaciones', 
      label: 'Ubicaciones',
      isGroup: true,
      subFields: [
        { value: 'fecha', label: 'Fecha' },
        { value: 'horaInicio', label: 'Hora de inicio' },
        { value: 'horaFin', label: 'Hora de fin' },
        { value: 'lugar', label: 'Lugar' }
      ]
    }
  ];

  rightColumnFields = [
    { value: 'ponente', label: 'Ponente' },
    { value: 'actividad', label: 'Actividad relacionada' },
    { value: 'servicios', label: 'Servicios' },
    { value: 'enlaces', label: 'Enlaces' },
    { value: 'adjuntos', label: 'Archivos adjuntos' }
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
      numeroParticipantes: false,
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

  constructor() {}

  ngOnInit() {
    // Componente inicializado con textos en español
  }

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
