import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Evento } from '../interfaces/evento.interface';

@Injectable({
  providedIn: 'root'
})
export class EventoService {
  private apiUrl = this.getApiUrl();

  constructor(private http: HttpClient) {}

  private getApiUrl(): string {
    // Si estamos en producción (Render)
    if (window.location.hostname === 'noticonnect.onrender.com') {
      // Intentar primero con el mismo dominio del frontend
      return 'https://noticonnect.onrender.com/api/eventos';
    }
    // Si estamos en un entorno de desarrollo túnel, usar la URL del túnel del backend
    if (window.location.hostname.includes('devtunnels.ms')) {
      return 'https://zd51xrvm-3000.uks1.devtunnels.ms/api/eventos';
    }
    // Para desarrollo local
    return 'http://localhost:3000/api/eventos';
  }

  getEventos(): Observable<Evento[]> {
    return this.http.get<Evento[]>(this.apiUrl);
  }

  getEventoPorId(id: string): Observable<Evento> {
    return this.http.get<Evento>(`${this.apiUrl}/${id}`);
  }

  agregarEvento(data: any): Observable<Evento> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json'
    });
    return this.http.post<Evento>(this.apiUrl, data, { headers });
  }

  actualizarEvento(id: string, evento: Evento): Observable<Evento> {
    return this.http.put<Evento>(`${this.apiUrl}/${id}`, evento);
  }

  eliminarEvento(id: string): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  getEventosFiltrados(filtros: any): Observable<Evento[]> {
    let params = new HttpParams();
    Object.keys(filtros).forEach(key => {
      if (filtros[key] !== undefined && filtros[key] !== null && filtros[key] !== '') {
        params = params.set(key, filtros[key]);
      }
    });
    return this.http.get<Evento[]>(this.apiUrl, { params });
  }
}
