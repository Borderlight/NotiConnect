import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirmar-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirmar-modal.component.html',
  styleUrls: ['./confirmar-modal.component.css']
})
export class ConfirmarModalComponent {
  @Input() mensaje: string = '';
  @Input() visible: boolean = false;
  @Output() confirmar = new EventEmitter<void>();
  @Output() cancelar = new EventEmitter<void>();

  onConfirmar() {
    this.confirmar.emit();
  }

  onCancelar() {
    this.cancelar.emit();
  }
}

