// app/Reservations/Check-out/[id]/CheckOutClientPage.tsx
'use client';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { Calendar, Clock, MapPin, LogOut, CheckCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useUser, getAccessToken } from '@auth0/nextjs-auth0';
import { fetchUserProfile, UserProfileResponse } from '@/lib/user/fetchUserProfile';
// Asegúrate de tener una función `confirmCheckOut` en tu API
import { confirmCheckOut } from '../../../services/reservationApi';

interface Reservation {
  id: number;
  roomName: string;
  location: string;
  day: string;
  module: number;
  status: string;
  isFinished: boolean;
}

export default function CheckOutClientPage({ reservationId }: { reservationId: number }) {
  const { user: auth0User } = useUser();
  const searchParams = useSearchParams();

  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [dbProfile, setDbProfile] = useState<UserProfileResponse | null>(null);

  useEffect(() => {
    if (!auth0User) return;
    const loadAuthData = async () => {
      try {
        const token = await getAccessToken();
        setAccessToken(token ?? null);
        if (token) {
          const profile = await fetchUserProfile(token);
          setDbProfile(profile);
        }
      } catch (err) {
        console.error('Error loading auth data:', err);
      }
    };
    loadAuthData();
  }, [auth0User]);

  useEffect(() => {
    const reservationDataString = searchParams.get('data');
    if (!reservationDataString) {
      setError('Faltan los datos de la reserva. Por favor, vuelve a intentarlo.');
      setIsLoading(false);
      return;
    }
    try {
      const parsedReservation = JSON.parse(decodeURIComponent(reservationDataString));
      setReservation(parsedReservation);
    } catch (e) {
      setError('Los datos de la reserva están corruptos.');
    } finally {
      setIsLoading(false);
    }
  }, [searchParams]);

  const handleCheckOut = async () => {
    if (!dbProfile?.user?.id || !accessToken) {
      alert('Error: No se ha podido verificar tu identidad.');
      return;
    }
    setIsCheckingOut(true);
    try {
      await confirmCheckOut(reservationId, dbProfile.user.id, accessToken);
      setIsSuccess(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Ocurrió un error inesperado.';
      alert(`Error al registrar la salida: ${errorMessage}`);
    } finally {
      setIsCheckingOut(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !reservation) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 text-center">
        <div>
          <h1 className="text-2xl font-bold text-red-600">Error</h1>
          <p className="text-slate-600 mt-2">{error || 'No se pudo cargar la reserva.'}</p>
          <Link href="/Reservations" className="mt-4 inline-block text-blue-600 hover:underline">
            Volver a Mis Reservas
          </Link>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(reservation.day).toLocaleDateString('es-CL', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  if (isSuccess) {
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-green-50 text-center animate-fadeIn">
        <CheckCircle className="h-24 w-24 text-green-500" />
        <h1 className="mt-6 text-4xl font-bold text-gray-900">¡Check-Out Exitoso!</h1>
        <p className="mt-2 text-lg text-slate-600">
          Has finalizado tu reserva para <strong className="text-gray-800">{reservation.roomName}</strong>.
        </p>
        <p className="text-slate-500">
          Módulo {reservation.module} - {formattedDate}
        </p>
        <Link href="/Reservations" passHref>
          <button className="mt-8 rounded-lg bg-green-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-green-700">
            Volver a Mis Reservas
          </button>
        </Link>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl animate-scaleIn">
        <div className="flex flex-col items-center text-center">
          <div className="rounded-full bg-amber-100 p-4">
            <LogOut className="h-10 w-10 text-amber-600" />
          </div>
          <h1 className="mt-4 text-3xl font-bold text-gray-900">Confirmar Salida</h1>
          <p className="mt-2 text-slate-600">Estás a punto de hacer check-out y finalizar tu reserva.</p>
        </div>
        <div className="my-6 space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-lg font-bold text-gray-800">{reservation.roomName}</p>
          <div className="space-y-2 text-sm text-slate-600">
            <p className="flex items-center gap-2">
              <MapPin size={14} /> {reservation.location}
            </p>
            <p className="flex items-center gap-2">
              <Calendar size={14} /> {formattedDate}
            </p>
            <p className="flex items-center gap-2">
              <Clock size={14} /> Módulo {reservation.module}
            </p>
          </div>
        </div>
        <button
          onClick={handleCheckOut}
          disabled={isCheckingOut || !dbProfile}
          className="flex w-full items-center justify-center gap-3 rounded-lg bg-amber-500 px-4 py-3 font-semibold text-white transition-all duration-300 hover:bg-amber-600 disabled:cursor-not-allowed disabled:bg-amber-300"
        >
          {isCheckingOut ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin" /> Registrando Salida...
            </>
          ) : (
            'Confirmar Salida'
          )}
        </button>
        <div className="mt-4 text-center">
          <Link href="/Reservations" className="text-sm text-slate-500 hover:underline">
            Cancelar y volver
          </Link>
        </div>
      </div>
    </div>
  );
}
