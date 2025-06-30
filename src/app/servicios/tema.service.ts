import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TemaService {
  private modoOscuroKey = 'modoOscuro';
  private modoOscuroSubject = new BehaviorSubject<boolean>(this.getModoOscuroGuardado());

  constructor() {
    // Aplicar el tema guardado al iniciar
    this.aplicarTema(this.modoOscuroSubject.value);
  }

  private getModoOscuroGuardado(): boolean {
    const guardado = localStorage.getItem(this.modoOscuroKey);
    return guardado ? JSON.parse(guardado) : false;
  }

  toggleModoOscuro(): void {
    const nuevoModo = !this.modoOscuroSubject.value;
    this.modoOscuroSubject.next(nuevoModo);
    localStorage.setItem(this.modoOscuroKey, JSON.stringify(nuevoModo));
    this.aplicarTema(nuevoModo);
  }

  getModoOscuro() {
    return this.modoOscuroSubject.asObservable();
  }

  private aplicarTema(modoOscuro: boolean): void {
    if (modoOscuro) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }
} 
