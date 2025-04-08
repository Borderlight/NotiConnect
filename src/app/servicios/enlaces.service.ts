import { Injectable } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';

export interface TipoEnlace {
  nombre: string;
  icono: string;
}

@Injectable({
  providedIn: 'root'
})
export class EnlacesService {
  private tiposEnlace: TipoEnlace[] = [
    { nombre: 'Instagram', icono: 'assets/iconos/instagram.svg' },
    { nombre: 'X', icono: 'assets/iconos/x.svg' },
    { nombre: 'TikTok', icono: 'assets/iconos/tiktok.svg' },
    { nombre: 'YouTube', icono: 'assets/iconos/youtube.svg' },
    { nombre: 'LinkedIn', icono: 'assets/iconos/linkedin.svg' }
  ];

  constructor(private fb: FormBuilder) {}

  getTiposEnlace(): TipoEnlace[] {
    return this.tiposEnlace;
  }

  crearEnlace(): FormGroup {
    return this.fb.group({
      tipo: ['', Validators.required],
      url: ['', [Validators.required, Validators.pattern('^https?://.*')]]
    });
  }

  obtenerIcono(tipoEnlace: string): string {
    const tipo = this.tiposEnlace.find(t => t.nombre === tipoEnlace);
    return tipo ? tipo.icono : '';
  }

  requiereEnlaces() {
    return (control: FormArray) => {
      if (!control || !control.length) {
        return { requiereEnlaces: true };
      }
      return null;
    };
  }

  validarUrlPorTipo(control: FormGroup): { [key: string]: any } | null {
    const tipo = control.get('tipo')?.value;
    const url = control.get('url')?.value;

    if (!tipo || !url) return null;

    const urlLowerCase = url.toLowerCase();
    let isValid = true;

    switch (tipo) {
      case 'Instagram':
        isValid = urlLowerCase.includes('instagram.com');
        break;
      case 'X':
        isValid = urlLowerCase.includes('x.com') || urlLowerCase.includes('twitter.com');
        break;
      case 'TikTok':
        isValid = urlLowerCase.includes('tiktok.com');
        break;
      case 'YouTube':
        isValid = urlLowerCase.includes('youtube.com') || urlLowerCase.includes('youtu.be');
        break;
      case 'LinkedIn':
        isValid = urlLowerCase.includes('linkedin.com');
        break;
    }

    return isValid ? null : { urlInvalida: true };
  }
}
