import { EventType } from '../enums/event-type.enum';

export interface Evento {
  _id?: string;
  imagen: string; // Carátula del evento (url/base64)
  titulo: string;
  departamento: string; // Departamento del evento (antes empresaOrganizadora)
  ponente?: string; // Mantener para retrocompatibilidad
  ponentes?: Ponente[]; // Nuevo: array de ponentes
  empresaOrganizadora?: string; // Mantener para retrocompatibilidad
  tipoEvento: EventType;
  numeroParticipantes?: number;
  participantesDesconocido?: boolean;
  descripcion: string;
  adjuntos: ArchivoAdjunto[]; // Cambiar a array de objetos
  servicios: Servicio[];
  enlaces: Enlace[];
  actividad?: string; // Opcional
  ubicaciones: Ubicacion[];
  // Campos de autoría
  creadoPor?: string; // Email del usuario que creó el evento
  modificadoPor?: string; // Email del usuario que modificó el evento por última vez
  // Campos antiguos para retrocompatibilidad
  fecha?: Date;
  lugar?: string;
  aula?: string;
  horaInicio?: string;
  horaFin?: string;
}

export interface Ponente {
  id: number;
  nombre: string;
  afiliacion?: string;
}

export interface ArchivoAdjunto {
  name: string;
  type: string;
  size: number;
  data: string; // Base64 string
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
