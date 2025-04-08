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

  static gradoRequerido(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const servicio = control.parent?.get('servicios')?.value;
      if (!servicio) return null;

      const esFacultad = servicio.toLowerCase().includes('facultad');
      if (esFacultad && (!control.value || control.value === '')) {
        return { gradoRequerido: true };
      }
      return null;
    };
  }
} 