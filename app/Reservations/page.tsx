// app/Reservations/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useUser, getAccessToken } from '@auth0/nextjs-auth0';
import { Loader2, Info } from 'lucide-react';

import { MyReservationsView } from '@/components/dashboard/MyReservationView';
import { HistoricalReservationsView } from '@/components/dashboard/HistoricalReservationView';
import { ViewToggle } from '@/components/dashboard/ViewToggle';
import { ConfirmationModal } from '@/components/common/ConfirmationModal';
import { InfoModal } from '@/components/common/InfoModal';
import { fetchUserProfile, UserProfileResponse, UserScheduleItem } from '@/lib/user/fetchUserProfile';
import { cancelReservation } from '@/app/services/reservationApi';

// Tipo para las reservas que usaremos en la UI
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
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<UserProfileResponse | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Vista activa: 'active' o 'historical'
  const [currentView, setCurrentView] = useState<'active' | 'historical'>('active');

  // Estados para modales
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);
  const [reservationToCancel, setReservationToCancel] = useState<Reservation | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Obtener access token
  useEffect(() => {
    if (authLoading) return;
    
    if (!user) {
      setError('Debes iniciar sesión para ver tus reservas.');
      setIsLoading(false);
      return;
    }

    const fetchToken = async () => {
      try {
        const token = await getAccessToken();
        setAccessToken(token ?? null);
      } catch (err) {
        console.error('Error fetching access token:', err);
        setError('Error de autenticación. Por favor, recarga la página.');
        setIsLoading(false);
      }
    };

    fetchToken();
  }, [user, authLoading]);

  // Obtener perfil y reservas
  useEffect(() => {
    if (!accessToken) return;

    const loadProfile = async () => {
      try {
        const profile = await fetchUserProfile(accessToken);
        if (profile) {
          setProfileData(profile);
          
          // Transformar schedule a reservations
          const transformedReservations: Reservation[] = (profile.schedule || []).map((item: UserScheduleItem) => ({
            id: item.id,
            roomName: item.roomName || 'Sala sin nombre',
            location: item.location || 'Ubicación no especificada',
            day: item.day,
            module: item.module,
            status: item.status,
            isFinished: item.isFinished,
          }));

          setReservations(transformedReservations);
        }
      } catch (err) {
        console.error('Error loading profile:', err);
        setError('No se pudieron cargar las reservas. Intenta de nuevo más tarde.');
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, [accessToken]);

  // Handlers para cancelación
  const handleOpenCancelModal = (reservation: Reservation) => setReservationToCancel(reservation);
  const handleCloseCancelModal = () => setReservationToCancel(null);

  const handleConfirmCancellation = async () => {
    if (!reservationToCancel || !profileData?.user?.id) return;

    setIsCancelling(true);
    try {
      const result = await cancelReservation(reservationToCancel.id, profileData.user.id);
      if (result.success) {
        // Actualizar la reserva localmente
        setReservations(current =>
          current.map(res =>
            res.id === reservationToCancel.id
              ? { ...res, status: 'CANCELED', isFinished: true }
              : res
          )
        );
        handleCloseCancelModal();
      }
    } catch (err) {
      console.error('Error cancelling reservation:', err);
      alert('Error al cancelar la reserva. Por favor, intenta de nuevo.');
    } finally {
      setIsCancelling(false);
    }
  };

  // Renderizado de loading y errores
  if (isLoading) {
    return (
      <main className="container mx-auto px-6 py-8">
        <div className="flex flex-col items-center justify-center py-20">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600" />
          <p className="mt-4 text-lg text-slate-600">Cargando tus reservas...</p>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container mx-auto px-6 py-8">
        <div className="text-center py-20">
          <p className="text-red-500 text-lg">{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-6 py-8">
      {/* Encabezado */}
      <div className="mb-6 border-b pb-4">
        <h1 className="text-4xl font-bold text-gray-900">Mis Reservas</h1>
        <div className="flex items-center justify-between mt-2">
          <p className="text-slate-600">Aquí puedes gestionar todas tus reservas de salas.</p>
          <button
            onClick={() => setIsInfoModalOpen(true)}
            className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
          >
            <Info size={16} />
            ¿Cómo hacer Check-In?
          </button>
        </div>
      </div>

      {/* Toggle de vista */}
      <div className="mb-6 flex justify-center">
        <ViewToggle currentView={currentView} onViewChange={setCurrentView} />
      </div>

      {/* Contenido según la vista */}
      {currentView === 'active' ? (
        <MyReservationsView
          reservations={reservations}
          onCancelClick={handleOpenCancelModal}
        />
      ) : (
        <HistoricalReservationsView reservations={reservations} />
      )}

      {/* Modal de Confirmación de Cancelación */}
      <ConfirmationModal
        isOpen={!!reservationToCancel}
        onClose={handleCloseCancelModal}
        onConfirm={handleConfirmCancellation}
        title="Confirmar Cancelación"
        isLoading={isCancelling}
      >
        <p>
          ¿Estás seguro de que deseas cancelar tu reserva para la sala{' '}
          <strong className="font-bold text-gray-800">{reservationToCancel?.roomName}</strong>?
          Esta acción no se puede deshacer.
        </p>
      </ConfirmationModal>

      {/* Modal Informativo de Check-In */}
      <InfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        title="Pasos para hacer Check-In"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-500 text-sm font-bold text-white">
              1
            </div>
            <p>
              Dirígete a la sala que tienes reservada y busca el <strong>código QR</strong> que se
              encuentra en la entrada.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-500 text-sm font-bold text-white">
              2
            </div>
            <p>
              Escanea el código con tu celular. Serás redirigido a la página de check-in de la sala,
              donde se validará tu reserva activa.
            </p>
          </div>
          <div className="flex items-start gap-3">
            <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-500 text-sm font-bold text-white">
              3
            </div>
            <p>
              Haz clic en el botón <strong>Confirmar Asistencia</strong> y ¡listo! Tu reserva quedará
              confirmada y podrás usar la sala.
            </p>
          </div>
        </div>
      </InfoModal>
    </main>
  );
}
