import { Component, OnInit, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { AuthModalComponent, Usuario, LoginData } from '../../componentes/auth-modal/auth-modal.component';
import { AuthService, UsuarioAutenticado } from '../../servicios/auth.service';

@Component({
  selector: 'app-pagina-principal',
  templateUrl: './pagina-principal.component.html',
  styleUrls: ['./pagina-principal.component.css'],
  standalone: true,
  imports: [RouterLink, TranslateModule, CommonModule, AuthModalComponent]
})
export class PaginaPrincipalComponent implements OnInit {
  @ViewChild(AuthModalComponent) authModal!: AuthModalComponent;
  
  usuarioAutenticado: UsuarioAutenticado | null = null;
  mostrarAuthModal = false;

  constructor(private authService: AuthService) {}

  ngOnInit() {
    // Inicialmente mostrar el modal hasta que se autentique
    this.mostrarAuthModal = true;
    
    // Verificar si hay usuario autenticado
    this.authService.usuario$.subscribe(usuario => {
      this.usuarioAutenticado = usuario;
      
      // Solo actualizar el modal si no está siendo gestionado manualmente
      if (usuario && usuario.isAuthenticated) {
        this.mostrarAuthModal = false;
      } else if (!usuario) {
        this.mostrarAuthModal = true;
      }
    });
  }

  onUsuarioRegistrado(usuario: Usuario) {
    this.authService.registrarUsuario(usuario).subscribe({
      next: (success) => {
        if (success) {
          console.log('Usuario registrado exitosamente');
          // NO cerrar modal aquí - el modal cambiará a modo login automáticamente
          // El modal se cerrará solo cuando se haga login
        }
      },
      error: (error) => {
        console.error('Error en el registro:', error);
        alert('Error en el registro: ' + error);
      }
    });
  }

  onUsuarioLogueado(loginData: LoginData) {
    console.log('PaginaPrincipal - Intentando login con:', loginData);
    this.authService.iniciarSesion(loginData).subscribe({
      next: (success) => {
        console.log('PaginaPrincipal - Login result:', success);
        if (success) {
          console.log('Usuario logueado exitosamente');
          this.authModal?.limpiarFormulario();
          // No cerrar manualmente el modal aquí, dejar que la suscripción lo haga
        }
      },
      error: (error) => {
        console.error('Error en el login:', error);
        alert('Credenciales incorrectas. Verifique su email, departamento y contraseña.');
      }
    });
  }

  // NO permitir cerrar el modal hasta que se complete el login
  onCerrarAuthModal() {
    // Solo cerrar si hay usuario autenticado
    if (this.usuarioAutenticado) {
      this.mostrarAuthModal = false;
    }
    // Si no hay usuario, no hacer nada (modal permanece abierto)
  }
}