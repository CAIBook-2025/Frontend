// app/components/dashboard/HistoricalReservationCard.tsx
'use client';

import { Calendar, Clock, MapPin } from 'lucide-react';

interface Reservation {
  id: number;
  roomName: string;
  location: string;
  day: string;
  module: number;
  status: string;
  isFinished: boolean;
}

const statusStyles: { [key: string]: string } = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PRESENT: 'bg-green-100 text-green-800',
  CANCELED: 'bg-red-100 text-red-800',
  ABSENT: 'bg-slate-100 text-slate-800',
  FINISHED: 'bg-blue-100 text-blue-800',
  default: 'bg-gray-100 text-gray-800',
};

const statusText: { [key: string]: string } = {
  PENDING: 'Pendiente',
  PRESENT: 'Completada',
  CANCELED: 'Cancelada',
  ABSENT: 'Ausente',
  FINISHED: 'Finalizada',
  default: 'Desconocido',
};

type HistoricalReservationCardProps = {
  reservation: Reservation;
};

export const HistoricalReservationCard = ({ reservation }: HistoricalReservationCardProps) => {
  const { roomName, location, day, module, status } = reservation;

  const formattedDate = new Date(day).toLocaleString('es-CL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const currentStatusStyle = statusStyles[status] || statusStyles.default;
  const currentStatusText = statusText[status] || statusText.default;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm opacity-75">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-lg font-bold text-gray-800">{roomName}</h3>
          <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
            <MapPin size={14} /> {location}
          </p>
        </div>
        <span className={`rounded-full px-3 py-1 text-xs font-medium ${currentStatusStyle}`}>{currentStatusText}</span>
      </div>
      <div className="mt-4 border-t border-slate-100 pt-4 space-y-2 text-sm text-slate-600">
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-slate-400" />
          <span>{formattedDate}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-slate-400" />
          <span>Módulo: {module}</span>
        </div>
      </div>
    </div>
  );
};
