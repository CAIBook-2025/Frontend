// types/eventRequest.ts

import { Group } from './group';

// Tipo para espacios públicos
export type PublicSpace = {
  id: number;
  name: string;
  capacity: number;
  location: string;
  available: 'AVAILABLE' | 'MAINTENANCE' | 'UNAVAILABLE';
};

// Estados posibles de una solicitud de evento
export type EventRequestStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED';

// Tipo principal para solicitud de evento
export type EventRequest = {
  id: number;
  name: string;
  goal: string;
  description: string | null;
  status: EventRequestStatus;
  day: string;
  module: number;
  n_attendees: number | null;
  group: Group;
  public_space: PublicSpace | null;
  events_scheduling?: EventScheduling | null;
  createdAt: string;
  updatedAt: string;
};

// Tipo para evento programado (cuando se confirma)
export type EventScheduling = {
  id: number;
  start_time: string;
  end_time: string;
};

// Tipo para crear un nuevo evento
export type CreateEventRequest = {
  group_id: number;
  public_space_id: number;
  name: string;
  goal: string;
  description: string;
  day: string; // ISO 8601 format
  module: number; // 1-8
};

// Tipo para actualizar un evento (representante)
export type UpdateEventRequest = {
  name?: string;
  goal?: string;
  description?: string;
};

// Tipo para respuesta detallada de evento
export type EventRequestDetail = EventRequest & {
  group: Group & {
    description?: string;
    representative?: {
      id: number;
      first_name: string;
      last_name: string;
      email: string;
    };
    moderators?: Array<{
      id: number;
      first_name: string;
      last_name: string;
      email: string;
    }>;
    creator?: {
      id: number;
      first_name: string;
      last_name: string;
      email: string;
    };
  };
};

// Mapeo de módulos a horarios
export const MODULE_TIMES: Record<number, { start: string; end: string; label: string }> = {
  1: { start: '08:00', end: '09:30', label: '08:00 - 09:30' },
  2: { start: '09:30', end: '11:00', label: '09:30 - 11:00' },
  3: { start: '11:00', end: '12:30', label: '11:00 - 12:30' },
  4: { start: '12:30', end: '14:00', label: '12:30 - 14:00' },
  5: { start: '14:00', end: '15:30', label: '14:00 - 15:30' },
  6: { start: '15:30', end: '17:00', label: '15:30 - 17:00' },
  7: { start: '17:00', end: '18:30', label: '17:00 - 18:30' },
  8: { start: '18:30', end: '20:00', label: '18:30 - 20:00' },
};

// Helper para obtener el label del horario
export const getModuleTimeLabel = (module: number): string => {
  return MODULE_TIMES[module]?.label || 'Horario no especificado';
};

// Colores y labels para estados
export const EVENT_STATUS_CONFIG: Record<
  EventRequestStatus,
  { label: string; color: string; bgColor: string; borderColor: string }
> = {
  PENDING: {
    label: 'Pendiente',
    color: 'text-amber-800',
    bgColor: 'bg-amber-100',
    borderColor: 'border-amber-200',
  },
  CONFIRMED: {
    label: 'Confirmado',
    color: 'text-green-800',
    bgColor: 'bg-green-100',
    borderColor: 'border-green-200',
  },
  CANCELLED: {
    label: 'Cancelado',
    color: 'text-red-800',
    bgColor: 'bg-red-100',
    borderColor: 'border-red-200',
  },
};
