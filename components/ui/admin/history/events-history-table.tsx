'use client';

export interface Event {
  id: string;
  eventName: string;
  group: string;
  room: string;
  date: string;
  timeRange: string;
  registered: number;
  attendees: number;
  checkInTime?: string;
  status: 'Completada' | 'Activo' | 'Cancelada';
}

interface EventHistoryTableProps {
  events: Event[];
}

export const EventHistoryTable = ({ events }: EventHistoryTableProps) => {
  const getStatusBadge = (status: Event['status']) => {
    const statusStyles = {
      Completada: 'bg-blue-500 text-white',
      Activo: 'bg-yellow-500 text-white',
      Cancelada: 'bg-red-500 text-white',
    };

    return <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyles[status]}`}>{status}</span>;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Historial de Eventos</h2>
        <p className="text-sm text-gray-600 mt-1">Registro completo de todos los eventos realizados</p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Evento</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Sala</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Fecha</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Inscritos</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Asistencia</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Estado</th>
            </tr>
          </thead>
          <tbody>
            {events.map((event) => (
              <tr key={event.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-4 px-4">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{event.eventName}</p>
                    <p className="text-gray-600 text-xs mt-1">{event.group}</p>
                  </div>
                </td>
                <td className="py-4 px-4 text-sm text-gray-700">{event.room}</td>
                <td className="py-4 px-4">
                  <div>
                    <p className="text-sm text-gray-900">{event.date}</p>
                    <p className="text-xs text-gray-500 mt-1">{event.timeRange}</p>
                  </div>
                </td>
                <td className="py-4 px-4 text-sm text-gray-700">
                  {event.attendees} / {event.registered}
                </td>
                <td className="py-4 px-4">
                  <div>
                    <p className="text-sm text-gray-900">{event.attendees}</p>
                    <p className="text-xs text-gray-500 mt-1">
                      {(() => {
                        if (!event.registered) return '0% de asistencia';
                        const pct = Math.round((event.attendees * 100) / event.registered);
                        const clamped = Math.min(100, Math.max(0, pct));
                        return `${clamped}% de asistencia`;
                      })()}
                    </p>
                  </div>
                </td>
                <td className="py-4 px-4">{getStatusBadge(event.status)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
