// app/components/dashboard/ReservationCard.tsx
'use client';

import { Calendar, Clock, MapPin, XCircle, Eye } from "lucide-react";

// ACTUALIZADO: Definimos los tipos aquí mismo para que coincidan con los datos de MyReservationsView.
// Ya no los importamos desde el servicio API.
type ReservationStatus = 'Activa' | 'Cancelada';

export interface Reservation {
  id: number;
  roomName: string;
  location: string;
  day: string; // Ahora es 'day', un string con formato ISO
  module: number; // Ahora es 'module', un número
  status: ReservationStatus;
}

// ACTUALIZADO: Los estilos ahora coinciden con los nuevos estados 'Activa' y 'Cancelada'.
const statusStyles: { [key in ReservationStatus]: string } = {
  Activa: 'bg-green-100 text-green-800',
  Cancelada: 'bg-red-100 text-red-800',
};

type ReservationCardProps = {
  reservation: Reservation;
  onCancelClick: (reservation: Reservation) => void;
  onDetailsClick: (reservation: Reservation) => void;
};

export const ReservationCard = ({ reservation, onCancelClick, onDetailsClick }: ReservationCardProps) => {
  // ACTUALIZADO: Desestructuramos las nuevas propiedades 'day' y 'module'.
  const { roomName, location, day, module, status } = reservation;

  // NUEVO: Formateamos la fecha para que sea legible para el usuario.
  // El string 'day' viene como "2025-11-06T00:00:00.000Z", lo convertimos a un formato local.
  const formattedDate = new Date(day).toLocaleDateString('es-CL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    // ACTUALIZADO: Hacemos que la tarjeta sea menos opaca cuando está cancelada para mejor legibilidad.
    <div className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 ${status === 'Cancelada' ? 'opacity-70 bg-slate-50' : 'hover:shadow-md'}`}>
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-bold text-gray-800">{roomName}</h3>
          <p className="text-sm text-slate-500 flex items-center gap-1 mt-1"><MapPin size={14} /> {location}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyles[status]}`}>{status}</span>
      </div>

      {/* ACTUALIZADO: Mostramos la fecha formateada y el módulo en lugar de date y time. */}
      <div className="mt-4 border-t border-slate-100 pt-4 space-y-2 text-sm text-slate-600">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-blue-500" /> 
          <span>{formattedDate}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-blue-500" /> 
          <span>Módulo: {module}</span>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
        <button 
          onClick={() => onDetailsClick(reservation)}
          className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
        >
          <Eye size={19} />
          Ver Detalles
        </button>

        {/* La lógica aquí sigue siendo válida: el botón de cancelar solo aparece si la reserva no está ya cancelada. */}
        {status !== 'Cancelada' && (
          <button 
            onClick={() => onCancelClick(reservation)} 
            className="flex items-center gap-2 text-sm font-semibold text-red-500 hover:text-red-700 transition-colors"
          >
            <XCircle size={16} />
            Cancelar
          </button>
        )}
      </div>
    </div>
  );
};