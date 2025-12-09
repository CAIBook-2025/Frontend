'use client';

import { X, Calendar, Clock, MapPin, Users, Info, ShieldCheck } from 'lucide-react';
import { EventRequest } from '@/types/eventRequest';

type EventDetailsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  event: EventRequest | null;
};

export const EventDetailsModal = ({ isOpen, onClose, event }: EventDetailsModalProps) => {
  if (!isOpen || !event) return null;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-CL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, string> = {
      CONFIRMED: 'bg-green-100 text-green-800 border-green-200',
      CANCELLED: 'bg-red-100 text-red-800 border-red-200',
      PENDING: 'bg-amber-100 text-amber-800 border-amber-200',
    };

    const statusLabels: Record<string, string> = {
      CONFIRMED: 'Confirmado',
      CANCELLED: 'Cancelado',
      PENDING: 'Pendiente',
    };

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium border ${statusStyles[status] || 'bg-gray-100 text-gray-800'}`}
      >
        {statusLabels[status] || status}
      </span>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-xl bg-white shadow-2xl flex flex-col max-h-[90vh] animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex-shrink-0 p-5 border-b flex justify-between items-center bg-gray-50 rounded-t-xl">
          <h3 className="text-xl font-bold text-gray-900 line-clamp-1">{event.name}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-grow overflow-y-auto p-6 space-y-6">
          {/* Main Info */}
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Organizador</h4>
                <div className="flex items-center gap-2">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <Users size={18} className="text-blue-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{event.group.name}</p>
                    <div className="flex items-center gap-1 text-xs text-blue-600 font-medium">
                      <ShieldCheck size={12} />
                      Reputación: {event.group.reputation}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Ubicación</h4>
                <div className="flex items-center gap-2">
                  <MapPin size={18} className="text-gray-400" />
                  <span className="text-gray-900">{event.public_space?.name || 'Por definir'}</span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Fecha y Hora</h4>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Calendar size={18} className="text-gray-400" />
                    <span className="text-gray-900 capitalize">{formatDate(event.day)}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock size={18} className="text-gray-400" />
                    <span className="text-gray-900">Módulo {event.module}</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-medium text-gray-500 mb-1">Estado</h4>
                <div>{getStatusBadge(event.status)}</div>
              </div>
            </div>
          </div>

          <hr className="border-gray-100" />

          {/* Description & Goal */}
          <div className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2">
                <Info size={16} />
                Descripción
              </h4>
              <div className="bg-gray-50 p-4 rounded-lg text-gray-700 text-sm leading-relaxed">
                {event.description || 'No hay descripción disponible.'}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Objetivo</h4>
              <p className="text-gray-700 text-sm">{event.goal || 'No especificado.'}</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 p-4 border-t bg-gray-50 rounded-b-xl flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-sm font-medium rounded-lg transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
