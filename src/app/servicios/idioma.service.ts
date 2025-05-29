import { Injectable } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class IdiomaService {
  private readonly LANG_KEY = 'selectedLanguage';
  private currentLang = new BehaviorSubject<string>('es');

  constructor(private translate: TranslateService) {
    // Idiomas soportados
    translate.addLangs(['es', 'en', 'fr']);
    
    // Idioma por defecto
    translate.setDefaultLang('es');
    
    // Intentar obtener el idioma guardado
    const savedLang = localStorage.getItem(this.LANG_KEY);
    
    if (savedLang && translate.getLangs().includes(savedLang)) {
      // Si hay un idioma guardado y es válido, usarlo
      translate.use(savedLang);
      this.currentLang.next(savedLang);
    } else {
      // Si no hay idioma guardado, intentar usar el del navegador
      const browserLang = translate.getBrowserLang();
      const lang = browserLang?.match(/es|en|fr/) ? browserLang : 'es';
      translate.use(lang);
      this.currentLang.next(lang);
      localStorage.setItem(this.LANG_KEY, lang);
    }
  }

  // Cambiar idioma
  cambiarIdioma(lang: string) {
    if (this.translate.getLangs().includes(lang)) {
      this.translate.use(lang);
      this.currentLang.next(lang);
      localStorage.setItem(this.LANG_KEY, lang);
    }
  }

  // Obtener idioma actual
  obtenerIdiomaActual() {
    return this.currentLang.asObservable();
  }
}
