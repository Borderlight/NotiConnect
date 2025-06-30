import { Component } from '@angular/core';
import { Router, NavigationEnd, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { Location } from '@angular/common';
import { CommonModule } from '@angular/common';
import { IdiomaService } from './servicios/idioma.service';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService, UsuarioAutenticado } from './servicios/auth.service';

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
  usuarioAutenticado: UsuarioAutenticado | null = null;
  mostrarDropdownUsuario = false;

  constructor(
    private router: Router,
    private location: Location,
    private idiomaService: IdiomaService,
    private authService: AuthService
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

    // Suscribirse al estado de autenticación
    this.authService.usuario$.subscribe(usuario => {
      this.usuarioAutenticado = usuario;
    });
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

  toggleDropdownUsuario() {
    this.mostrarDropdownUsuario = !this.mostrarDropdownUsuario;
  }

  cerrarSesion() {
    console.log('Cerrando sesión y redirigiendo a página principal...');
    this.authService.cerrarSesion();
    this.mostrarDropdownUsuario = false;
    // Redirigir a la página principal para mostrar el modal de login
    this.router.navigate(['/']);
  }

  cerrarDropdown() {
    this.mostrarDropdownUsuario = false;
  }
}