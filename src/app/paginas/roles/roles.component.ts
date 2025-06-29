import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AdministradorService, Administrador } from '../../servicios/administrador.service';
import { EliminarAdminDialogComponent } from '../../componentes/eliminar-admin-dialog/eliminar-admin-dialog.component';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, EliminarAdminDialogComponent, TranslateModule],
  templateUrl: './roles.component.html',
  styleUrls: ['./roles.component.css']
})
export class RolesComponent implements OnInit {
  formularioAdmin: FormGroup;
  administradores: Administrador[] = [];
  administradoresFiltrados: Administrador[] = [];
  terminoBusqueda: string = '';
  mostrarDialog: boolean = false;
  adminAEliminar: Administrador | null = null;
  currentLang: string;

  constructor(
    private fb: FormBuilder,
    private administradorService: AdministradorService,
    private translateService: TranslateService
  ) {
    this.formularioAdmin = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]]
    });
    
    this.currentLang = this.translateService.currentLang || this.translateService.getDefaultLang();
    this.translateService.onLangChange.subscribe(event => {
      this.currentLang = event.lang;
    });
  }

  ngOnInit() {
    this.administradorService.getAdministradores().subscribe(admins => {
      this.administradores = admins;
      this.administradoresFiltrados = admins;
    });
  }

  agregarAdministrador() {
    if (this.formularioAdmin.valid) {
      const { nombre, email } = this.formularioAdmin.value;
      this.administradorService.agregarAdministrador(nombre, email);
      this.formularioAdmin.reset();
    }
  }

  abrirDialogEliminar(admin: Administrador) {
    this.adminAEliminar = admin;
    this.mostrarDialog = true;
  }

  cerrarDialog() {
    this.mostrarDialog = false;
    this.adminAEliminar = null;
  }

  confirmarEliminacion() {
    if (this.adminAEliminar) {
      this.administradorService.eliminarAdministrador(this.adminAEliminar.id);
      this.cerrarDialog();
    }
  }

  filtrarAdministradores() {
    this.administradoresFiltrados = this.administradorService.buscarAdministradores(this.terminoBusqueda);
  }
}