'use client';

import { Eye } from 'lucide-react';
import { GroupRequest } from '@/types/groupRequest';

interface GroupRequestsTableProps {
  requests: GroupRequest[];
  tableType: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  onView: (id: number) => void;
  onApprove?: (id: number) => void;
  onReject?: (id: number) => void;
  onManage?: (groupId: number) => void;
}

export const GroupRequestsTable = ({
  requests,
  tableType,
  onView,
  onApprove,
  onReject,
  onManage,
}: GroupRequestsTableProps) => {
  const formatDate = (date: string) => new Date(date).toLocaleDateString('es-CL');

  const getStatusBadge = (status: GroupRequest['status']) => {
    const styles: Record<GroupRequest['status'], string> = {
      PENDING: 'bg-orange-100 text-orange-800',
      CONFIRMED: 'bg-green-100 text-green-800',
      CANCELLED: 'bg-red-100 text-red-800',
    };

    const labels: Record<GroupRequest['status'], string> = {
      PENDING: 'Pendiente',
      CONFIRMED: 'Confirmado',
      CANCELLED: 'Cancelado',
    };

    return <span className={`px-3 py-1 rounded-full text-xs font-medium ${styles[status]}`}>{labels[status]}</span>;
  };

  const getTableHeaders = () => {
    switch (tableType) {
      case 'PENDING':
        return ['Grupo', 'Solicitante', 'Fecha', 'Estado', 'Acciones'];
      case 'CONFIRMED':
        return ['Grupo', 'Responsable', 'Fecha Aprobación', 'ID Grupo', 'Acciones'];
      case 'CANCELLED':
        return ['Grupo', 'Solicitante', 'Fecha Rechazo'];
      default:
        return [];
    }
  };

  const renderRow = (req: GroupRequest) => {
    const fullName = `${req.user.first_name} ${req.user.last_name}`;

    if (tableType === 'PENDING') {
      return (
        <tr key={req.id} className="border-b border-gray-100 hover:bg-gray-50">
          <td className="py-4 px-4">
            <h4 className="font-medium text-gray-900 text-sm">{req.name}</h4>
            <p className="text-gray-500 text-xs mt-1">{req.description}</p>
          </td>

          <td className="py-4 px-4">
            <p className="font-medium text-gray-900 text-sm">{fullName}</p>
            <p className="text-blue-600 text-xs mt-1">{req.user.email}</p>
          </td>

          <td className="py-4 px-4 text-sm text-gray-700">{formatDate(req.createdAt)}</td>

          <td className="py-4 px-4">{getStatusBadge(req.status)}</td>

          <td className="py-4 px-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => onView(req.id)}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                title="Ver detalles"
              >
                <Eye className="w-4 h-4" />
              </button>

              <button
                onClick={() => onApprove?.(req.id)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium"
              >
                Aprobar
              </button>

              <button
                onClick={() => onReject?.(req.id)}
                className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium"
              >
                Rechazar
              </button>
            </div>
          </td>
        </tr>
      );
    }

    if (tableType === 'CONFIRMED') {
      return (
        <tr key={req.id} className="border-b border-gray-100 hover:bg-gray-50">
          <td className="py-4 px-4">
            <h4 className="font-medium text-gray-900 text-sm">{req.name}</h4>
            <p className="text-gray-500 text-xs mt-1">{req.description}</p>
          </td>

          <td className="py-4 px-4">
            <p className="font-medium text-gray-900 text-sm">{fullName}</p>
            <p className="text-blue-600 text-xs mt-1">{req.user.email}</p>
          </td>

          <td className="py-4 px-4 text-sm text-gray-700">{formatDate(req.createdAt)}</td>

          <td className="py-4 px-4 text-sm text-gray-700">{req.group_id ?? '—'}</td>

          <td className="py-4 px-4">
            {req.group_id && (
              <button
                onClick={() => req.group_id != null && onManage?.(req.group_id)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium"
              >
                Gestionar
              </button>
            )}
          </td>
        </tr>
      );
    }

    // Rechazados
    return (
      <tr key={req.id} className="border-b border-gray-100 hover:bg-gray-50">
        <td className="py-4 px-4">
          <h4 className="font-medium text-gray-900 text-sm">{req.name}</h4>
          <p className="text-gray-500 text-xs mt-1">{req.description}</p>
        </td>

        <td className="py-4 px-4">
          <p className="font-medium text-gray-900 text-sm">{fullName}</p>
          <p className="text-blue-600 text-xs mt-1">{req.user.email}</p>
        </td>

        <td className="py-4 px-4 text-sm text-gray-700">{formatDate(req.createdAt)}</td>
      </tr>
    );
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {getTableHeaders().map((header) => (
                <th key={header} className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                  {header}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>{requests.map((r) => renderRow(r))}</tbody>
        </table>
      </div>
    </div>
  );
};
