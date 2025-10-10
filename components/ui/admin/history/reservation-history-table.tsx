'use client';
import { Check } from 'lucide-react';

export interface Reservation {
  id: string;
  userName: string;
  userEmail: string;
  room: string;
  date: string;
  timeRange: string;
  checkInTime?: string;
  status: 'Completada' | 'No Show' | 'Cancelada';
}

interface ReservationHistoryTableProps {
  reservations: Reservation[];
}

export const ReservationHistoryTable = ({ reservations }: ReservationHistoryTableProps) => {
  const getStatusBadge = (status: Reservation['status']) => {
    const statusStyles = {
      Completada: 'bg-blue-500 text-white',
      'No Show': 'bg-red-500 text-white',
      Cancelada: 'bg-yellow-500 text-white',
    };

    return <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyles[status]}`}>{status}</span>;
  };

  const renderCheckIn = (checkInTime?: string) => {
    if (!checkInTime) {
      return <span className="text-red-600 text-sm">No realizado</span>;
    }

    return (
      <div className="flex items-center gap-1 text-blue-600">
        <Check />
        <span className="text-sm font-medium">{checkInTime}</span>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Historial de Reservas</h2>
        <p className="text-sm text-gray-600 mt-1">Registro completo de todas las reservas de salas</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Usuario</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Sala</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Fecha y Hora</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Check-in</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Estado</th>
            </tr>
          </thead>
          <tbody>
            {reservations.map((reservation) => (
              <tr key={reservation.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-4 px-4">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{reservation.userName}</p>
                    <p className="text-gray-600 text-xs mt-1">{reservation.userEmail}</p>
                  </div>
                </td>
                <td className="py-4 px-4 text-sm text-gray-700">{reservation.room}</td>
                <td className="py-4 px-4">
                  <div>
                    <p className="text-sm text-gray-900">{reservation.date}</p>
                    <p className="text-xs text-gray-500 mt-1">{reservation.timeRange}</p>
                  </div>
                </td>
                <td className="py-4 px-4">{renderCheckIn(reservation.checkInTime)}</td>
                <td className="py-4 px-4">{getStatusBadge(reservation.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
