import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';

@Injectable({ providedIn: 'root' })
export class DescargaService {
  descargarJSON(eventos: any[], nombreBase: string) {
    const contenido = JSON.stringify(eventos, null, 2);
    this.descargarArchivo(contenido, `${nombreBase}.json`, 'application/json');
  }

  descargarCSV(eventos: any[], nombreBase: string) {
    if (eventos.length === 0) return;
    const headers = Object.keys(eventos[0]);
    const csvRows = [
      headers.join(','),
      ...eventos.map(evento =>
        headers.map(header => {
          let cell = evento[header]?.toString() || '';
          if (cell.includes(',') || cell.includes('"')) {
            cell = `"${cell.replace(/"/g, '""')}"`;
          }
          return cell;
        }).join(',')
      )
    ];
    const contenido = csvRows.join('\n');
    this.descargarArchivo(contenido, `${nombreBase}.csv`, 'text/csv');
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
      camposSeleccionados.forEach(campo => {
        if (campo === 'titulo') return; // No repetir el título
        const valor = evento[campo];
        if (valor) {
          doc.setFont('helvetica', 'bold');
          const label = obtenerEtiquetaCampo(campo) + ':';
          doc.text(label, margin, y);
          doc.setFont('helvetica', 'normal');
          const lines = doc.splitTextToSize(valor.toString(), contentWidth);
          doc.text(lines, margin + 5, y + 5);
          y += (lines.length * 7) + 10;
        }
      });
      y += 20;
    });
    doc.save(`${nombreBase}.pdf`);
  }

  descargarWord(eventos: any[], nombreBase: string, obtenerEtiquetaCampo: (campo: string) => string) {
    let html = '<html><head><meta charset="utf-8"></head><body>';
    eventos.forEach(evento => {
      html += '<h2>' + (evento.titulo || 'Evento') + '</h2><ul>';
      Object.keys(evento).forEach(campo => {
        if (campo === 'titulo') return; // No repetir el título
        const valor = evento[campo];
        if (valor) { // Solo incluir campos que tengan valor
          html += `<li><b>${obtenerEtiquetaCampo(campo)}:</b> ${valor}</li>`;
        }
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
