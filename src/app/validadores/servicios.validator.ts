import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class ServiciosValidator {
  static servicioSeleccionado(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value || control.value === '') {
        return { servicioVacio: true };
      }
      return null;
    };
  }
}