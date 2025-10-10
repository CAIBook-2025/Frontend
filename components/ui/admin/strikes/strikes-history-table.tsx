'use client';

interface Strike {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  type: 'No-show' | 'Misuse' | 'Late-cancellation';
  reason: string;
  appliedBy: string;
  date: string;
}

interface StrikeHistoryTableProps {
  strikes: Strike[];
}

const getTypeLabel = (type: Strike['type']) => {
  switch (type) {
    case 'No-show':
      return 'No Show';
    case 'Misuse':
      return 'Mal Uso';
    case 'Late-cancellation':
      return 'Cancelación Tardía';
  }
};

const getTypeBadgeColor = (type: Strike['type']) => {
  switch (type) {
    case 'No-show':
      return 'bg-red-500 text-white';
    case 'Misuse':
      return 'bg-yellow-500 text-white';
    case 'Late-cancellation':
      return 'bg-yellow-600 text-white';
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
                    <p className="font-medium text-gray-900 text-sm">{strike.userName}</p>
                    <p className="text-xs text-gray-500 mt-1">{strike.userEmail}</p>
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
                  <div className="text-sm">{strike.reason}</div>
                </td>
                <td className="py-4 px-4">
                  <div className="text-sm">{strike.appliedBy}</div>
                </td>
                <td className="py-4 px-4">
                  <div className="text-sm">{strike.date}</div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
