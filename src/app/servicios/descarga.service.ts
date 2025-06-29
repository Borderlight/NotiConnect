import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';

@Injectable({ providedIn: 'root' })
export class DescargaService {
  descargarJSON(eventos: any[], nombreBase: string) {
    const contenido = JSON.stringify(eventos, null, 2);
    this.descargarArchivo(contenido, `${nombreBase}.json`, 'application/json');
  }

  descargarCSV(eventos: any[], nombreBase: string, obtenerEtiquetaCampo: (campo: string) => string) {
    if (eventos.length === 0) return;
    
    // Obtener solo los campos que están presentes en los eventos (campos seleccionados)
    const camposSeleccionados = Object.keys(eventos[0]);
    
    // Crear cabeceras usando las etiquetas traducidas
    const headers = camposSeleccionados.map(campo => obtenerEtiquetaCampo(campo));
    
    // Función para escapar correctamente los valores CSV
    const escaparCSV = (valor: string): string => {
      if (!valor) return '';
      // Convertir a string si no lo es
      let cell = valor.toString();
      // Si contiene punto y coma, comillas, saltos de línea, envolver en comillas
      if (cell.includes(';') || cell.includes('"') || cell.includes('\n') || cell.includes('\r')) {
        // Escapar comillas existentes duplicándolas
        cell = cell.replace(/"/g, '""');
        // Envolver en comillas
        cell = `"${cell}"`;
      }
      return cell;
    };
    
    // Usar punto y coma como separador (estándar europeo)
    const csvRows = [
      headers.map(header => escaparCSV(header)).join(';'),
      ...eventos.map(evento =>
        camposSeleccionados.map(campo => {
          const valor = evento[campo] || '';
          return escaparCSV(valor);
        }).join(';')
      )
    ];
    
    // Agregar BOM para UTF-8 y separador para Excel
    const contenido = '\uFEFF' + csvRows.join('\n');
    this.descargarArchivo(contenido, `${nombreBase}.csv`, 'text/csv;charset=utf-8');
  }

  descargarPDF(eventos: any[], nombreBase: string, obtenerEtiquetaCampo: (campo: string) => string) {
    const doc = new jsPDF();
    let y = 20;
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);
    
    eventos.forEach((evento, index) => {
      if (index > 0 && y > 250) {
        doc.addPage();
        y = 20;
      }
      doc.setFontSize(16);
      doc.setFont('helvetica', 'bold');
      const titulo = evento.titulo ? evento.titulo.toString() : 'Evento';
      doc.text(titulo, margin, y);
      y += 10;
      doc.setDrawColor(200, 200, 200);
      doc.line(margin, y, pageWidth - margin, y);
      y += 15;
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      
      const camposSeleccionados = Object.keys(evento);
      
      for (const campo of camposSeleccionados) {
        if (campo === 'titulo') continue; // No repetir el título
        const valor = evento[campo];
        if (!valor) continue;
        
        // Verificar si hay suficiente espacio, si no, nueva página
        if (y > 250) {
          doc.addPage();
          y = 20;
        }
        
        doc.setFont('helvetica', 'bold');
        const label = obtenerEtiquetaCampo(campo) + ':';
        doc.text(label, margin, y);
        doc.setFont('helvetica', 'normal');
        
        // Manejo especial para adjuntos
        if (campo === 'adjuntos') {
          try {
            const adjuntos = JSON.parse(valor);
            y += 8;
            
            for (const adjunto of adjuntos) {
              if (y > 240) {
                doc.addPage();
                y = 20;
              }
              
              if (adjunto.esImagen && adjunto.data) {
                try {
                  // Insertar imagen
                  const imgData = adjunto.data.startsWith('data:') ? adjunto.data : `data:image/jpeg;base64,${adjunto.data}`;
                  const imgWidth = Math.min(60, contentWidth * 0.4);
                  const imgHeight = 40;
                  
                  doc.addImage(imgData, 'JPEG', margin + 10, y, imgWidth, imgHeight);
                  doc.text(`${adjunto.nombre}`, margin + imgWidth + 15, y + 20);
                  y += imgHeight + 10;
                } catch (error) {
                  // Si falla la imagen, mostrar solo el nombre
                  doc.text(`📷 ${adjunto.nombre}`, margin + 10, y);
                  y += 8;
                }
              } else {
                // Para documentos, crear texto clicable (enlace)
                doc.setTextColor(0, 0, 255);
                doc.textWithLink(`📄 ${adjunto.nombre}`, margin + 10, y, { url: '#' });
                doc.setTextColor(0, 0, 0);
                y += 8;
              }
            }
          } catch (error) {
            // Si falla el parsing, usar el valor como texto normal
            const lines = doc.splitTextToSize(valor.toString(), contentWidth);
            doc.text(lines, margin + 5, y + 5);
            y += (lines.length * 7) + 10;
          }
        } else {
          // Para otros campos, comportamiento normal
          const lines = doc.splitTextToSize(valor.toString(), contentWidth);
          doc.text(lines, margin + 5, y + 5);
          y += (lines.length * 7) + 10;
        }
      }
      
      y += 20;
    });
    doc.save(`${nombreBase}.pdf`);
  }

  descargarWord(eventos: any[], nombreBase: string, obtenerEtiquetaCampo: (campo: string) => string) {
    let html = '<html><head><meta charset="utf-8"><style>img{max-width:300px;max-height:200px;margin:10px 0;} a{color:blue;text-decoration:underline;}</style></head><body>';
    
    eventos.forEach(evento => {
      html += '<h2>' + (evento.titulo || 'Evento') + '</h2><ul>';
      
      Object.keys(evento).forEach(campo => {
        if (campo === 'titulo') return; // No repetir el título
        const valor = evento[campo];
        if (!valor) return; // Solo incluir campos que tengan valor
        
        html += `<li><b>${obtenerEtiquetaCampo(campo)}:</b> `;
        
        // Manejo especial para adjuntos
        if (campo === 'adjuntos') {
          try {
            const adjuntos = JSON.parse(valor);
            html += '<br/>';
            
            adjuntos.forEach((adjunto: any, index: number) => {
              if (adjunto.esImagen && adjunto.data) {
                // Para imágenes, insertar la imagen directamente
                const imgData = adjunto.data.startsWith('data:') ? adjunto.data : `data:image/jpeg;base64,${adjunto.data}`;
                html += `<div style="margin: 10px 0;">
                  <div><strong>${adjunto.nombre}</strong></div>
                  <img src="${imgData}" alt="${adjunto.nombre}" style="max-width:300px;max-height:200px;border:1px solid #ccc;"/>
                </div>`;
              } else {
                // Para documentos, crear un enlace (aunque en Word no será completamente funcional)
                html += `<div style="margin: 5px 0;">
                  📄 <a href="#" style="color:blue;text-decoration:underline;">${adjunto.nombre}</a>
                </div>`;
              }
            });
          } catch (error) {
            // Si falla el parsing, usar el valor como texto normal
            html += valor;
          }
        } else {
          // Para otros campos, comportamiento normal
          html += valor;
        }
        
        html += '</li>';
      });
      
      html += '</ul><hr/>';
    });
    
    html += '</body></html>';
    const blob = new Blob([html], { type: 'application/msword' });
    this.descargarArchivo(blob, `${nombreBase}.doc`, 'application/msword');
  }

  descargarArchivo(contenido: string | Blob, nombreArchivo: string, tipo: string) {
    const blob = typeof contenido === 'string' ? new Blob([contenido], { type: tipo }) : contenido;
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = nombreArchivo;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  }
}
