// app/components/dashboard/MyReservationsView.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useUser, getAccessToken } from '@auth0/nextjs-auth0';
import { fetchUserProfile, UserProfileResponse } from '@/lib/user/fetchUserProfile';

// Importaciones de todos los componentes que hemos creado
import { ReservationCard } from './ReservationCard';
import { ReservationSkeleton } from '@/components/dashboard/ReservationSkeleton';
import { ConfirmationModal } from '@/components/common/ConfirmationModal';
import { ReservationDetailsModal } from '@/components/common/ReservationDetailsModal';

// Importación del servicio de API
import { cancelReservation } from '../../app/services/reservationApi';

// ACTUALIZADO: La interfaz ahora incluye `isFinished` para un filtrado más claro.
interface Reservation {
  id: number;
  roomName: string;
  location: string;
  day: string;
  module: number;
  status: string;
  isFinished: boolean; // Propiedad clave para saber si una reserva es activa o histórica
}

export const MyReservationsView = () => {
  const { user, isLoading: authLoading } = useUser();

  // Estado para la lista de reservas
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [tokenLoading, setTokenLoading] = useState(true);
  const [profileData, setProfileData] = useState<UserProfileResponse | null>(null);

  // Estados para gestionar los modales
  const [reservationToCancel, setReservationToCancel] = useState<Reservation | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

  // --- EFECTOS Y LÓGICA DE DATOS ---
  useEffect(() => {
    if (authLoading) return;

    if (!user) {
      setAccessToken(null);
      setTokenLoading(false);
      setProfileData(null);
      setReservations([]);
      setIsLoading(false);
      return;
    }

    let cancelled = false;
    const resolveToken = async () => {
      setTokenLoading(true);
      try {
        const token = await getAccessToken();
        if (!cancelled) {
          setAccessToken(token ?? null);
        }
      } catch (err) {
        console.error('Error fetching access token:', err);
        if (!cancelled) {
          setAccessToken(null);
        }
      } finally {
        if (!cancelled) {
          setTokenLoading(false);
        }
      }
    };

    resolveToken();

    return () => {
      cancelled = true;
    };
  }, [user, authLoading]);

  useEffect(() => {
    if (tokenLoading) {
      setIsLoading(true);
      return;
    }

    if (!accessToken) {
      setProfileData(null);
      setReservations([]);
      setIsLoading(false);
      return;
    }

    let cancelled = false;

    const loadProfile = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetchUserProfile(accessToken);
        if (cancelled) return;
        setProfileData(response);
        setReservations(Array.isArray(response?.schedule) ? response.schedule : []);
      } catch (err) {
        console.error('Error fetching reservations profile:', err);
        if (!cancelled) {
          setProfileData(null);
          setReservations([]);
          setError('No se pudieron cargar tus reservas.');
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [accessToken, tokenLoading]);

  // --- FUNCIONES MANEJADORAS (HANDLERS) PARA LOS MODALES ---
  const handleOpenCancelModal = (reservation: Reservation) => setReservationToCancel(reservation);
  const handleCloseCancelModal = () => setReservationToCancel(null);

  // ACTUALIZADO: La función ahora es mucho más segura.
  const handleConfirmCancellation = async () => {
    // GUARDIA DE SEGURIDAD: Si falta alguno de estos datos, la operación no puede continuar.
    if (!reservationToCancel || !profileData?.user?.id) {
      alert("No se puede cancelar la reserva. Por favor, asegúrate de haber iniciado sesión y recarga la página.");
      return;
    }

    setIsCancelling(true);
    try {
      // Usamos los datos verificados (user.id y accessToken)
      await cancelReservation(reservationToCancel.id, profileData.user.id);
      
      // Actualización optimista: Al cancelar, la reserva pasa a ser histórica.
      setReservations(current => current.map(res => 
        res.id === reservationToCancel.id ? { ...res, status: 'CANCELED', isFinished: true } : res
      ));
      handleCloseCancelModal();
    } catch (err) {
      console.error("Error al cancelar la reserva:", err);
      const errorMessage = err instanceof Error ? err.message : "Hubo un error al cancelar la reserva.";
      alert(errorMessage);
    } finally {
      setIsCancelling(false);
    }
  };

  const handleOpenDetailsModal = (reservation: Reservation) => setSelectedReservation(reservation);
  const handleCloseDetailsModal = () => setSelectedReservation(null);

  // --- LÓGICA DE RENDERIZADO ---
  const renderReservationList = () => {
    if (isLoading) {
      return Array.from({ length: 3 }).map((_, i) => <ReservationSkeleton key={i} />);
    }
    if (error) {
      return <div className="text-red-500 text-center p-4">{error}</div>;
    }
    
    // Filtro más robusto para reservas activas.
    const activeReservations = reservations.filter(res => 
      res.isFinished === false && res.status !== 'CANCELED'
    );
    
    if (activeReservations.length === 0) {
      return <div className="text-slate-500 text-center p-4">No tienes ninguna reserva activa.</div>;
    }

    return activeReservations.map((res) => (
      <ReservationCard 
        key={res.id}
        reservation={res}
        onCancelClick={handleOpenCancelModal}
        onDetailsClick={handleOpenDetailsModal}
      />
    ));
  };

  return (
    <>
      {/* El encabezado y el botón de Info fueron movidos a la página padre */}
      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-1/2 flex flex-col">
          <div className="flex-grow overflow-y-auto pr-4 space-y-4" style={{ height: '65vh' }}>
            {renderReservationList()}
          </div>
        </div>
        <div className="hidden md:flex w-1/2 items-center justify-center p-8 bg-blue-50 rounded-2xl">
          <Image
            src="/Reservation.png"
            alt="Ilustración de personas estudiando"
            width={500}
            height={500}
            className="object-contain"
          />
        </div>
      </div>

      {/* RENDERIZADO DE LOS MODALES */}
      <ConfirmationModal
        isOpen={!!reservationToCancel}
        onClose={handleCloseCancelModal}
        onConfirm={handleConfirmCancellation}
        title="Confirmar Cancelación"
        isLoading={isCancelling}
      >
        <p>
          ¿Estás seguro de que deseas cancelar tu reserva para la sala 
          <strong className="font-bold text-gray-800"> {reservationToCancel?.roomName}</strong>? 
          Esta acción no se puede deshacer.
        </p>
      </ConfirmationModal>
      
      {/* NOTA: El InfoModal ya no se controla desde aquí */}

      <ReservationDetailsModal
        isOpen={!!selectedReservation}
        onClose={handleCloseDetailsModal}
        reservation={selectedReservation}
      />
    </>
  );
};
