import { Component } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Location } from '@angular/common';
import { CommonModule } from '@angular/common';
import { IdiomaService } from './servicios/idioma.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, CommonModule, TranslateModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'NotiConnect';
  mostrarBotonVolver = false;
  idiomaActual = 'es';

  constructor(
    private router: Router,
    private location: Location,
    private idiomaService: IdiomaService
  ) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      // No mostrar el botón en la página principal
      this.mostrarBotonVolver = this.router.url !== '/';
    });

    this.idiomaService.obtenerIdiomaActual().subscribe(
      lang => this.idiomaActual = lang
    );
  }

  navegarInicio() {
    this.router.navigate(['/']);
  }

  volver() {
    this.location.back();
  }

  cambiarIdioma(event: Event) {
    const select = event.target as HTMLSelectElement;
    this.idiomaService.cambiarIdioma(select.value);
  }
}