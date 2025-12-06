// app/components/dashboard/ReservationCard.tsx
'use client';

import { Calendar, Clock, MapPin, Eye, QrCode, LogOut } from 'lucide-react';
import Link from 'next/link';

type ReservationStatus = 'PENDING' | 'PRESENT' | 'CANCELED' | 'ABSENT' | string;

export interface Reservation {
  id: number;
  roomName: string;
  location: string;
  day: string;
  module: number;
  status: ReservationStatus;
  isFinished: boolean;
}

const statusStyles: { [key: string]: string } = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PRESENT: 'bg-green-100 text-green-800',
  CANCELED: 'bg-red-100 text-red-800',
  ABSENT: 'bg-slate-100 text-slate-800',
  default: 'bg-gray-100 text-gray-800',
};

const statusText: { [key: string]: string } = {
  PENDING: 'Pendiente',
  PRESENT: 'En curso',
  CANCELED: 'Cancelada',
  ABSENT: 'Ausente',
  default: 'Desconocido',
};

type ReservationCardProps = {
  reservation: Reservation;
  onCancelClick: (reservation: Reservation) => void;
  onDetailsClick: (reservation: Reservation) => void;
};

export const ReservationCard = ({ reservation, onCancelClick, onDetailsClick }: ReservationCardProps) => {
  const { id, roomName, location, day, module, status } = reservation;

  const formattedDate = new Date(day).toLocaleString('es-CL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const currentStatusStyle = statusStyles[status] || statusStyles.default;
  const currentStatusText = statusText[status] || statusText.default;

  // Preparamos el objeto de la reserva para pasarlo como parámetro en la URL.
  const reservationQueryParam = encodeURIComponent(JSON.stringify(reservation));

  return (
    <div
      className={`flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all duration-300 ${status === 'CANCELED' ? 'opacity-70 bg-slate-50' : 'hover:shadow-md'}`}
    >
      <div>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-bold text-gray-800">{roomName}</h3>
            <p className="text-sm text-slate-500 flex items-center gap-1 mt-1">
              <MapPin size={14} /> {location}
            </p>
          </div>
          <span className={`rounded-full px-3 py-1 text-xs font-medium ${currentStatusStyle}`}>
            {currentStatusText}
          </span>
        </div>
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
      </div>

      <div className="mt-5 pt-4 border-t border-slate-100">
        {status === 'PENDING' && (
          <div className="flex flex-col gap-3">
            <Link href={`/Reservations/Check-in/${id}?data=${reservationQueryParam}`} passHref>
              <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white transition-colors hover:bg-blue-700">
                <QrCode size={18} />
                Hacer Check-In
              </button>
            </Link>
            <div className="flex justify-between text-sm">
              <button
                onClick={() => onDetailsClick(reservation)}
                className="font-semibold text-slate-500 hover:text-slate-700"
              >
                Ver Detalles
              </button>
              <button
                onClick={() => onCancelClick(reservation)}
                className="font-semibold text-red-500 hover:text-red-700"
              >
                Cancelar Reserva
              </button>
            </div>
          </div>
        )}

        {status === 'PRESENT' && (
          <div className="flex flex-col gap-3">
            {/* ACTUALIZADO: El href ahora incluye el parámetro 'data' con la reserva codificada */}
            <Link href={`/Reservations/Check-out/${id}?data=${reservationQueryParam}`} passHref>
              <button className="flex w-full items-center justify-center gap-2 rounded-lg bg-amber-500 px-4 py-2.5 font-semibold text-white transition-colors hover:bg-amber-600">
                <LogOut size={18} />
                Hacer Check-Out
              </button>
            </Link>
            <div className="flex justify-start text-sm">
              <button
                onClick={() => onDetailsClick(reservation)}
                className="font-semibold text-slate-500 hover:text-slate-700"
              >
                Ver Detalles
              </button>
            </div>
          </div>
        )}

        {(status === 'CANCELED' || status === 'ABSENT' || !['PENDING', 'PRESENT'].includes(status)) && (
          <div className="flex justify-start">
            <button
              onClick={() => onDetailsClick(reservation)}
              className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-700"
            >
              <Eye size={16} />
              Ver Detalles
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
