import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { TemaService } from '../../servicios/tema.service';
import { IdiomaService } from '../../servicios/idioma.service';
import { TranslateModule } from '@ngx-translate/core';

interface Idioma {
  codigo: string;
  nombre: string;
  bandera: string;
}

@Component({
  selector: 'app-ajustes',
  templateUrl: './ajustes.component.html',
  styleUrls: ['./ajustes.component.css'],
  standalone: true,
  imports: [FormsModule, CommonModule, HttpClientModule, TranslateModule]
})
export class AjustesComponent implements OnInit {
  modoOscuro: boolean = false;
  idiomaSeleccionado: string = 'es';
  idiomas: Idioma[] = [
    { codigo: 'es', nombre: 'COMMON.SPANISH', bandera: '🇪🇸' },
    { codigo: 'en', nombre: 'COMMON.ENGLISH', bandera: '🇬🇧' },
    { codigo: 'fr', nombre: 'COMMON.FRENCH', bandera: '🇫🇷' }
  ];

  constructor(
    private temaService: TemaService,
    private idiomaService: IdiomaService
  ) {}

  ngOnInit() {
    this.temaService.getModoOscuro().subscribe(
      modoOscuro => this.modoOscuro = modoOscuro
    );

    this.idiomaService.obtenerIdiomaActual().subscribe(
      idioma => this.idiomaSeleccionado = idioma
    );
  }

  toggleModoOscuro() {
    this.temaService.toggleModoOscuro();
  }

  cambiarIdioma(evento: Event) {
    const idiomaSeleccionado = (evento.target as HTMLSelectElement).value;
    this.idiomaService.cambiarIdioma(idiomaSeleccionado);
  }

  getBanderaPorCodigo(codigo: string): string {
    const idioma = this.idiomas.find(i => i.codigo === codigo);
    return idioma ? idioma.bandera : '';
  }
}