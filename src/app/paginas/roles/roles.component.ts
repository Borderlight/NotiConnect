import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NavigationService } from '../../servicios/navigation.service';
import { AdministradorService, Administrador } from '../../servicios/administrador.service';
import { EliminarAdminDialogComponent } from '../../componentes/eliminar-admin-dialog/eliminar-admin-dialog.component';

@Component({
  selector: 'app-roles',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, EliminarAdminDialogComponent],
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

  constructor(
    private fb: FormBuilder,
    private navigationService: NavigationService,
    private administradorService: AdministradorService
  ) {
    this.formularioAdmin = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]]
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

  goBack() {
    this.navigationService.goBack();
  }
}
