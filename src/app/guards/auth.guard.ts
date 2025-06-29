import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { AuthService } from '../servicios/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  canActivate(): Observable<boolean> {
    return this.authService.usuario$.pipe(
      map(usuario => {
        if (usuario && usuario.isAuthenticated) {
          return true;
        } else {
          // Si no está autenticado, redirigir a la página principal donde aparecerá el modal
          this.router.navigate(['/']);
          return false;
        }
      })
    );
  }
}
