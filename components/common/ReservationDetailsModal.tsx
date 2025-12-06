// app/components/common/ReservationDetailsModal.tsx
'use client';

import { X, MapPin, Calendar, Clock } from 'lucide-react';

// --- Tipos locales para que coincidan con los datos de MyReservationsView ---
type ReservationStatus = string;

export interface Reservation {
  id: number;
  roomName: string;
  location: string;
  day: string;
  module: number;
  status: ReservationStatus;
}

// Estilos para los diferentes estados
const statusStyles: { [key: string]: string } = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PRESENT: 'bg-green-100 text-green-800',
  CANCELED: 'bg-red-100 text-red-800',
  ABSENT: 'bg-slate-100 text-slate-800',
  default: 'bg-gray-100 text-gray-800',
};

const statusText: { [key: string]: string } = {
  PENDING: 'Pendiente',
  PRESENT: 'En curso',
  CANCELED: 'Cancelada',
  ABSENT: 'Ausente',
  default: 'Desconocido',
};

type DetailsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  reservation: Reservation | null;
};

export const ReservationDetailsModal = ({ isOpen, onClose, reservation }: DetailsModalProps) => {
  if (!isOpen || !reservation) return null;

  // Formateamos la fecha para mostrarla de forma amigable
  const formattedDate = new Date(reservation.day).toLocaleDateString('es-CL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const currentStatusStyle = statusStyles[reservation.status] || statusStyles.default;
  const currentStatusText = statusText[reservation.status] || statusText.default;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-300 animate-fadeIn"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl rounded-xl bg-white shadow-2xl flex flex-col h-[70vh] animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Encabezado Fijo del Modal */}
        <div className="flex-shrink-0 p-4 border-b flex justify-between items-center">
          <h3 className="text-xl font-bold text-gray-800">Detalles de la Reserva</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>

        {/* Contenido Scrolleable */}
        <div className="flex-grow overflow-y-auto">
          {/* --- SECCIÓN 1: Información de la Sala --- */}
          <div className="p-6 border-b bg-slate-50">
            <div className="flex justify-between items-start mb-4">
              <h4 className="text-2xl font-bold text-gray-900">{reservation.roomName}</h4>
              <span className={`rounded-full px-3 py-1 text-sm font-medium ${currentStatusStyle}`}>
                {currentStatusText}
              </span>
            </div>
            <div className="space-y-3 text-slate-600">
              <p className="flex items-center gap-2">
                <MapPin size={16} className="text-blue-500" /> {reservation.location}
              </p>
              <p className="flex items-center gap-2">
                <Calendar size={16} className="text-blue-500" /> {formattedDate}
              </p>
              <p className="flex items-center gap-2">
                <Clock size={16} className="text-blue-500" /> Módulo: {reservation.module}
              </p>
            </div>
          </div>

          {/* --- SECCIÓN 2: Instrucciones y Buenas Prácticas --- */}
          <div className="p-6">
            <h4 className="text-lg font-bold text-gray-800 mb-4">Instrucciones y Buenas Prácticas</h4>
            <ol className="list-decimal list-inside space-y-3 text-slate-600">
              <li>
                <strong>Check-In Obligatorio:</strong> Recuerda hacer check-in escaneando el QR de la sala. Tienes un
                margen de <strong>15 minutos</strong> desde el inicio de tu reserva para hacerlo. De lo contrario, la
                reserva se cancelará automáticamente.
              </li>
              <li>
                <strong>Mantén la Limpieza:</strong> Deja la sala tal como la encontraste. Bota tu basura en los
                contenedores designados y borra la pizarra si la utilizaste.
              </li>
              <li>
                <strong>Respeta el Horario:</strong> Desocupa la sala puntualmente al finalizar tu bloque horario para
                permitir que el siguiente grupo pueda ingresar a tiempo.
              </li>
              <li>
                <strong>Reporta Problemas:</strong> Si encuentras algún problema con el equipo (proyector, pizarra,
                etc.) o con la limpieza de la sala, por favor repórtalo a través de la sección de ayuda.
              </li>
              <li>
                <strong>Uso Adecuado:</strong> Las salas de estudio son para fines académicos. No está permitido
                consumir alimentos que generen olores fuertes ni realizar actividades ruidosas que puedan molestar a
                otros.
              </li>
            </ol>
          </div>
        </div>

        {/* Pie de Página Fijo del Modal */}
        <div className="flex-shrink-0 p-4 border-t bg-slate-50 flex justify-end">
          <button
            onClick={onClose}
            className="rounded-lg bg-blue-500 px-5 py-2 font-semibold text-white hover:bg-blue-600 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
