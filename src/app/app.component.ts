import { Component } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Location } from '@angular/common';
import { TraductorService } from './servicios/traductor.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'NotiConnect';
  mostrarBotonVolver = false;
  
  constructor(
    private router: Router,
    private location: Location
  ) {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      // No mostrar el botón en la página principal
      this.mostrarBotonVolver = this.router.url !== '/';
    });
  }

  navegarInicio() {
    this.router.navigate(['/']);
  }

  volver() {
    this.location.back();
  }
}
