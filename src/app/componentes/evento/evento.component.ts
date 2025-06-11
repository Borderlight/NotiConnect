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
}