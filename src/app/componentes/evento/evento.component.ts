import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Evento } from '../../interfaces/evento.interface';
import { TranslateModule } from '@ngx-translate/core';
import { IdiomaService } from '../../servicios/idioma.service';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-evento',
  standalone: true,
  imports: [CommonModule, TranslateModule, FormsModule, ReactiveFormsModule],
  templateUrl: './evento.component.html',
  styleUrls: ['./evento.component.css']
})
export class EventoComponent {
  @Input() evento!: Evento;
  @Output() eliminar = new EventEmitter<string>();
  @Output() actualizar = new EventEmitter<Partial<Evento>>();
  @Output() descargarIndividual = new EventEmitter<Evento>();
  currentLang: string = 'es';

  editMode = false;
  editForm!: FormGroup;

  constructor(
    private router: Router,
    private idiomaService: IdiomaService,
    private fb: FormBuilder
  ) {
    this.idiomaService.obtenerIdiomaActual().subscribe(
      lang => this.currentLang = lang
    );
  }

  verDetalles() {
    if (!this.editMode) {
      this.router.navigate(['/detalles-evento', this.evento._id]);
    }
  }

  eliminarEvento(event: Event) {
    event.stopPropagation();
    this.eliminar.emit(this.evento._id);
  }

  editarEvento(event: Event) {
    event.stopPropagation();
    this.editMode = true;
    this.editForm = this.fb.group({
      titulo: [this.evento.titulo, Validators.required],
      ponente: [this.evento.ponente, Validators.required],
      fecha: [this.evento.fecha, Validators.required],
      horaInicio: [this.evento.horaInicio, Validators.required],
      horaFin: [this.evento.horaFin],
      lugar: [this.evento.lugar, Validators.required],
      aula: [this.evento.aula]
    });
  }

  cancelarEdicion(event: Event) {
    event.stopPropagation();
    this.editMode = false;
  }

  guardarEdicion(event: Event) {
    event.stopPropagation();
    if (this.editForm.valid) {
      this.actualizar.emit({
        _id: this.evento._id,
        ...this.editForm.value
      });
      // Actualiza la card localmente para feedback inmediato
      Object.assign(this.evento, this.editForm.value);
      this.editMode = false;
    } else {
      this.editForm.markAllAsTouched();
    }
  }

  descargarEvento(event: Event) {
    event.stopPropagation();
    this.descargarIndividual.emit(this.evento);
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

  private convertirEventoACSV(evento: any): string {
    const headers = Object.keys(evento);
    const values = headers.map(h => {
      let cell = evento[h]?.toString() || '';
      if (cell.includes(',') || cell.includes('"')) {
        cell = `"${cell.replace(/"/g, '""')}"`;
      }
      return cell;
    });
    return headers.join(',') + '\n' + values.join(',');
  }

  private descargarPDF(evento: any) {
    // Solo si jsPDF está disponible
    if (typeof window !== 'undefined' && (window as any).jsPDF) {
      const doc = new (window as any).jsPDF();
      let y = 20;
      doc.setFontSize(16);
      doc.text('Evento', 20, y);
      y += 10;
      doc.setFontSize(12);
      Object.keys(evento).forEach(key => {
        doc.text(`${key}: ${evento[key]}`, 20, y);
        y += 8;
      });
      doc.save(`evento_${evento._id}.pdf`);
    }
  }
}