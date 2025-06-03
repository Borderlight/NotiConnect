import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Evento } from '../../interfaces/evento.interface';
import { TranslateModule } from '@ngx-translate/core';
import { IdiomaService } from '../../servicios/idioma.service';

@Component({
  selector: 'app-evento',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './evento.component.html',
  styleUrls: ['./evento.component.css']
})
export class EventoComponent {
  @Input() evento!: Evento;
  @Output() eliminar = new EventEmitter<string>();
  currentLang: string = 'es';

  constructor(
    private router: Router,
    private idiomaService: IdiomaService
  ) {
    this.idiomaService.obtenerIdiomaActual().subscribe(
      lang => this.currentLang = lang
    );
  }

  verDetalles() {
    this.router.navigate(['/detalles-evento', this.evento._id]);
  }

  eliminarEvento(event: Event) {
    event.stopPropagation(); // Evitar que se propague al click del contenedor
    this.eliminar.emit(this.evento._id);
  }
}