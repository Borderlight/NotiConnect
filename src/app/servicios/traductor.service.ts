import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TraductorService {
  // TODO: Mover a variables de entorno
  private apiKey = 'YOUR_API_KEY' // Quitada por seguridad
  private apiUrl = 'https://translation.googleapis.com/language/translate/v2'

  constructor(private http: HttpClient) { }

  // Método para obtener los idiomas disponibles
  public obtenerIdiomas(): Observable<any> {
    // Comentado temporalmente
    /* 
    const url = `${this.apiUrl}/languages?key=${this.apiKey}&target=es`;
    return this.http.get(url);
    */
    return new Observable(); // Devuelve observable vacío mientras está comentado
  }

  // Método para traducir texto
  traducir(texto: string, targetLang: string): Observable<any> {
    // Comentado temporalmente
    /*
    const url = this.apiUrl + '?key=' + this.apiKey;
    const headers = new HttpHeaders({ 
      'Content-Type': 'application/json'  
    });

    const body = {
      q: texto,
      target: targetLang,
      format: 'text'
    };

    return this.http.post(url, body, { headers });
    */
    return new Observable(); // Devuelve observable vacío mientras está comentado
  }
}