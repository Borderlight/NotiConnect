import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CompresionService {

  constructor() { }

  
  async comprimirImagen(file: File, maxWidth: number = 1920, maxHeight: number = 1080, quality: number = 0.8): Promise<string> {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calcular nuevas dimensiones manteniendo la proporción
        let { width, height } = this.calcularNuevasDimensiones(img.width, img.height, maxWidth, maxHeight);
        
        canvas.width = width;
        canvas.height = height;

        // Dibujar la imagen redimensionada
        ctx?.drawImage(img, 0, 0, width, height);

        // Convertir a base64 con compresión
        const dataUrl = canvas.toDataURL('image/jpeg', quality);
        // Extraer solo la parte base64, removiendo el prefijo data:image/jpeg;base64,
        const base64Only = dataUrl.split(',')[1];
        resolve(base64Only);
      };

      img.onerror = () => reject(new Error('Error al cargar la imagen'));

      // Crear URL del objeto para la imagen
      img.src = URL.createObjectURL(file);
    });
  }

  
  private calcularNuevasDimensiones(originalWidth: number, originalHeight: number, maxWidth: number, maxHeight: number): { width: number, height: number } {
    let width = originalWidth;
    let height = originalHeight;

    // Si la imagen es más grande que los límites, redimensionar
    if (width > maxWidth || height > maxHeight) {
      const ratio = Math.min(maxWidth / width, maxHeight / height);
      width = Math.floor(width * ratio);
      height = Math.floor(height * ratio);
    }

    return { width, height };
  }

  
  esImagen(file: File): boolean {
    return file.type.startsWith('image/');
  }

  
  obtenerTamanoBase64(base64: string): number {
    // Si viene con prefijo, removerlo
    const base64Data = base64.includes(',') ? base64.split(',')[1] : base64;
    // Calcular el tamaño aproximado (cada carácter base64 representa 6 bits)
    return Math.ceil(base64Data.length * 3 / 4);
  }

  
  formatearTamano(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  
  async comprimirArchivos(files: FileList, progressCallback?: (progreso: number) => void): Promise<Array<{name: string, type: string, size: number, data: string}>> {
    const archivosComprimidos: Array<{name: string, type: string, size: number, data: string}> = [];
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      let base64Data: string;

      if (this.esImagen(file)) {
        // OPTIMIZACIÓN: Solo comprimir imágenes grandes (>500KB) o muy grandes en dimensiones
        const debeComprimir = file.size > 500 * 1024; // Mayor a 500KB
        
        if (debeComprimir) {
          // Ajustar parámetros de compresión según el tamaño del archivo
          let maxWidth = 1920, maxHeight = 1080, quality = 0.8;
          
          if (file.size > 5 * 1024 * 1024) { // > 5MB
            maxWidth = 1280;
            maxHeight = 720;
            quality = 0.7;
          } else if (file.size > 2 * 1024 * 1024) { // > 2MB
            maxWidth = 1600;
            maxHeight = 900;
            quality = 0.75;
          }
          
          base64Data = await this.comprimirImagen(file, maxWidth, maxHeight, quality);
        } else {
          base64Data = await this.convertirArchivoABase64(file);
        }
      } else {
        // Para archivos no imagen, convertir directamente
        base64Data = await this.convertirArchivoABase64(file);
      }

      archivosComprimidos.push({
        name: file.name,
        type: file.type,
        size: this.obtenerTamanoBase64(base64Data),
        data: base64Data
      });

      // Reportar progreso
      if (progressCallback) {
        progressCallback(Math.round(((i + 1) / files.length) * 100));
      }
    }

    return archivosComprimidos;
  }

  
  private convertirArchivoABase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Extraer solo la parte base64, removiendo el prefijo data:type;base64,
        const base64Only = result.split(',')[1];
        resolve(base64Only);
      };
      reader.onerror = error => reject(error);
      reader.readAsDataURL(file);
    });
  }
}

