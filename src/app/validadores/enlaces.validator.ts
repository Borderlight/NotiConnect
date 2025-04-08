import { AbstractControl, ValidationErrors, ValidatorFn, FormArray } from '@angular/forms';

export class EnlacesValidator {
  private static socialMediaPatterns: { [key: string]: RegExp } = {
    'Instagram': /^https?:\/\/(www\.)?instagram\.com/,
    'X': /^https?:\/\/(www\.)?(twitter\.com|x\.com)/,
    'TikTok': /^https?:\/\/(www\.)?tiktok\.com/,
    'YouTube': /^https?:\/\/(www\.)?youtube\.com/,
    'LinkedIn': /^https?:\/\/(www\.)?linkedin\.com/,
    'Periódico': /^https?:\/\//,
    'Otros': /^https?:\/\//
  };

  static urlValida(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      return /^https?:\/\/.+/.test(control.value) ? null : { urlInvalida: true };
    };
  }

  static socialMediaUrl(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      
      const tipo = control.parent?.get('tipo')?.value;
      if (!tipo || !EnlacesValidator.socialMediaPatterns[tipo]) return null;

      return EnlacesValidator.socialMediaPatterns[tipo].test(control.value) 
        ? null 
        : { invalidSocialMediaUrl: { tipo } };
    };
  }

  static requiereEnlaces(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!(control instanceof FormArray)) return null;

      const enlaces = control as FormArray;
      if (enlaces.length === 0) return { requiereEnlaces: true };

      const enlacesValidos = enlaces.controls.some(enlace => 
        enlace.get('tipo')?.value && 
        enlace.get('url')?.value && 
        !enlace.errors
      );

      return enlacesValidos ? null : { requiereEnlaces: true };
    };
  }
} 