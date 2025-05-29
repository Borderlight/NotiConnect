import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Evento } from '../../interfaces/evento.interface';
import { EventoService } from '../../servicios/evento.service';
import { NavigationService } from '../../servicios/navigation.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { IdiomaService } from '../../servicios/idioma.service';

@Component({
  selector: 'app-detalles-evento',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './detalles-evento.component.html',
  styleUrls: ['./detalles-evento.component.css']
})
export class DetallesEventoComponent implements OnInit {
  evento?: Evento;
  currentLang: string = 'es';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private eventoService: EventoService,
    private navigationService: NavigationService,
    private idiomaService: IdiomaService
  ) {
    this.idiomaService.obtenerIdiomaActual().subscribe(
      lang => this.currentLang = lang
    );
  }

  goBack(): void {
    this.navigationService.goBack();
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      const eventoEncontrado = this.eventoService.getEventoPorId(id);
      if (eventoEncontrado) {
        this.evento = eventoEncontrado;
      } else {
        this.router.navigate(['/busqueda']);
      }
    } else {
      this.router.navigate(['/busqueda']);
    }
  }
}
