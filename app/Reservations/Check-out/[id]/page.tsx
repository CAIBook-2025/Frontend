// app/dashboard/Check-out/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Clock, MapPin, LogOut, CheckCircle, Loader2 } from 'lucide-react';
import Link from 'next/link';
// Importamos el hook y la función de la API
import { useDbUser } from '@/contexts/AuthProvider';
import { confirmCheckOut } from "../../../services/reservationApi";

// ACTUALIZADO: La interfaz debe coincidir con los datos reales del perfil
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

export default function CheckOutPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const reservationId = parseInt(params.id, 10);

  // Obtenemos el perfil completo del usuario desde el contexto
  const { user, accessToken, profile, loading: profileLoading } = useDbUser();

  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- useEffect REFACTORIZADO para usar datos reales ---
  useEffect(() => {
    // Si el perfil del contexto todavía está cargando, mostramos el spinner.
    if (profileLoading) {
      setIsLoading(true);
      return;
    }

    // Si la carga terminó pero no hay perfil, es un estado de error.
    if (!profile || !profile.schedule) {
      setError("No se pudieron encontrar los datos de tu reserva.");
      setIsLoading(false);
      return;
    }

    // Buscamos la reserva correcta dentro de la lista de `profile.schedule`.
    const foundReservation = profile.schedule.find(
      (res: Reservation) => res.id === reservationId
    );

    if (foundReservation) {
      setReservation(foundReservation);
    } else {
      setError(`No se encontró una reserva activa con el ID ${reservationId}.`);
    }

    setIsLoading(false);
  }, [profileLoading, profile, reservationId]); // Dependemos del estado de carga del perfil

  const handleCheckOut = async () => {
    if (!user || !accessToken) {
      alert('Error: No se ha podido verificar tu identidad.');
      return;
    }
    setIsCheckingOut(true);
    try {
      // La llamada a la API ya era correcta
      await confirmCheckOut(reservationId, user.id, accessToken);
      setIsSuccess(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Ocurrió un error inesperado.";
      alert(`Error al confirmar la salida: ${errorMessage}`);
    } finally {
      setIsCheckingOut(false);
    }
  };

  // --- RENDERIZADO MEJORADO CON MANEJO DE ERRORES ---

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-50">
        <Loader2 className="h-12 w-12 animate-spin text-amber-500" />
      </div>
    );
  }

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

  if (isSuccess) {
    // ... (código de la vista de éxito sin cambios)
    return (
      <div className="flex h-screen w-full flex-col items-center justify-center bg-amber-50 text-center animate-fadeIn">
        <CheckCircle className="h-24 w-24 text-amber-600" />
        <h1 className="mt-6 text-4xl font-bold text-gray-900">¡Check-Out Exitoso!</h1>
        <p className="mt-2 text-lg text-slate-600">
          Tu salida de la <strong className="text-gray-800">{reservation.roomName}</strong> ha sido registrada.
        </p>
        <p className="text-slate-500">¡Gracias por mantener el orden!</p>
        <Link href="/Reservations" passHref>
          <button className="mt-8 rounded-lg bg-amber-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-amber-700">
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
          <p className="mt-2 text-slate-600">
            Confirma que has terminado de usar la sala y la has dejado en buen estado.
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
          onClick={handleCheckOut}
          disabled={isCheckingOut}
          className="flex w-full items-center justify-center gap-3 rounded-lg bg-amber-500 px-4 py-3 font-semibold text-white transition-all duration-300 hover:bg-amber-600 disabled:cursor-not-allowed disabled:bg-amber-400">
          {isCheckingOut ? ( <> <Loader2 className="h-5 w-5 animate-spin" /> Confirmando Salida... </> ) : ( 'Hacer Check-Out' )}
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