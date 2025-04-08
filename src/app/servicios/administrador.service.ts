import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface Administrador {
  id: string;
  nombre: string;
  email: string;
  fechaCreacion: Date;
}

@Injectable({
  providedIn: 'root'
})
export class AdministradorService {
  private administradores: Administrador[] = [];
  private administradoresSubject = new BehaviorSubject<Administrador[]>([]);

  constructor() {
    // Cargar administradores del localStorage al iniciar
    const storedAdmins = localStorage.getItem('administradores');
    if (storedAdmins) {
      this.administradores = JSON.parse(storedAdmins);
      this.administradoresSubject.next(this.administradores);
    }
  }

  getAdministradores(): Observable<Administrador[]> {
    return this.administradoresSubject.asObservable();
  }

  agregarAdministrador(nombre: string, email: string): void {
    const nuevoAdmin: Administrador = {
      id: Date.now().toString(),
      nombre,
      email,
      fechaCreacion: new Date()
    };

    this.administradores.push(nuevoAdmin);
    this.guardarEnLocalStorage();
    this.administradoresSubject.next(this.administradores);
  }

  eliminarAdministrador(id: string): void {
    this.administradores = this.administradores.filter(admin => admin.id !== id);
    this.guardarEnLocalStorage();
    this.administradoresSubject.next(this.administradores);
  }

  buscarAdministradores(termino: string): Administrador[] {
    if (!termino) return this.administradores;
    return this.administradores.filter(admin => 
      admin.nombre.toLowerCase().includes(termino.toLowerCase()) ||
      admin.email.toLowerCase().includes(termino.toLowerCase())
    );
  }

  private guardarEnLocalStorage(): void {
    localStorage.setItem('administradores', JSON.stringify(this.administradores));
  }
} 