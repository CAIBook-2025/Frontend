// app/components/dashboard/ReservationCard.tsx
'use client';

import { Calendar, Clock, MapPin, XCircle, Eye } from "lucide-react"; // Importamos el ícono 'Eye'
import { Reservation, ReservationStatus } from "../../app/services/reservationApi";

// ... (statusStyles se mantiene igual)
const statusStyles: { [key in ReservationStatus]: string } = {
  Confirmada: 'bg-green-100 text-green-800',
  Pendiente: 'bg-yellow-100 text-yellow-800',
  Cancelada: 'bg-red-100 text-red-800',
};

type ReservationCardProps = {
  reservation: Reservation;
  onCancelClick: (reservation: Reservation) => void;
  onDetailsClick: (reservation: Reservation) => void; // <-- NUEVA PROP
};

export const ReservationCard = ({ reservation, onCancelClick, onDetailsClick }: ReservationCardProps) => {
  const { roomName, location, date, time, status } = reservation;

  return (
    <div className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 ${status === 'Cancelada' ? 'opacity-60' : 'hover:shadow-md'}`}>
      {/* ... (Parte superior de la tarjeta sin cambios) ... */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-bold text-gray-800">{roomName}</h3>
          <p className="text-sm text-slate-500 flex items-center gap-1 mt-1"><MapPin size={14} /> {location}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyles[status]}`}>{status}</span>
      </div>
      <div className="mt-4 border-t border-slate-100 pt-4 space-y-2 text-sm text-slate-600">
        <div className="flex items-center gap-2"><Calendar size={16} className="text-blue-500" /> <span>{date}</span></div>
        <div className="flex items-center gap-2"><Clock size={16} className="text-blue-500" /> <span>{time}</span></div>
      </div>
      
      {/* --- SECCIÓN DE BOTONES ACTUALIZADA --- */}
      <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
        <button 
          onClick={() => onDetailsClick(reservation)}
          className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
        >
          <Eye size={16} />
          Ver Detalles
        </button>

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