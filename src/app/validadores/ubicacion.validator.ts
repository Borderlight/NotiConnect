import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export class UbicacionValidator {
  static aulaRequerida(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const lugar = control.parent?.get('lugar')?.value;
      if (lugar === 'Facultad' && (!control.value || control.value === '')) {
        return { required: true };
      }
      return null;
    };
  }

  static horaFinRequerida(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const tipoHorario = control.parent?.get('tipoHorario')?.value;
      if (tipoHorario === 'horario' && (!control.value || control.value === '')) {
        return { required: true };
      }
      return null;
    };
  }

  static horaFinPosterior(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (!control.value) return null;

      const horaInicio = control.parent?.get('horaInicio')?.value;
      if (!horaInicio) return null;

      const inicio = new Date(`1970-01-01T${horaInicio}`);
      const fin = new Date(`1970-01-01T${control.value}`);

      return fin > inicio ? null : { horaFinAnterior: true };
    };
  }
} 