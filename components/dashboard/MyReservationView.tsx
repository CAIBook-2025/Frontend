// app/components/dashboard/MyReservationsView.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Info } from 'lucide-react';
import { useDbUser } from '../../contexts/AuthProvider';

// Importaciones de todos los componentes que hemos creado
import { ReservationCard } from './ReservationCard';
import { ReservationSkeleton } from '@/components/dashboard/ReservationSkeleton';
import { ConfirmationModal } from '@/components/common/ConfirmationModal';
import { InfoModal } from '@/components/common/InfoModal';
import { ReservationDetailsModal } from '@/components/common/ReservationDetailsModal';

// Importación del servicio de API (solo para cancelar)
import { cancelReservation } from '../../app/services/reservationApi';

// NUEVO: Definimos el tipo de reserva localmente para incluir el estado.
// Esto nos permite manejar el estado ('Activa', 'Cancelada') en el frontend.
interface Reservation {
  id: number;
  roomName: string;
  location: string;
  day: string;
  module: number;
  status: 'Activa' | 'Cancelada'; // Añadimos el estado que no viene en `profile.schedule`
}

export const MyReservationsView = () => {
  // --- ESTADOS DEL COMPONENTE ---
  // Obtenemos el perfil del usuario desde el contexto. `loading` nos dirá si el perfil aún se está cargando.
  const { profile, loading: profileLoading } = useDbUser();
  console.log("PROFILE EN MY RESERVATIONS:", profile);

  // Estado para la lista de reservas (ahora derivado del perfil)
  const [reservations, setReservations] = useState<Reservation[]>([]);
  
  // El estado de carga del componente ahora depende directamente del estado de carga del perfil
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para gestionar el modal de cancelación (sin cambios)
  const [reservationToCancel, setReservationToCancel] = useState<Reservation | null>(null);
  const [isCancelling, setIsCancelling] = useState(false);

  // Estado para gestionar el modal de información ("Cómo hacer Check-In") (sin cambios)
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  // Estado para gestionar el modal de detalles de la reserva (sin cambios)
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

  // --- EFECTOS Y LÓGICA DE DATOS ---

  // REFACTORIZADO: Este useEffect ahora reacciona a los cambios en `profile` y `profileLoading`
  // en lugar de hacer su propia llamada a la API.
  useEffect(() => {
    // Si el perfil aún está cargando, mostramos los skeletons.
    if (profileLoading) {
      setIsLoading(true);
      return;
    }

    // Si la carga terminó pero no hay perfil, mostramos un error.
    if (!profile) {
      setError('No se pudieron cargar tus datos de perfil y reservas.');
      setIsLoading(false);
      return;
    }

    // Si la carga terminó y tenemos perfil, procesamos las reservas.
    if (profile.schedule && Array.isArray(profile.schedule)) {
      // Transformamos los datos de `profile.schedule` a nuestro tipo `Reservation` local,
      // añadiendo el estado 'Activa' por defecto a cada una.
      const formattedReservations = profile.schedule.map(item => ({
        ...item,
        status: 'Activa' as const, // Asignamos un estado inicial
      }));
      setReservations(formattedReservations);
    } else {
        // Si no hay `schedule` o no es un array, lo dejamos como vacío.
        setReservations([]);
    }
    
    // Una vez procesado, terminamos el estado de carga.
    setIsLoading(false);

  }, [profile, profileLoading]); // Se ejecuta cada vez que el perfil o su estado de carga cambian

  // --- FUNCIONES MANEJADORAS (HANDLERS) PARA LOS MODALES ---

  // Handlers para el modal de CANCELACIÓN
  const handleOpenCancelModal = (reservation: Reservation) => setReservationToCancel(reservation);
  const handleCloseCancelModal = () => setReservationToCancel(null);

  const handleConfirmCancellation = async () => {
    if (!reservationToCancel) return;
    setIsCancelling(true);
    try {
      console.log("Cancelando reserva con ID:", reservationToCancel.id);
      await cancelReservation(reservationToCancel.id, profile?.user.id || 0);
      // Actualización optimista: Cambiamos el estado localmente sin recargar
      setReservations(current => current.map(res => 
        res.id === reservationToCancel.id ? { ...res, status: 'Cancelada' } : res
      ));
      handleCloseCancelModal();
    } catch (err) {
      console.error("Error al cancelar la reserva:", err);
      alert("Hubo un error al cancelar la reserva."); // Podríamos usar un modal de error aquí también
    } finally {
      setIsCancelling(false);
    }
  };

  // Handlers para el modal de DETALLES
  const handleOpenDetailsModal = (reservation: Reservation) => setSelectedReservation(reservation);
  const handleCloseDetailsModal = () => setSelectedReservation(null);

  // --- LÓGICA DE RENDERIZADO ---

  // Función auxiliar para renderizar la lista de tarjetas (sin cambios)
  const renderReservationList = () => {
    if (isLoading) {
      return (
        <>
          <ReservationSkeleton />
          <ReservationSkeleton />
          <ReservationSkeleton />
        </>
      );
    }
    if (error) {
      return <div className="text-red-500 text-center p-4">{error}</div>;
    }
    // Mostramos solo las reservas que no han sido canceladas en esta sesión
    const activeReservations = reservations.filter(res => res.status === 'Activa');
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
      {/* Encabezado de la sección */}
      <div className="mb-6 border-b pb-4">
        <h1 className="text-4xl font-bold text-gray-900">Mis Reservas</h1>
        <div className="flex items-center justify-between mt-2">
            <p className="text-slate-600">Aquí puedes gestionar todas tus próximas reservas de salas.</p>
            <button 
              onClick={() => setIsInfoModalOpen(true)}
              className="flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800 transition-colors"
            >
              <Info size={16} />
              ¿Cómo hacer Check-In?
            </button>
        </div>
      </div>

      {/* Layout principal de dos columnas */}
      <div className="flex flex-col md:flex-row gap-8">
        {/* Columna Izquierda: Lista de Reservas Scrolleable */}
        <div className="w-full md:w-1/2 flex flex-col">
          <div className="flex-grow overflow-y-auto pr-4 space-y-4" style={{ height: '65vh' }}>
            {renderReservationList()}
          </div>
        </div>
        {/* Columna Derecha: Imagen Estática */}
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

      {/* --- RENDERIZADO DE TODOS LOS MODALES --- */}

      {/* Modal para Confirmar Cancelación */}
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

      {/* Modal Informativo de Check-In */}
      <InfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        title="Pasos para hacer Check-In"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3"><div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-500 text-sm font-bold text-white">1</div><p>Dirígete a la sala que tienes reservada y busca el <strong>código QR</strong> que se encuentra en la entrada.</p></div>
          <div className="flex items-start gap-3"><div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-500 text-sm font-bold text-white">2</div><p>Escanea el código con tu celular. Serás redirigido a la página de check-in de la sala, donde se validará tu reserva activa.</p></div>
          <div className="flex items-start gap-3"><div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-500 text-sm font-bold text-white">3</div><p>Haz clic en el botón <strong>Confirmar Asistencia</strong> y ¡listo! Tu reserva quedará confirmada y podrás usar la sala.</p></div>
        </div>
      </InfoModal>

      {/* Modal para ver Detalles de la Reserva */}
      <ReservationDetailsModal
        isOpen={!!selectedReservation}
        onClose={handleCloseDetailsModal}
        reservation={selectedReservation}
      />
    </>
  );
};