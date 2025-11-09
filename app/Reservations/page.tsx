// app/my-reservations/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Info } from 'lucide-react';
import { useUser, getAccessToken } from '@auth0/nextjs-auth0';
import { fetchUserProfile, UserProfileResponse } from '@/lib/user/fetchUserProfile';
import { cancelReservation } from '../services/reservationApi';

// Componentes
import { MyReservationsView } from '@/components/dashboard/MyReservationView';
import { HistoricalReservationsView } from '@/components/dashboard/HistoricalReservationView';
import { ViewToggle } from '@/components/dashboard/ViewToggle';
import { InfoModal } from '@/components/common/InfoModal';
import { ReservationSkeleton } from '@/components/dashboard/ReservationSkeleton';
import { ConfirmationModal } from '@/components/common/ConfirmationModal';

// Interfaz de Reserva (fuente única de verdad)
interface Reservation {
  id: number;
  roomName: string;
  location: string;
  day: string;
  module: number;
  status: string;
  isFinished: boolean;
}

export default function MyReservationsPage() {
  const { user, isLoading: authLoading } = useUser();

  // --- ESTADO LEVANTADO: AHORA VIVE EN EL PADRE ---
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [profileData, setProfileData] = useState<UserProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'active' | 'historical'>('active');
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [reservationToCancel, setReservationToCancel] = useState<Reservation | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // --- LÓGICA DE OBTENCIÓN DE DATOS CENTRALIZADA ---
  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setIsLoading(false);
      setReservations([]);
      setProfileData(null);
      return;
    }

    const loadReservations = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const token = await getAccessToken();
        if (token) {
          const profile = await fetchUserProfile(token);
          setProfileData(profile);
          setReservations(Array.isArray(profile?.schedule) ? profile.schedule : []);
        }
      } catch (err) {
        console.error('Failed to load reservations:', err);
        setError('No se pudieron cargar tus reservas. Inténtalo de nuevo más tarde.');
      } finally {
        setIsLoading(false);
      }
    };

    loadReservations();
  }, [user, authLoading]);

  // --- MANEJADORES DE ACCIONES ---
  const handleOpenCancelModal = (reservation: Reservation) => setReservationToCancel(reservation);
  const handleCloseCancelModal = () => setReservationToCancel(null);

  const handleConfirmCancellation = async () => {
    if (!reservationToCancel || !profileData?.user?.id) {
      alert('Error de verificación. Por favor, recarga la página.');
      return;
    }

    setIsCancelling(true);
    try {
      await cancelReservation(reservationToCancel.id, profileData.user.id);

      setReservations((current) =>
        current.map((res) =>
          res.id === reservationToCancel.id ? { ...res, status: 'CANCELED', isFinished: true } : res
        )
      );
      handleCloseCancelModal();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Hubo un error al cancelar.';
      alert(errorMessage);
    } finally {
      setIsCancelling(false);
    }
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="w-full md:w-1/2 flex flex-col">
          <div className="flex-grow overflow-y-auto pr-4 space-y-4" style={{ height: '65vh' }}>
            {Array.from({ length: 3 }).map((_, i) => (
              <ReservationSkeleton key={i} />
            ))}
          </div>
        </div>
      );
    }

    if (error) {
      return <div className="text-red-500 text-center p-4 w-full">{error}</div>;
    }

    if (currentView === 'active') {
      return <MyReservationsView reservations={reservations} onCancelClick={handleOpenCancelModal} />;
    }

    if (currentView === 'historical') {
      return <HistoricalReservationsView reservations={reservations} />;
    }
  };

  return (
    <>
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8 border-b pb-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <h1 className="text-4xl font-bold text-gray-900">Mis Reservas</h1>
              <ViewToggle currentView={currentView} onViewChange={setCurrentView} />
            </div>
          </div>
          <div className="flex items-center justify-between mt-2">
            <p className="text-slate-600">
              {currentView === 'active'
                ? 'Gestiona todas tus próximas reservas.'
                : 'Consulta el historial de tus reservas pasadas.'}
            </p>
            {currentView === 'active' && (
              <button
                onClick={() => setIsInfoModalOpen(true)}
                className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
              >
                <Info size={16} /> ¿Cómo hacer Check-In?
              </button>
            )}
          </div>
        </div>

        {renderContent()}
      </main>

      <InfoModal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} title="Pasos para hacer Check-In">
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-500 text-sm font-bold text-white">
              1
            </div>
            <p>
              Dirígete a la sala que tienes reservada y busca el <strong>código QR</strong> que se encuentra en la
              entrada.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-500 text-sm font-bold text-white">
              2
            </div>
            <p>
              Escanea el código con tu celular. Serás redirigido a la página de check-in de la sala, donde se validará
              tu reserva activa.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-500 text-sm font-bold text-white">
              3
            </div>
            <p>
              Haz clic en el botón <strong>Confirmar Asistencia</strong> y ¡listo! Tu reserva quedará confirmada y
              podrás usar la sala.
            </p>
          </div>
        </div>
      </InfoModal>

      <ConfirmationModal
        isOpen={!!reservationToCancel}
        onClose={handleCloseCancelModal}
        onConfirm={handleConfirmCancellation}
        title="Confirmar Cancelación"
        isLoading={isCancelling}
      >
        <p>
          ¿Estás seguro de que deseas cancelar tu reserva para la sala
          <strong className="font-bold text-gray-800"> {reservationToCancel?.roomName}</strong>? Esta acción no se puede
          deshacer.
        </p>
      </ConfirmationModal>
    </>
  );
}
