// app/components/common/ReservationDetailsModal.tsx
'use client';

import { X, MapPin, Calendar, Clock } from 'lucide-react';
import { Reservation, ReservationStatus } from '../../app/services/reservationApi';

const statusStyles: { [key in ReservationStatus]: string } = {
  Confirmada: 'bg-green-100 text-green-800',
  Pendiente: 'bg-yellow-100 text-yellow-800',
  Cancelada: 'bg-red-100 text-red-800',
};

type DetailsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  reservation: Reservation | null; // Puede ser nulo cuando el modal está cerrado
};

export const ReservationDetailsModal = ({ isOpen, onClose, reservation }: DetailsModalProps) => {
  if (!isOpen || !reservation) return null;

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
          {/* --- SECCIÓN 1: Información de la Sala (aprox. 1/3) --- */}
          <div className="p-6 border-b bg-slate-50">
            <div className="flex justify-between items-start mb-4">
              <h4 className="text-2xl font-bold text-gray-900">{reservation.roomName}</h4>
              <span className={`rounded-full px-3 py-1 text-sm font-medium ${statusStyles[reservation.status]}`}>
                {reservation.status}
              </span>
            </div>
            <div className="space-y-3 text-slate-600">
              <p className="flex items-center gap-2"><MapPin size={16} className="text-blue-500" /> {reservation.location}</p>
              <p className="flex items-center gap-2"><Calendar size={16} className="text-blue-500" /> {reservation.date}</p>
              <p className="flex items-center gap-2"><Clock size={16} className="text-blue-500" /> {reservation.time}</p>
            </div>
          </div>

          {/* --- SECCIÓN 2: Instrucciones y Buenas Prácticas (aprox. 2/3) --- */}
          <div className="p-6">
            <h4 className="text-lg font-bold text-gray-800 mb-4">Instrucciones y Buenas Prácticas</h4>
            <ol className="list-decimal list-inside space-y-3 text-slate-600">
              <li><strong>Check-In Obligatorio:</strong> Recuerda hacer check-in escaneando el QR de la sala. Tienes un margen de <strong>15 minutos</strong> desde el inicio de tu reserva para hacerlo. De lo contrario, la reserva se cancelará automáticamente.</li>
              <li><strong>Mantén la Limpieza:</strong> Deja la sala tal como la encontraste. Bota tu basura en los contenedores designados y borra la pizarra si la utilizaste.</li>
              <li><strong>Respeta el Horario:</strong> Desocupa la sala puntualmente al finalizar tu bloque horario para permitir que el siguiente grupo pueda ingresar a tiempo.</li>
              <li><strong>Reporta Problemas:</strong> Si encuentras algún problema con el equipo (proyector, pizarra, etc.) o con la limpieza de la sala, por favor repórtalo a través de la sección de ayuda.</li>
              <li><strong>Uso Adecuado:</strong> Las salas de estudio son para fines académicos. No está permitido consumir alimentos que generen olores fuertes ni realizar actividades ruidosas que puedan molestar a otros.</li>
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