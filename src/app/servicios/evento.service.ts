import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Evento } from '../interfaces/evento.interface';

@Injectable({
  providedIn: 'root'
})
export class EventoService {
  private eventosDisponibles: Evento[] = [
    {
      _id: '1',
      imagen: '/assets/images/conferencia-ia.jpg',
      titulo: 'Inteligencia Artificial y el Futuro del Desarrollo Web',
      ponente: 'Dra. María González',
      tipoEvento: 'Congreso/Conferencia',
      fecha: new Date('2024-04-15'),
      lugar: 'Facultad',
      aula: 'Aula 5',
      horaInicio: '10:00',
      horaFin: '12:00',
      actividad: 'Semana de la Ciencia',
      empresaOrganizadora: 'Universidad CEU San Pablo',
      descripcion: 'Únete a nosotros en esta fascinante conferencia donde exploraremos el impacto de la Inteligencia Artificial en el desarrollo web moderno y su papel en el futuro de la industria tecnológica.',
      adjuntos: ['programa.pdf', 'materiales.zip'],
      servicios: [
        {
          servicios: 'Facultad de Informática',
          grado: 'Grado en Ingeniería Informática'
        }
      ],
      enlaces: [
        {
          tipo: 'YouTube',
          url: 'https://youtube.com/evento'
        }
      ],
      ubicaciones: [
        {
          lugar: 'Facultad',
          aula: 'Aula 5',
          fecha: new Date('2024-04-15'),
          tipoHorario: 'hora',
          horaInicio: '10:00',
          horaFin: '12:00'
        }
      ]
    },
    {
      _id: '2',
      imagen: '/assets/images/taller-psicologia.jpg',
      titulo: 'Taller de Mindfulness y Bienestar Emocional',
      ponente: 'Dr. Juan Pérez',
      tipoEvento: 'Taller',
      fecha: new Date('2024-04-20'),
      lugar: 'Aula de grados',
      horaInicio: '16:00',
      horaFin: '18:30',
      empresaOrganizadora: 'Universidad CEU San Pablo',
      descripcion: 'Un taller práctico donde aprenderemos técnicas de mindfulness y estrategias para mejorar nuestro bienestar emocional en el entorno académico y profesional.',
      adjuntos: ['guia-mindfulness.pdf'],
      servicios: [
        {
          servicios: 'Servicio de Asistencia Psicológica Sanitaria'
        }
      ],
      enlaces: [
        {
          tipo: 'Instagram',
          url: 'https://instagram.com/evento'
        }
      ],
      ubicaciones: [
        {
          lugar: 'Aula de grados',
          fecha: new Date('2024-04-20'),
          tipoHorario: 'horario',
          horaInicio: '16:00',
          horaFin: '18:30'
        }
      ],
      actividad: 'Semana del Bienestar'
    },
   
    {
      _id: '4',
      imagen: '/assets/images/presentacion-libro.jpg',
      titulo: 'La Teología en el Mundo Contemporáneo',
      ponente: 'P. Antonio Martínez',
      tipoEvento: 'Presentación de Libro',
      fecha: new Date('2024-04-25'),
      lugar: 'Biblioteca Vargas-Zuñiga',
      horaInicio: '18:00',
      empresaOrganizadora: 'Universidad CEU San Pablo',
      descripcion: 'Presentación del nuevo libro que explora el papel de la teología en la sociedad actual y su relevancia en el diálogo con la cultura contemporánea.',
      adjuntos: ['resumen-libro.pdf', 'programa-presentacion.pdf'],
      servicios: [
        {
          servicios: 'Facultad de Teología',
          grado: 'Licenciatura en Teología Dogmática'
        }
      ],
      enlaces: [
        {
          tipo: 'YouTube',
          url: 'https://youtube.com/evento'
        },
        {
          tipo: 'LinkedIn',
          url: 'https://linkedin.com/evento'
        }
      ],
      ubicaciones: [
        {
          lugar: 'Biblioteca Vargas-Zuñiga',
          fecha: new Date('2024-04-25'),
          tipoHorario: 'hora',
          horaInicio: '18:00'
        }
      ],
      actividad: 'Ciclo de Presentaciones Académicas'
    }
  ];

  private eventos = new BehaviorSubject<Evento[]>(this.eventosDisponibles);
//Más adelante preguntar si mejor hacer este tipo de formato en vez de mediante interfaces para usarlo con MongoDB
  /*eventosDisponibles = [
    {
      "informacionbasica":{ 
        "_id": "3",
        "titulo": "Taller sobre la defensa del TFG",
        "ponente": "Clara Garcia",
        "empresaOrganizadora": "Universidad Pontificia de Salamanca",
        "tipoEvento": "Taller",
        "descripcion":"En este taller se presenta la modalidad y las técnicas de como poder presentar la defensa del TFG con total y clara confianza, estudiando la comunicación oral y física, realizando ejercicios vocálicos y logopédicos, poniendo énfasis en la pronunciación en el habla y la entonación según la situación y tema del TFG.",
      },
      "relacionados":{
        "actividad": "No eres el primer TFG, ten confianza",
        "servicios":[
          {
            "nombre": "Facultad de informática",
            "grado": "Ingeniería Informática"
          },
          {
            "nombre": "Servicio de asistencia al alumno",
          },
          {
            "nombre": "Vicerrectorado de Empleo",
          },
        ],
      },
      "recursosdigitales":{ 
        "adjuntos": [
        "Modelado GT R-ims .pdf",
        "Busqueda noticias en vertical.png"
        ],
        "enlaces": [
          {
            "tipo": "YouTube",
            "url": "https://www.youtube.com/watch?v=e7So2lN1vik"
          },
          {
            "tipo": "Instagram",
            "url": "https://www.instagram.com/p/DG1mpJagjaG/"
          }
        ]
      },
      "ubicaciones":[
        {"fecha": "2024-04-15",
        "horaInicio": "10:00",
        "horaFin": "12:00",
        "lugar": "Facultad",
        "aula": "Aula 5"},
      {
        "fecha": "2024-04-16",
        "horaInicio": "11:00",
        "horaFin": "14:00",
        "lugar": "Online",
      },
      {
        "fecha": "2024-04-17",
        "horaInicio": "12:00",
        "lugar": "Aula de grados",
      }
      ]
        
      }
    
  ]*/
  constructor() {}

  getEventos(): Observable<Evento[]> {
    return this.eventos.asObservable();
  }

  agregarEvento(evento: Evento) {
    const nuevoId = (this.eventosDisponibles.length + 1).toString();
    const nuevoEvento = { ...evento, _id: nuevoId };
    this.eventosDisponibles.push(nuevoEvento);
    this.eventos.next(this.eventosDisponibles);
    return nuevoEvento;
  }

  getEventoPorId(id: string): Evento | undefined {
    return this.eventosDisponibles.find(evento => evento._id === id);
  }

  eliminarEvento(id: string): Observable<void> {
    this.eventosDisponibles = this.eventosDisponibles.filter(evento => evento._id !== id);
    this.eventos.next(this.eventosDisponibles);
    return new Observable<void>(observer => {
      observer.next();
      observer.complete();
    });
  }
} 