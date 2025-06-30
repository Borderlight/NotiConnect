import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-eliminar-admin-dialog',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './eliminar-admin-dialog.component.html',
  styleUrls: ['./eliminar-admin-dialog.component.css']
})
export class EliminarAdminDialogComponent {
  @Input() nombreAdmin: string = '';
  @Output() confirmar = new EventEmitter<void>();
  @Output() cerrar = new EventEmitter<void>();

  constructor(private translateService: TranslateService) {}

  cerrarDialog() {
    this.cerrar.emit();
  }

  confirmarEliminacion() {
    this.confirmar.emit();
  }
}
