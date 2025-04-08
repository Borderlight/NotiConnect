import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-eliminar-admin-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './eliminar-admin-dialog.component.html',
  styleUrls: ['./eliminar-admin-dialog.component.css']
})
export class EliminarAdminDialogComponent {
  @Input() nombreAdmin: string = '';
  @Output() confirmar = new EventEmitter<void>();
  @Output() cerrar = new EventEmitter<void>();

  cerrarDialog() {
    this.cerrar.emit();
  }

  confirmarEliminacion() {
    this.confirmar.emit();
  }
} 