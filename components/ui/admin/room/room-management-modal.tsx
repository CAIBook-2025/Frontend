'use client';

import { useEffect, useState } from 'react';
import { Room } from '@/types/room';
import { XIcon, CheckCircleIcon, SettingsIcon } from 'lucide-react';

export type RoomEditableStatus = Extract<Room['status'], 'AVAILABLE' | 'MAINTENANCE'>;

interface RoomManagementModalProps {
  room: Room | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, status: RoomEditableStatus, statusNote?: string) => void;
}

export function RoomManagementModal({ room, isOpen, onClose, onSave }: RoomManagementModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<RoomEditableStatus>(
    room?.status === 'MAINTENANCE' ? 'MAINTENANCE' : 'AVAILABLE'
  );
  const [statusNote, setStatusNote] = useState<string>(room?.statusNote || '');

  useEffect(() => {
    if (!room) return;
    setSelectedStatus(room.status === 'MAINTENANCE' ? 'MAINTENANCE' : 'AVAILABLE');
    setStatusNote(room.statusNote || '');
  }, [room]);

  if (!isOpen || !room) return null;

  const handleSave = () => {
    onSave(room.id, selectedStatus, selectedStatus === 'MAINTENANCE' ? statusNote : undefined);
    onClose();
  };

  const showReasonField = selectedStatus === 'MAINTENANCE';

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Gestionar Sala</h2>
            <p className="text-sm text-gray-600 mt-1">{room.name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <XIcon />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <h3 className="text-sm font-medium text-gray-900 mb-4">Estado de la Sala</h3>
          <div className="space-y-3">
            {/* Active Option */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="radio"
                name="roomStatus"
                value="AVAILABLE"
                checked={selectedStatus === 'AVAILABLE'}
                onChange={(e) => setSelectedStatus(e.target.value as RoomEditableStatus)}
                className="mt-0.5 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <div className="flex items-start gap-2 flex-1">
                <div className="text-green-600 mt-0.5">
                  <CheckCircleIcon />
                </div>
                <span className="text-sm text-gray-900">
                  Disponible <span className="text-gray-600">(apta para reservas)</span>
                </span>
              </div>
            </label>

            {/* Maintenance Option */}
            <label className="flex items-start gap-3 cursor-pointer group">
              <input
                type="radio"
                name="roomStatus"
                value="MAINTENANCE"
                checked={selectedStatus === 'MAINTENANCE'}
                onChange={(e) => setSelectedStatus(e.target.value as RoomEditableStatus)}
                className="mt-0.5 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
              />
              <div className="flex items-start gap-2 flex-1">
                <div className="text-orange-600 mt-0.5">
                  <SettingsIcon />
                </div>
                <span className="text-sm text-gray-900">
                  En mantenimiento <span className="text-gray-600">(temporalmente cerrada)</span>
                </span>
              </div>
            </label>
          </div>

          {showReasonField && (
            <div className="mt-4">
              <label htmlFor="statusNote" className="block text-sm font-medium text-gray-900 mb-2">
                Motivo
              </label>
              <textarea
                id="statusNote"
                value={statusNote}
                onChange={(e) => setStatusNote(e.target.value)}
                placeholder="Ingrese el motivo del cambio de estado..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="p-6 border-t border-gray-200 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-lg font-medium transition-colors border border-gray-300"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors"
          >
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
}
