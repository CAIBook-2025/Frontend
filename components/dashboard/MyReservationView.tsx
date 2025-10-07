// app/components/dashboard/MyReservationsView.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Info } from 'lucide-react';

// Importaciones de todos los componentes que hemos creado
import { ReservationCard } from './ReservationCard';
import { ReservationSkeleton } from '@/components/dashboard/ReservationSkeleton';
import { ConfirmationModal } from '@/components/common/ConfirmationModal';
import { InfoModal } from '@/components/common/InfoModal';
import { ReservationDetailsModal } from '@/components/common/ReservationDetailsModal';

// Importaciones del servicio de API y los tipos de datos
import { getReservations, cancelReservation, Reservation } from '../../app/services/reservationApi';

export const MyReservationsView = () => {
  // --- ESTADOS DEL COMPONENTE ---

  // Estado para la lista de reservas obtenidas de la API
  const [reservations, setReservations] = useState<Reservation[]>([]);
  
  // Estados para el ciclo de vida de la carga inicial de datos
  const [isLoading, setIsLoading] = useState(true); // Inicia en true para mostrar skeletons
  const [error, setError] = useState<string | null>(null);

  // Estados para gestionar el modal de cancelación
  const [reservationToCancel, setReservationToCancel] = useState<Reservation | null>(null);
  const [isCancelling, setIsCancelling] = useState(false); // Para el estado de carga del botón del modal

  // Estado para gestionar el modal de información ("Cómo hacer Check-In")
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  // Estado para gestionar el modal de detalles de la reserva
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

  // --- EFECTOS Y LÓGICA DE DATOS ---

  // useEffect se ejecuta una vez cuando el componente se monta para obtener las reservas
  useEffect(() => {
    const fetchReservations = async () => {
      try {
        const data = await getReservations();
        setReservations(data);
      } catch (err) {
        setError('No se pudieron cargar las reservas. Intenta de nuevo más tarde.');
        console.error("Error al obtener las reservas:", err);
      } finally {
        setIsLoading(false); // Termina el estado de carga, con o sin éxito
      }
    };

    fetchReservations();
  }, []); // El array vacío [] asegura que esto se ejecute solo una vez

  // --- FUNCIONES MANEJADORAS (HANDLERS) PARA LOS MODALES ---

  // Handlers para el modal de CANCELACIÓN
  const handleOpenCancelModal = (reservation: Reservation) => setReservationToCancel(reservation);
  const handleCloseCancelModal = () => setReservationToCancel(null);
  const handleConfirmCancellation = async () => {
    if (!reservationToCancel) return;
    setIsCancelling(true);
    try {
      await cancelReservation(reservationToCancel.id);
      setReservations(current => current.map(res => 
        res.id === reservationToCancel.id ? { ...res, status: 'Cancelada' } : res
      ));
      handleCloseCancelModal();
    } catch (err) {
      console.error("Error al cancelar la reserva:", err);
      alert("Hubo un error al cancelar la reserva.");
    } finally {
      setIsCancelling(false);
    }
  };

  // Handlers para el modal de DETALLES
  const handleOpenDetailsModal = (reservation: Reservation) => setSelectedReservation(reservation);
  const handleCloseDetailsModal = () => setSelectedReservation(null);

  // --- LÓGICA DE RENDERIZADO ---

  // Función auxiliar para renderizar la lista de tarjetas (o sus estados alternativos)
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
    if (reservations.length === 0) {
      return <div className="text-slate-500 text-center p-4">No tienes ninguna reserva activa.</div>;
    }
    return reservations.map((res) => (
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