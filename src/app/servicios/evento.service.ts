import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { Evento } from '../interfaces/evento.interface';

@Injectable({
  providedIn: 'root'
})
export class EventoService {
  private apiUrl = this.getApiUrl();

  constructor(private http: HttpClient) {}

  private getApiUrl(): string {
    let url;
    // Si estamos en producción (cualquier dominio que no sea localhost)
    if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
      // Usar URL relativa ya que el backend está en el mismo servidor
      url = '/api/eventos';
    } else {
      // Para desarrollo local
      url = 'http://localhost:3000/api/eventos';
    }
    console.log('🔍 EventoService - URL API:', url, 'Hostname:', window.location.hostname);
    return url;
  }

  getEventos(): Observable<Evento[]> {
    console.log('🔍 EventoService - Obteniendo todos los eventos desde:', this.apiUrl);
    return this.http.get<Evento[]>(this.apiUrl).pipe(
      tap(eventos => console.log('✅ EventoService - Eventos recibidos:', eventos.length)),
      catchError(error => {
        console.error('❌ EventoService - Error al obtener eventos:', error);
        return throwError(() => error);
      })
    );
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
    console.log('🔍 EventoService - Obteniendo eventos filtrados desde:', this.apiUrl, 'Filtros:', filtros);
    return this.http.get<Evento[]>(this.apiUrl, { params }).pipe(
      tap(eventos => console.log('✅ EventoService - Eventos filtrados recibidos:', eventos.length)),
      catchError(error => {
        console.error('❌ EventoService - Error al filtrar eventos:', error);
        return throwError(() => error);
      })
    );
  }
}
