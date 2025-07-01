import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OpcionesSincronizadasService {
  private departamentosSubject = new BehaviorSubject<string[]>([]);
  private actividadesSubject = new BehaviorSubject<string[]>([]);
  private lugaresSubject = new BehaviorSubject<string[]>([]);

  // Departamentos base
  private departamentosBase = [
    'Biblioteca',
    'UCCI', 
    'GIT',
    'Facultad',
    'Formación Permanente',
    'Internacionales'
  ];

  // Actividades base
  private actividadesBase = ['Semana de la Ciencia'];

  // Lugares base
  private lugaresBase = [
    'Facultad', 'Aula de grado', 'Biblioteca', 'HUB de Innovación', 
    'Auditorio Juan Pablo II', 'S-41', 'Online'
  ];

  constructor() {
    this.cargarDatos();
  }

  private cargarDatos(): void {
    // Cargar departamentos
    const departamentosCustom = localStorage.getItem('departamentosPersonalizados');
    const departamentos = departamentosCustom ? JSON.parse(departamentosCustom) : [];
    this.departamentosSubject.next([...this.departamentosBase, ...departamentos]);

    // Cargar actividades
    const actividadesCustom = localStorage.getItem('actividadesPersonalizadas');
    const actividades = actividadesCustom ? JSON.parse(actividadesCustom) : [];
    this.actividadesSubject.next([...this.actividadesBase, ...actividades]);

    // Cargar lugares personalizados
    const lugaresCustom = localStorage.getItem('lugaresPersonalizados');
    const lugares = lugaresCustom ? JSON.parse(lugaresCustom) : [];
    this.lugaresSubject.next([...this.lugaresBase, ...lugares]);
  }

  // Observables para que los componentes se suscriban
  getDepartamentos(): Observable<string[]> {
    return this.departamentosSubject.asObservable();
  }

  getActividades(): Observable<string[]> {
    return this.actividadesSubject.asObservable();
  }

  getLugares(): Observable<string[]> {
    return this.lugaresSubject.asObservable();
  }

  // Métodos para agregar nuevas opciones
  agregarDepartamento(departamento: string): void {
    const departamentosActuales = this.departamentosSubject.value;
    if (!departamentosActuales.includes(departamento)) {
      const nuevoDepartamentos = [...departamentosActuales, departamento];
      this.departamentosSubject.next(nuevoDepartamentos);
      
      // Actualizar localStorage
      const customDepartamentos = nuevoDepartamentos.filter(d => !this.departamentosBase.includes(d));
      localStorage.setItem('departamentosPersonalizados', JSON.stringify(customDepartamentos));
    }
  }

  agregarActividad(actividad: string): void {
    const actividadesActuales = this.actividadesSubject.value;
    if (!actividadesActuales.includes(actividad)) {
      const nuevasActividades = [...actividadesActuales, actividad];
      this.actividadesSubject.next(nuevasActividades);
      
      // Actualizar localStorage
      const customActividades = nuevasActividades.filter(a => !this.actividadesBase.includes(a));
      localStorage.setItem('actividadesPersonalizadas', JSON.stringify(customActividades));
    }
  }

  agregarLugar(lugar: string): void {
    const lugaresActuales = this.lugaresSubject.value;
    if (!lugaresActuales.includes(lugar)) {
      const nuevosLugares = [...lugaresActuales, lugar];
      this.lugaresSubject.next(nuevosLugares);
      
      // Guardar en localStorage solo los lugares personalizados
      const customLugares = nuevosLugares.filter(l => !this.lugaresBase.includes(l));
      localStorage.setItem('lugaresPersonalizados', JSON.stringify(customLugares));
    }
  }

  // Método para recargar desde localStorage (útil cuando se actualizan)
  recargarDatos(): void {
    this.cargarDatos();
  }
}

