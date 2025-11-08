// app/dashboard/Check-in/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, QrCode, CheckCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
// Importamos Auth0 y la función de la API
import { useUser, getAccessToken } from '@auth0/nextjs-auth0';
import { fetchUserProfile, UserProfileResponse } from '@/lib/user/fetchUserProfile';
import { confirmCheckIn } from "../../../services/reservationApi";

// ACTUALIZADO: La interfaz ahora debe coincidir con los datos del perfil
interface Reservation {
  id: number;
  roomName: string;
  location: string;
  day: string;
  module: number;
  status: string;
  isFinished: boolean;
}

// ELIMINADO: Ya no necesitamos la función mock `fetchReservationById`

export default function CheckInPage({ params }: { params: { id: string } }) {
  const reservationId = parseInt(params.id, 10);
  const { user: auth0User, isLoading: authLoading } = useUser();

  const [reservation, setReservation] = useState<Reservation | null>(null);
  // ACTUALIZADO: El estado de carga ahora también depende del perfil
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [schedule, setSchedule] = useState<Reservation[]>([]);
  const [dbProfile, setDbProfile] = useState<UserProfileResponse | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!auth0User) {
      setAccessToken(null);
      setDbProfile(null);
      setProfileLoading(false);
      return;
    }

    let isMounted = true;
    const loadAccessToken = async () => {
      try {
        const token = await getAccessToken();
        if (isMounted) {
          setAccessToken(token ?? null);
        }
      } catch (err) {
        console.error('Error fetching access token:', err);
        if (isMounted) {
          setAccessToken(null);
        }
      }
    };

    loadAccessToken();

    return () => {
      isMounted = false;
    };
  }, [auth0User, authLoading]);

  useEffect(() => {
    if (!accessToken) {
      setProfileLoading(false);
      setSchedule([]);
      return;
    }

    let isMounted = true;

    const loadProfileData = async () => {
      setProfileLoading(true);
      try {
        const profile = await fetchUserProfile(accessToken);
        if (isMounted) {
          setDbProfile(profile);
          setSchedule(profile?.schedule ?? []);
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
        if (isMounted) {
          setDbProfile(null);
          setSchedule([]);
        }
      } finally {
        if (isMounted) {
          setProfileLoading(false);
        }
      }
    };

    loadProfileData();

    return () => {
      isMounted = false;
    };
  }, [accessToken]);

  // --- useEffect COMPLETAMENTE REFACTORIZADO ---
  useEffect(() => {
    // Si el perfil del contexto todavía está cargando, esperamos.
    if (profileLoading) {
      setIsLoading(true);
      return;
    }

    // Si la carga terminó pero no hay datos en el schedule, es un error o el usuario no está logueado.
    if (!schedule || schedule.length === 0) {
      setError("No se pudieron encontrar los datos de la reserva.");
      setIsLoading(false);
      return;
    }

    // Buscamos la reserva específica dentro de la lista que ya tenemos del backend.
    const foundReservation = schedule.find(
      (res: Reservation) => res.id === reservationId
    );

    if (foundReservation) {
      setReservation(foundReservation);
    } else {
      setError(`No se encontró una reserva con el ID ${reservationId}.`);
    }

    setIsLoading(false);
  }, [profileLoading, schedule, reservationId]); // Se ejecuta cuando el perfil termina de cargar

  // La función handleCheckIn no cambia su lógica interna
  const handleCheckIn = async () => {
    if (!dbProfile?.user?.id || !accessToken) {
      alert('Error: No se ha podido verificar tu identidad. Por favor, vuelve a iniciar sesión.');
      return;
    }
    setIsCheckingIn(true);
    try {
      await confirmCheckIn(reservationId, dbProfile.user.id, accessToken);
      setIsSuccess(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Ocurrió un error inesperado.";
      alert(`Error al confirmar la asistencia: ${errorMessage}`);
    } finally {
      setIsCheckingIn(false);
    }
  };
  
  // --- LÓGICA DE RENDERIZADO MEJORADA ---

  // Estado de carga inicial o mientras el perfil se carga
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
      </div>
    );
  }

  // Estado de error si la reserva no se encuentra
  if (error || !reservation) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50 text-center">
        <div>
            <h1 className="text-2xl font-bold text-red-600">Error</h1>
            <p className="text-slate-600 mt-2">{error || "No se pudo cargar la reserva."}</p>
            <Link href="/Reservations" className="mt-4 inline-block text-blue-600 hover:underline">
                Volver a Mis Reservas
            </Link>
        </div>
      </div>
    );
  }

  const formattedDate = new Date(reservation.day).toLocaleDateString('es-CL', {
    weekday: 'long', month: 'long', day: 'numeric',
  });

  // El resto del JSX (éxito y vista principal) no cambia
  if (isSuccess) {
    // ... (código de la vista de éxito sin cambios)
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-green-50 text-center animate-fadeIn">
        <CheckCircle className="h-24 w-24 text-green-500" />
        <h1 className="mt-6 text-4xl font-bold text-gray-900">¡Check-In Exitoso!</h1>
        <p className="mt-2 text-lg text-slate-600">
          Tu asistencia para la <strong className="text-gray-800">{reservation.roomName}</strong> ha sido confirmada.
        </p>
        <p className="text-slate-500">Módulo {reservation.module} - {formattedDate}</p>
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
          <div className="rounded-full bg-blue-100 p-4">
            <QrCode className="h-10 w-10 text-blue-600" />
          </div>
          <h1 className="mt-4 text-3xl font-bold text-gray-900">Confirmar Asistencia</h1>
          <p className="mt-2 text-slate-600">
            Estás a punto de hacer check-in para tu reserva.
          </p>
        </div>
        <div className="my-6 space-y-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-lg font-bold text-gray-800">{reservation.roomName}</p>
          <div className="space-y-2 text-sm text-slate-600">
            <p className="flex items-center gap-2"><MapPin size={14} /> {reservation.location}</p>
            <p className="flex items-center gap-2"><Calendar size={14} /> {formattedDate}</p>
            <p className="flex items-center gap-2"><Clock size={14} /> Módulo {reservation.module}</p>
          </div>
        </div>
        <button
          onClick={handleCheckIn}
          disabled={isCheckingIn}
          className="flex w-full items-center justify-center gap-3 rounded-lg bg-green-600 px-4 py-3 font-semibold text-white transition-all duration-300 hover:bg-green-700 disabled:cursor-not-allowed disabled:bg-green-400">
          {isCheckingIn ? ( <> <Loader2 className="h-5 w-5 animate-spin" /> Confirmando... </> ) : ( 'Confirmar Asistencia' )}
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
