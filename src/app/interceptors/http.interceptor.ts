import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

export const httpErrorInterceptor: HttpInterceptorFn = (req, next) => {
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      let errorMessage = 'Error desconocido';
      
      if (error.status === 413) {
        errorMessage = 'El archivo es demasiado grande. Por favor, reduce el tamaño de las imágenes o archivos adjuntos.';
      } else if (error.status === 0) {
        errorMessage = 'Error de conexión. Verifica tu conexión a internet.';
      } else if (error.status >= 500) {
        errorMessage = 'Error del servidor. Inténtalo de nuevo más tarde.';
      } else if (error.error && error.error.message) {
        errorMessage = error.error.message;
      }
      
      console.error('Error HTTP:', error);
      console.error('Mensaje de error:', errorMessage);
      
      return throwError(() => ({
        ...error,
        userMessage: errorMessage
      }));
    })
  );
};
