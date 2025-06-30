import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-progreso-subida',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="progreso-overlay" *ngIf="mostrar">
      <div class="progreso-modal">
        <h3>{{ titulo }}</h3>
        <div class="progreso-barra">
          <div class="progreso-relleno" [style.width.%]="progreso"></div>
        </div>
        <p>{{ mensaje }}</p>
        <p class="progreso-porcentaje">{{ progreso }}%</p>
      </div>
    </div>
  `,
  styles: [`
    .progreso-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.7);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 9999;
    }

    .progreso-modal {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      min-width: 300px;
      text-align: center;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    }

    .progreso-barra {
      width: 100%;
      height: 20px;
      background-color: #f0f0f0;
      border-radius: 10px;
      overflow: hidden;
      margin: 1rem 0;
    }

    .progreso-relleno {
      height: 100%;
      background: linear-gradient(90deg, #4CAF50, #45a049);
      transition: width 0.3s ease;
      border-radius: 10px;
    }

    .progreso-porcentaje {
      font-weight: bold;
      color: #4CAF50;
      font-size: 1.2em;
    }

    h3 {
      margin-top: 0;
      color: #333;
    }

    p {
      margin: 0.5rem 0;
      color: #666;
    }
  `]
})
export class ProgresoSubidaComponent {
  @Input() mostrar: boolean = false;
  @Input() progreso: number = 0;
  @Input() titulo: string = 'Procesando...';
  @Input() mensaje: string = 'Por favor, espera mientras se procesan los archivos.';
}

