import { EventType } from '../enums/event-type.enum';

export interface Evento {
  _id?: string;
  imagen: string;
  titulo: string;
  ponente: string;
  empresaOrganizadora: string;
  tipoEvento: EventType;
  descripcion: string;
  adjuntos: string[];
  servicios: Servicio[];
  enlaces: Enlace[];
  actividad: string;
  ubicaciones: Ubicacion[];
  fecha: Date;
  lugar: string;
  aula?: string;
  horaInicio: string;
  horaFin?: string;
}

export interface Servicio {
  servicios: string;
  grado?: string;
}

export interface Enlace {
  tipo: string;
  url: string;
}

export interface Ubicacion {
  lugar: string;
  aula?: string;
  fecha: Date;
  tipoHorario: 'hora' | 'horario';
  horaInicio: string;
  horaFin?: string;
  hora?: string; // Soporte para ubicaciones con hora única
}