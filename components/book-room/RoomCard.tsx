'use client';

import { useCallback, useEffect, useState } from 'react';
import { getAccessToken, useUser } from '@auth0/nextjs-auth0';
import { MapPin, Users, Clock, CheckCircle } from 'lucide-react';

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
}

export const RoomCard = ({ room, scheduleId }: { room: Room; scheduleId: number }) => {
  const { user } = useUser();
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const isAvailable = room.status === 'Disponible';

  useEffect(() => {
    let isMounted = true;

    const fetchAccessToken = async () => {
      if (!user) {
        if (isMounted) setAccessToken(null);
        return;
      }

      try {
        const token = await getAccessToken();
        if (isMounted) setAccessToken(token);
      } catch (error) {
        console.error('Error fetching access token:', error);
        if (isMounted) setAccessToken(null);
      }
    };

    fetchAccessToken();

    return () => {
      isMounted = false;
    };
  }, [user]);

  const handleReservar = useCallback(async () => {
    if (!user || !accessToken) {
      alert('Debes iniciar sesión para poder realizar una reserva.');
      return;
    }

    const userId = user.sub ?? user.email;

    if (!userId) {
      alert('No se pudo obtener el identificador del usuario.');
      return;
    }

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/srSchedule/book`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ id: scheduleId, userId }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || 'Error al realizar la reserva');
      }

      setShowSuccessModal(true);
    } catch (e) {
      console.error(e);
      const errorMessage = e instanceof Error ? e.message : 'Ocurrió un error inesperado.';
      alert(`Error al reservar: ${errorMessage}`);
    }
  }, [accessToken, scheduleId, user]);

  const handleCloseModal = () => {
    setShowSuccessModal(false);
    window.location.reload();
  };

  return (
    <>
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

        <button
          disabled={!isAvailable}
          className={`
            mt-6 w-full rounded-lg px-4 py-2.5 font-semibold text-white transition-colors duration-300
            ${
              isAvailable
                ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer'
                : 'bg-slate-400 cursor-not-allowed'
            }
          `}
          onClick={handleReservar}
        >
          {isAvailable ? 'Reservar' : 'No Disponible'}
        </button>
      </div>

      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="m-4 max-w-sm rounded-lg bg-white p-6 text-center shadow-xl">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <h3 className="mt-4 text-xl font-bold text-gray-900">¡Reserva Confirmada!</h3>
            <p className="mt-2 text-sm text-gray-600">
              Has agendado la <span className="font-semibold">{room.name}</span> para el Módulo <span className="font-semibold">{room.module}</span>.
            </p>
            <button
              onClick={handleCloseModal}
              className="mt-6 w-full rounded-lg bg-green-600 px-4 py-2.5 font-semibold text-white transition-colors duration-300 hover:bg-green-700"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
};