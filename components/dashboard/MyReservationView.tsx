// app/components/dashboard/MyReservationsView.tsx
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ReservationCard } from './ReservationCard';
import { ReservationDetailsModal } from '@/components/common/ReservationDetailsModal';

interface Reservation {
  id: number;
  roomName: string;
  location: string;
  day: string;
  module: number;
  status: string;
  isFinished: boolean;
}

type MyReservationsViewProps = {
  reservations: Reservation[];
  onCancelClick: (reservation: Reservation) => void;
};

export const MyReservationsView = ({ reservations, onCancelClick }: MyReservationsViewProps) => {
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null);

  const handleOpenDetailsModal = (reservation: Reservation) => setSelectedReservation(reservation);
  const handleCloseDetailsModal = () => setSelectedReservation(null);

  const activeReservations = reservations.filter(res => 
    !res.isFinished && res.status !== 'CANCELED'
  );

  const renderReservationList = () => {
    if (activeReservations.length === 0) {
      return <div className="text-slate-500 text-center p-4">No tienes ninguna reserva activa.</div>;
    }
    return activeReservations.map((res) => (
      <ReservationCard 
        key={res.id}
        reservation={res}
        onCancelClick={onCancelClick}
        onDetailsClick={handleOpenDetailsModal}
      />
    ));
  };

  return (
    <>
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
      <ReservationDetailsModal
        isOpen={!!selectedReservation}
        onClose={handleCloseDetailsModal}
        reservation={selectedReservation}
      />
    </>
  );
};