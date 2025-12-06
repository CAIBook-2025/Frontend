'use client';

import { Strike } from '@/types/strike';

interface StrikeHistoryTableProps {
  strikes: Strike[];
}

const getTypeLabel = (type: Strike['type']) => {
  switch (type) {
    case 'NO_SHOW':
      return 'No Show';
    case 'DAMAGE':
      return 'Daños';
    case 'MISUSE':
      return 'Mal Uso';
    case 'OTHER':
      return 'Otro';
    default:
      return type;
  }
};

const getTypeBadgeColor = (type: Strike['type']) => {
  switch (type) {
    case 'NO_SHOW':
      return 'bg-red-500 text-white';
    case 'DAMAGE':
      return 'bg-yellow-500 text-white';
    case 'MISUSE':
      return 'bg-yellow-600 text-white';
    case 'OTHER':
      return 'bg-gray-500 text-white';
    default:
      return 'bg-gray-500 text-white';
  }
};

export function StrikeHistoryTable({ strikes }: StrikeHistoryTableProps) {
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Usuario</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Tipo</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Razón</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Aplicado por</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {strikes.map((strike) => (
              <tr key={strike.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-4 px-4">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{strike.student?.first_name} {strike.student?.last_name}</p>
                    <p className="text-xs text-gray-500 mt-1">{strike.student?.email}</p>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <span
                    className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getTypeBadgeColor(strike.type)}`}
                  >
                    {getTypeLabel(strike.type)}
                  </span>
                </td>
                <td className="py-4 px-4">
                  <div className="text-sm">{strike.description || 'Sin descripción'}</div>
                </td>
                <td className="py-4 px-4">
                  <div className="text-sm">{strike.admin?.first_name} {strike.admin?.last_name}</div>
                </td>
                <td className="py-4 px-4">
                  <div className="text-sm">{new Date(strike.date).toLocaleDateString()}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
