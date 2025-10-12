'use client';
import { SettingsIcon } from 'lucide-react';
import { Room } from '@/types/room';

interface RoomsTableProps {
  rooms: Room[];
  onManage?: (room: Room) => void; // ⬅️ nuevo
}

export const RoomsTable = ({ rooms, onManage }: RoomsTableProps) => {
  const getStatusBadge = (status: Room['status'], statusNote?: string) => {
    const statusStyles = {
      Activa: 'bg-blue-500 text-white',
      Mantenimiento: 'bg-yellow-500 text-white',
      Deshabilitada: 'bg-red-500 text-white',
    };
    return (
      <div>
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyles[status]}`}>{status}</span>
        {statusNote && <p className="text-xs text-gray-500 mt-1">{statusNote}</p>}
      </div>
    );
  };

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 80) return 'text-blue-600';
    if (utilization >= 50) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Sala</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Ubicación</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Capacidad</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Estado</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Reservas Hoy</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Utilización</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rooms.map((room) => (
              <tr key={room.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-4 px-4">
                  <div>
                    <p className="font-medium text-gray-900 text-sm mb-2">{room.name}</p>
                    <div className="flex flex-wrap gap-1">
                      {room.features.map((feature, index) => (
                        <span
                          key={index}
                          className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs border border-gray-300"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div>
                    <p className="text-sm text-gray-900">{room.location}</p>
                    <p className="text-xs text-gray-500 mt-1">{room.floor}</p>
                  </div>
                </td>
                <td className="py-4 px-4 text-sm text-gray-700">{room.capacity} personas</td>
                <td className="py-4 px-4">{getStatusBadge(room.status, room.statusNote)}</td>
                <td className="py-4 px-4 text-sm text-gray-900 text-center">{room.reservationsToday}</td>
                <td className="py-4 px-4">
                  <span className={`text-sm font-medium ${getUtilizationColor(room.utilization)}`}>
                    {room.utilization}%
                  </span>
                </td>
                <td className="py-4 px-4">
                  <button
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded border border-gray-300 transition-colors"
                    onClick={() => onManage?.(room)} // ⬅️ dispara selección
                  >
                    <SettingsIcon />
                    Gestionar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
