'use client';
import { Check } from 'lucide-react';
import { ScheduleItem } from '@/types/schedule';

interface ReservationHistoryTableProps {
  reservations: ScheduleItem[];
}

export const ReservationHistoryTable = ({ reservations }: ReservationHistoryTableProps) => {
  const getStatusBadge = (status: string | undefined) => {
    const statusStyles: Record<string, string> = {
      Completada: 'bg-green-100 text-green-800',
      PRESENT: 'bg-green-100 text-green-800',
      'No Show': 'bg-orange-100 text-orange-800',
      ABSENT: 'bg-red-100 text-red-800',
      Cancelada: 'bg-red-100 text-red-800',
      PENDING: 'bg-blue-100 text-blue-800',
      LATE: 'bg-yellow-100 text-yellow-800',
      EXCUSED: 'bg-purple-100 text-purple-800',
    };

    const finalStatus = status || 'PENDING';
    const style = statusStyles[finalStatus] || 'bg-gray-100 text-gray-800';

    return <span className={`px-3 py-1 rounded-full text-xs font-medium ${style}`}>{finalStatus}</span>;
  };

  const renderCheckIn = (status: string | undefined) => {
    if (status === 'PRESENT' || status === 'LATE') {
      return (
        <div className="flex items-center gap-1 text-green-600">
          <Check className="h-4 w-4" />
          <span className="text-sm font-medium">Realizado</span>
        </div>
      );
    }
    return <span className="text-gray-400 text-sm">-</span>;
  };

  const formatModule = (module: number) => {
    return `Módulo ${module}`;
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
            {reservations.map((item) => (
              <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-4 px-4">
                  <div>
                    {item.user ? (
                      <>
                        <p className="font-medium text-gray-900 text-sm">{item.user.first_name} {item.user.last_name}</p>
                        <p className="text-gray-600 text-xs mt-1">{item.user.email}</p>
                      </>
                    ) : (
                      <p className="text-gray-500 text-sm">Desconocido</p>
                    )}
                  </div>
                </td>
                <td className="py-4 px-4 text-sm text-gray-700">{item.studyRoom?.name || 'Desconocida'}</td>
                <td className="py-4 px-4">
                  <div>
                    <p className="text-sm text-gray-900">{new Date(item.day).toLocaleDateString()}</p>
                    <p className="text-xs text-gray-500 mt-1">{formatModule(item.module)}</p>
                  </div>
                </td>
                <td className="py-4 px-4">{renderCheckIn(item.attendanceStatus)}</td>
                <td className="py-4 px-4">{getStatusBadge(item.attendanceStatus || item.status)}</td>
              </tr>
            ))}
            {reservations.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-500">
                  No se encontraron reservas.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
