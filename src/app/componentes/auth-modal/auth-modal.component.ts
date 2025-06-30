import { Component, OnInit, Output, EventEmitter, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, AbstractControl } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { OpcionesSincronizadasService } from '../../servicios/opciones-sincronizadas.service';

export interface Usuario {
  nombre: string;
  email: string;
  departamento: string;
  password: string;
}

export interface LoginData {
  email: string;
  departamento: string;
  password: string;
}

@Component({
  selector: 'app-auth-modal',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './auth-modal.component.html',
  styleUrls: ['./auth-modal.component.css']
})
export class AuthModalComponent implements OnInit {
  @Input() mostrar = false;
  @Output() cerrar = new EventEmitter<void>();
  @Output() usuarioRegistrado = new EventEmitter<Usuario>();
  @Output() usuarioLogueado = new EventEmitter<LoginData>();

  modoRegistro = false; // false = login (por defecto), true = registro
  formulario: FormGroup;
  mostrarPassword = false;
  mostrarConfirmarPassword = false;
  
  departamentos: string[] = [];

  constructor(
    private fb: FormBuilder,
    private translate: TranslateService,
    private opcionesSincronizadasService: OpcionesSincronizadasService
  ) {
    this.formulario = this.crearFormulario();
  }

  ngOnInit() {
    // Recrear el formulario cuando cambie el modo
    this.formulario = this.crearFormulario();
    
    // Cargar departamentos sincronizados
    this.opcionesSincronizadasService.getDepartamentos().subscribe(
      departamentos => this.departamentos = departamentos
    );
  }

  private crearFormulario(): FormGroup {
    if (this.modoRegistro) {
      return this.fb.group({
        nombre: ['', [Validators.required, Validators.minLength(2)]],
        email: ['', [Validators.required, Validators.email]],
        departamento: ['', Validators.required],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirmarPassword: ['', Validators.required]
      }, { validators: this.validadorPasswords });
    } else {
      return this.fb.group({
        email: ['', [Validators.required, Validators.email]],
        departamento: ['', Validators.required],
        password: ['', Validators.required]
      });
    }
  }

  // Validador personalizado para confirmar contraseñas
  private validadorPasswords(control: AbstractControl): {[key: string]: any} | null {
    const password = control.get('password');
    const confirmarPassword = control.get('confirmarPassword');
    
    if (!password || !confirmarPassword) {
      return null;
    }
    
    return password.value === confirmarPassword.value ? null : { 'passwordsNoCoinciden': true };
  }

  cambiarModo() {
    this.modoRegistro = !this.modoRegistro;
    this.formulario = this.crearFormulario();
    this.mostrarPassword = false;
    this.mostrarConfirmarPassword = false;
  }

  // Método específico para cambiar a modo login después del registro
  cambiarAModoLogin() {
    this.modoRegistro = false;
    this.formulario = this.crearFormulario();
    this.mostrarPassword = false;
    this.mostrarConfirmarPassword = false;
  }

  toggleMostrarPassword() {
    this.mostrarPassword = !this.mostrarPassword;
  }

  toggleMostrarConfirmarPassword() {
    this.mostrarConfirmarPassword = !this.mostrarConfirmarPassword;
  }

  onSubmit() {
    if (this.formulario.valid) {
      if (this.modoRegistro) {
        const usuario: Usuario = {
          nombre: this.formulario.value.nombre,
          email: this.formulario.value.email,
          departamento: this.formulario.value.departamento,
          password: this.formulario.value.password
        };
        this.usuarioRegistrado.emit(usuario);
        // Después del registro exitoso, cambiar a modo login
        this.cambiarAModoLogin();
      } else {
        const loginData: LoginData = {
          email: this.formulario.value.email,
          departamento: this.formulario.value.departamento,
          password: this.formulario.value.password
        };
        this.usuarioLogueado.emit(loginData);
      }
      // NO cerrar modal aquí - se cerrará desde el componente padre cuando el login sea exitoso
    } else {
      // Marcar todos los campos como tocados para mostrar errores
      Object.keys(this.formulario.controls).forEach(key => {
        this.formulario.get(key)?.markAsTouched();
      });
    }
  }

  cerrarModal() {
    // No hacer nada - el modal no se puede cerrar hasta autenticarse
    // Solo resetear formulario en caso de éxito en autenticación
  }

  // Método para limpiar el formulario cuando la autenticación sea exitosa
  limpiarFormulario() {
    this.formulario.reset();
    this.mostrarPassword = false;
    this.mostrarConfirmarPassword = false;
  }

  // Métodos de validación para el template
  esCampoInvalido(campo: string): boolean {
    const control = this.formulario.get(campo);
    return !!(control && control.invalid && control.touched);
  }

  obtenerErrorCampo(campo: string): string {
    const control = this.formulario.get(campo);
    if (!control || !control.errors || !control.touched) return '';

    if (control.errors['required']) {
      return 'Este campo es obligatorio';
    }
    if (control.errors['email']) {
      return 'Ingrese un email válido';
    }
    if (control.errors['minlength']) {
      const minLength = control.errors['minlength'].requiredLength;
      if (campo === 'nombre') {
        return `El nombre debe tener al menos ${minLength} caracteres`;
      }
      if (campo === 'password') {
        return `La contraseña debe tener al menos ${minLength} caracteres`;
      }
    }
    return '';
  }

  obtenerErrorPasswords(): string {
    if (this.formulario.errors?.['passwordsNoCoinciden'] && 
        this.formulario.get('confirmarPassword')?.touched) {
      return 'Las contraseñas no coinciden';
    }
    return '';
  }
}

