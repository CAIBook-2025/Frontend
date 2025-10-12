'use client';

import { X, Check, XIcon } from 'lucide-react';

interface GroupRequest {
  id: string;
  groupName: string;
  description: string;
  applicantName: string;
  applicantEmail: string;
  date: string;
  status: 'Pendiente' | 'Aprobado' | 'Rechazado';
  objective?: string;
}

interface GroupDetailsModalProps {
  request: GroupRequest | null;
  isOpen: boolean;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

export const GroupDetailsModal = ({ request, isOpen, onClose, onApprove, onReject }: GroupDetailsModalProps) => {
  if (!isOpen || !request) return null;

  const handleApprove = () => {
    onApprove(request.id);
    onClose();
  };

  const handleReject = () => {
    onReject(request.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">{request.groupName}</h2>
            <p className="text-sm text-gray-600 mt-1">Detalles de la solicitud</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">Descripción</h3>
            <p className="text-sm text-gray-700">{request.description}</p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">Objetivo</h3>
            <p className="text-sm text-gray-700">
              {request.objective || 'Promover el arte fotográfico entre estudiantes y organizar exposiciones'}
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">Solicitante</h3>
            <p className="text-sm text-gray-700">
              {request.applicantName} ({request.applicantEmail})
            </p>
          </div>

          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">Fecha de Solicitud</h3>
            <p className="text-sm text-gray-700">
              {new Date(request.date.split('/').reverse().join('-')).toLocaleDateString('es-ES', {
                day: 'numeric',
                month: 'long',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>

        {/* Actions */}
        {request.status === 'Pendiente' && (
          <div className="p-6 border-t border-gray-200 flex gap-3">
            <button
              onClick={handleApprove}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Check className="w-4 h-4" />
              Aprobar
            </button>
            <button
              onClick={handleReject}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
            >
              <XIcon className="w-4 h-4" />
              Rechazar
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
