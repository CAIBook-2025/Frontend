// app/components/dashboard/HistoricalReservationsView.tsx
'use client';

import Image from 'next/image';
import { HistoricalReservationCard } from './HistoricalReservationCard';

interface Reservation {
  id: number;
  roomName: string;
  location: string;
  day: string;
  module: number;
  status: string;
  isFinished: boolean;
}

type HistoricalReservationsViewProps = {
  reservations: Reservation[];
};

export const HistoricalReservationsView = ({ reservations }: HistoricalReservationsViewProps) => {
  
  const historicalReservations = reservations.filter(res => 
    res.isFinished || res.status === 'CANCELED'
  );

  const renderReservationList = () => {
    if (historicalReservations.length === 0) {
      return <div className="text-slate-500 text-center p-4">No tienes ninguna reserva en tu historial.</div>;
    }
    return historicalReservations.map((res) => (
      <HistoricalReservationCard key={res.id} reservation={res} />
    ));
  };

  return (
    <div className="flex flex-col md:flex-row gap-8">
      <div className="w-full md:w-1/2 flex flex-col">
        <div className="flex-grow overflow-y-auto pr-4 space-y-4" style={{ height: '65vh' }}>
          {renderReservationList()}
        </div>
      </div>
      <div className="hidden md:flex w-full md:w-1/2 items-center justify-center p-8 bg-slate-50 rounded-2xl">
        <Image
          src="/HistoricalReservations.png"
          alt="Ilustración de un archivo o historial"
          width={400}
          height={400}
          className="object-contain"
        />
      </div>
    </div>
  );
};