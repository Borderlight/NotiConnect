import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface UsuarioAutenticado {
  nombre?: string;
  email: string;
  departamento: string;
  isAuthenticated: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  public usuarioSubject = new BehaviorSubject<UsuarioAutenticado | null>(null); // Temporal público para debugging
  public usuario$ = this.usuarioSubject.asObservable();

  private readonly STORAGE_KEY = 'noticonnect_usuario';

  constructor() {
    // Temporalmente NO cargar desde localStorage para evitar bucles
    // this.cargarUsuarioDesdeStorage();
    
    // Forzar estado inicial sin usuario
    this.usuarioSubject.next(null);
  }

  private cargarUsuarioDesdeStorage(): void {
    try {
      const usuarioGuardado = localStorage.getItem(this.STORAGE_KEY);
      if (usuarioGuardado) {
        const usuario = JSON.parse(usuarioGuardado);
        this.usuarioSubject.next(usuario);
      }
    } catch (error) {
      console.error('Error al cargar usuario desde localStorage:', error);
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }

  private guardarUsuarioEnStorage(usuario: UsuarioAutenticado): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(usuario));
    } catch (error) {
      console.error('Error al guardar usuario en localStorage:', error);
    }
  }

  registrarUsuario(datosRegistro: { nombre: string; email: string; departamento: string; password: string }): Observable<boolean> {
    return new Observable(observer => {
      // Simular registro (aquí integrarías con tu backend)
      try {
        // Verificar si el usuario ya existe
        const usuariosRegistrados = this.obtenerUsuariosRegistrados();
        const usuarioExiste = usuariosRegistrados.some(u => 
          u.email === datosRegistro.email && u.departamento === datosRegistro.departamento
        );

        if (usuarioExiste) {
          observer.error('Ya existe un usuario con este email y departamento');
          return;
        }

        // Guardar nuevo usuario en localStorage
        const nuevoUsuario = {
          nombre: datosRegistro.nombre,
          email: datosRegistro.email,
          departamento: datosRegistro.departamento,
          password: datosRegistro.password // En producción esto debería estar hasheado
        };

        usuariosRegistrados.push(nuevoUsuario);
        localStorage.setItem('noticonnect_usuarios', JSON.stringify(usuariosRegistrados));

        // Autenticar automáticamente después del registro
        const usuarioAutenticado: UsuarioAutenticado = {
          nombre: datosRegistro.nombre,
          email: datosRegistro.email,
          departamento: datosRegistro.departamento,
          isAuthenticated: true
        };

        this.usuarioSubject.next(usuarioAutenticado);
        this.guardarUsuarioEnStorage(usuarioAutenticado);

        observer.next(true);
        observer.complete();
      } catch (error) {
        observer.error('Error en el registro: ' + error);
      }
    });
  }

  iniciarSesion(datosLogin: { email: string; departamento: string; password: string }): Observable<boolean> {
    return new Observable(observer => {
      // Simular login (aquí integrarías con tu backend)
      try {
        const usuariosRegistrados = this.obtenerUsuariosRegistrados();
        const usuario = usuariosRegistrados.find(u => 
          u.email === datosLogin.email && 
          u.departamento === datosLogin.departamento && 
          u.password === datosLogin.password
        );

        if (usuario) {
          const usuarioAutenticado: UsuarioAutenticado = {
            nombre: usuario.nombre,
            email: usuario.email,
            departamento: usuario.departamento,
            isAuthenticated: true
          };

          this.usuarioSubject.next(usuarioAutenticado);
          this.guardarUsuarioEnStorage(usuarioAutenticado);

          observer.next(true);
          observer.complete();
        } else {
          observer.error('Credenciales incorrectas');
        }
      } catch (error) {
        observer.error('Error en el inicio de sesión: ' + error);
      }
    });
  }

  cerrarSesion(): void {
    this.usuarioSubject.next(null);
    localStorage.removeItem(this.STORAGE_KEY);
  }

  // Método para limpiar todo y forzar logout (útil para development)
  limpiarTodo(): void {
    localStorage.removeItem(this.STORAGE_KEY);
    localStorage.removeItem('noticonnect_usuarios');
    this.usuarioSubject.next(null);
  }

  isAuthenticated(): boolean {
    const usuario = this.usuarioSubject.value;
    return usuario !== null && usuario.isAuthenticated;
  }

  getUsuarioActual(): UsuarioAutenticado | null {
    return this.usuarioSubject.value;
  }

  private obtenerUsuariosRegistrados(): any[] {
    try {
      const usuarios = localStorage.getItem('noticonnect_usuarios');
      return usuarios ? JSON.parse(usuarios) : [];
    } catch (error) {
      console.error('Error al obtener usuarios registrados:', error);
      return [];
    }
  }
}
