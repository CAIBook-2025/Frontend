// components/book-room/RoomCard.tsx
'use client';

import { useState } from 'react';
import { MapPin, Users, Clock, Loader2, CheckCircle2 } from 'lucide-react';

// Reutilizamos los tipos que definimos en la página
type RoomStatus = 'Disponible' | 'Ocupada';
type Equipment = 'Pizarra' | 'Proyector' | 'WiFi' | 'Enchufes' | 'Mesa grande';

export interface Room {
  id: number;
  name: string;
  location: string;
  capacity: number;
  nextAvailable: string;
  status: RoomStatus;
  equipment: Equipment[];
  module: number;
  day?: string;
}

interface RoomCardProps {
  room: Room;
  scheduleId: number;
  userId: number | null;
  accessToken: string | null;
  onReservationSuccess?: () => void;
}

export const RoomCard = ({ room, scheduleId, userId, accessToken, onReservationSuccess }: RoomCardProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isReserved, setIsReserved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const isAvailable = room.status === 'Disponible' && !isReserved;

  const handleReservar = async () => {
    if (!accessToken) {
      setError('Debes iniciar sesión para reservar');
      return;
    }

    if (!userId) {
      setError('No se pudo obtener tu información de usuario');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/srSchedule/book`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ 
          id: scheduleId,  // ID del horario (número entero)
          userId: userId   // ID del usuario (número entero)
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || data.message || 'Error al reservar');
      }

      setIsReserved(true);
      onReservationSuccess?.();
    } catch (e: any) {
      console.error('Error reservando:', e);
      setError(e.message || 'Error al reservar la sala');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow duration-300 hover:shadow-md">
      <div>
        <div className="flex items-start justify-between">
          <h3 className="text-xl font-bold text-gray-800">{room.name}</h3>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${isAvailable ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}
          >
            {room.status}
          </span>
        </div>
        <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
          <MapPin size={14} /> {room.location}
        </p>

        <div className="my-4 flex items-center gap-6 border-y border-slate-100 py-3 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <Users size={16} /> {room.capacity} personas
          </div>
          <div className="flex items-center gap-2">
            <Clock size={16} /> Módulo: {room.module}
          </div>
        </div>

        <div>
          <h4 className="mb-2 text-sm font-medium text-slate-600">Equipamiento:</h4>
          <div className="flex flex-wrap gap-2">
            {room.equipment.length > 0 ? (
              room.equipment.map((item) => (
                <span key={item} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">
                  {item}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-500">No especificado</span>
            )}
          </div>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="mt-4 p-2 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Success message */}
      {isReserved && (
        <div className="mt-4 p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-sm flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4" />
          ¡Reserva exitosa!
        </div>
      )}

      {/* --- BOTÓN CORREGIDO CON COLORES ESTÁNDAR Y CURSOR --- */}
      <button
        disabled={!isAvailable || isLoading || isReserved}
        className={`
          mt-4 w-full rounded-lg px-4 py-2.5 font-semibold text-white transition-colors duration-300 flex items-center justify-center gap-2
          ${
            isReserved
              ? 'bg-green-600 cursor-default'
              : isAvailable && !isLoading
              ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
              : 'bg-slate-400 cursor-not-allowed'
          }
        `}
        onClick={handleReservar}
      >
        {isLoading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Reservando...
          </>
        ) : isReserved ? (
          <>
            <CheckCircle2 className="h-4 w-4" />
            Reservado
          </>
        ) : isAvailable ? (
          'Reservar'
        ) : (
          'No Disponible'
        )}
      </button>
    </div>
  );
};
