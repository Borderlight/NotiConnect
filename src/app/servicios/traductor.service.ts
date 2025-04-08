import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TraductorService {
  private apiKey = 'AIzaSyChoi656qGQl60VA0HytNFBglICLq7T14M'
  private apiUrl = 'https://translation.googleapis.com/language/translate/v2'

  constructor(private http: HttpClient) { }

  public obtenerIdiomas(): Observable<any> {
    const url = `${this.apiUrl}/languages?key=${this.apiKey}&target=es`;
    return this.http.get(url);
  }

  traducir(texto: string, targetLang: string): Observable<any> {
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
  }
}
