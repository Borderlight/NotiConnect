import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class BasicosValidator {
  static soloLetrasYEspacios(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const pattern = /^[a-zA-ZáéíóúñÁÉÍÓÚÑ\s]+$/;
      return pattern.test(control.value) ? null : { soloLetras: true };
    };
  }

  static descripcionMinima(minLength: number): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;
      return control.value.length >= minLength ? null : { 
        minLength: {
          required: minLength,
          actual: control.value.length
        }
      };
    };
  }

  static adjuntosRequeridos(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return { required: true };
      return null;
    };
  }
} 