import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { TraductorService } from '../../servicios/traductor.service';
import { TemaService } from '../../servicios/tema.service';

interface Idioma {
  codigo: string;
  nombre: string;
}

@Component({
  selector: 'app-ajustes',
  templateUrl: './ajustes.component.html',
  styleUrls: ['./ajustes.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule]
})
export class AjustesComponent implements OnInit {
  modoOscuro: boolean = false;
  idiomaSeleccionado: string = 'es';
  idiomas: Idioma[] = [];

  constructor(
    private temaService: TemaService,
    private traductorService: TraductorService
  ) {}

  ngOnInit() {
    this.temaService.getModoOscuro().subscribe(
      modoOscuro => this.modoOscuro = modoOscuro
    );

    // Cargar idiomas disponibles desde Google Cloud al iniciar
    this.traductorService.obtenerIdiomas().subscribe(respuesta => {
      if (respuesta && respuesta.data && respuesta.data.languages) {
        this.idiomas = respuesta.data.languages.map((idioma: any) => ({
          codigo: idioma.language,
          nombre: idioma.name
        }));
      }
    });
  }

  toggleModoOscuro() {
    this.temaService.toggleModoOscuro();
  }

  traducirElementos(evento: Event) {
    const idiomaSeleccionado = (evento.target as HTMLSelectElement).value;
    this.idiomaSeleccionado = idiomaSeleccionado;

    const elementosATraducir: NodeListOf<HTMLElement> = document.querySelectorAll('[data-traduccion]');

    elementosATraducir.forEach((elemento: HTMLElement) => {
      const textoOriginal = elemento.getAttribute('data-original-text') || elemento.textContent || '';
      elemento.setAttribute('data-original-text', textoOriginal);

      this.traductorService.traducir(textoOriginal, idiomaSeleccionado).subscribe(respuesta => {
        const textoTraducido = respuesta.data.translations[0].translatedText;
        elemento.textContent = textoTraducido;
      });
    });
  }
}
