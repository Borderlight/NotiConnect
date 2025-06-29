// Ejemplo de uso del componente AuthModalComponent
// Este es un ejemplo de cómo integrar el componente de autenticación en cualquier página

import { Component } from '@angular/core';
import { AuthModalComponent, Usuario, LoginData } from '../componentes/auth-modal/auth-modal.component';

@Component({
  selector: 'app-ejemplo-auth',
  standalone: true,
  imports: [AuthModalComponent],
  template: `
    <div class="ejemplo-container">
      <h1>Ejemplo de Autenticación</h1>
      
      <button class="btn-abrir-modal" (click)="abrirModal()">
        Abrir Modal de Autenticación
      </button>
      
      <div *ngIf="usuarioActual" class="usuario-info">
        <h2>Usuario logueado:</h2>
        <p><strong>Nombre:</strong> {{ usuarioActual.nombre || 'No disponible' }}</p>
        <p><strong>Email:</strong> {{ usuarioActual.email }}</p>
        <p><strong>Departamento:</strong> {{ usuarioActual.departamento }}</p>
      </div>
      
      <!-- Componente de autenticación -->
      <app-auth-modal
        [mostrar]="mostrarAuthModal"
        (cerrar)="cerrarAuthModal()"
        (usuarioRegistrado)="onUsuarioRegistrado($event)"
        (usuarioLogueado)="onUsuarioLogueado($event)"
      ></app-auth-modal>
    </div>
  `,
  styles: [`
    .ejemplo-container {
      padding: 20px;
      max-width: 600px;
      margin: 0 auto;
    }
    
    .btn-abrir-modal {
      background-color: #3b82f6;
      color: white;
      padding: 12px 24px;
      border: none;
      border-radius: 8px;
      cursor: pointer;
      font-size: 16px;
      margin-bottom: 20px;
    }
    
    .btn-abrir-modal:hover {
      background-color: #2563eb;
    }
    
    .usuario-info {
      background-color: #f3f4f6;
      padding: 16px;
      border-radius: 8px;
      border-left: 4px solid #10b981;
    }
    
    .usuario-info h2 {
      margin-top: 0;
      color: #065f46;
    }
    
    .usuario-info p {
      margin: 8px 0;
    }
  `]
})
export class EjemploAuthComponent {
  mostrarAuthModal = false;
  usuarioActual: (Usuario | LoginData) | null = null;

  abrirModal() {
    this.mostrarAuthModal = true;
  }

  cerrarAuthModal() {
    this.mostrarAuthModal = false;
  }

  onUsuarioRegistrado(usuario: Usuario) {
    console.log('Usuario registrado:', usuario);
    this.usuarioActual = usuario;
    
    // Aquí puedes añadir la lógica para manejar el registro
    // Por ejemplo: enviar datos al backend, guardar en localStorage, etc.
    
    alert('¡Cuenta creada exitosamente!');
  }

  onUsuarioLogueado(loginData: LoginData) {
    console.log('Usuario logueado:', loginData);
    this.usuarioActual = loginData;
    
    // Aquí puedes añadir la lógica para manejar el login
    // Por ejemplo: autenticar con el backend, guardar token, redirigir, etc.
    
    alert('¡Sesión iniciada exitosamente!');
  }
}

/*
INSTRUCCIONES DE USO:

1. Importar el componente en tu módulo o componente:
   import { AuthModalComponent } from './componentes/auth-modal/auth-modal.component';

2. Añadir a los imports del componente:
   imports: [AuthModalComponent, ...]

3. Añadir el componente en tu template:
   <app-auth-modal
     [mostrar]="mostrarModal"
     (cerrar)="cerrarModal()"
     (usuarioRegistrado)="onRegistro($event)"
     (usuarioLogueado)="onLogin($event)"
   ></app-auth-modal>

4. Implementar los métodos en tu componente:
   - mostrarModal: boolean para controlar la visibilidad
   - cerrarModal(): método para cerrar el modal
   - onRegistro(usuario: Usuario): maneja el evento de registro
   - onLogin(loginData: LoginData): maneja el evento de login

EVENTOS DISPONIBLES:

- usuarioRegistrado: Emite un objeto Usuario con {nombre, email, departamento, contraseña}
- usuarioLogueado: Emite un objeto LoginData con {email, departamento, contraseña}
- cerrar: Emite cuando se cierra el modal

INTERFACES:

Usuario {
  nombre: string;
  email: string;
  departamento: string;
  contraseña: string;
}

LoginData {
  email: string;
  departamento: string;
  contraseña: string;
}

CARACTERÍSTICAS:

✅ Validación de formularios en tiempo real
✅ Campos obligatorios marcados con *
✅ Validación de email
✅ Contraseña mínima de 6 caracteres
✅ Confirmación de contraseña en registro
✅ Mostrar/ocultar contraseña
✅ Lista de departamentos de UPSA
✅ Diseño responsive y accesible
✅ Componente standalone (no requiere módulos)
✅ Textos en español
✅ Animaciones suaves
✅ Manejo de errores
*/
