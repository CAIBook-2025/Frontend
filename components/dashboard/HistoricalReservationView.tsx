// app/components/dashboard/HistoricalReservationsView.tsx
'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useDbUser } from '../../contexts/AuthProvider';
import { ReservationSkeleton } from '@/components/dashboard/ReservationSkeleton';
import { HistoricalReservationCard } from './HistoricalReservationCard';

// Reutilizamos la interfaz
interface Reservation {
  id: number; roomName: string; location: string; day: string; module: number;
  status: string; isFinished: boolean;
}

export const HistoricalReservationsView = () => {
  const { profile, loading: profileLoading } = useDbUser();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (profileLoading) {
      setIsLoading(true);
      return;
    }
    if (profile?.schedule) {
      setReservations(profile.schedule);
    }
    setIsLoading(false);
  }, [profile, profileLoading]);

  const renderReservationList = () => {
    if (isLoading) {
      return Array.from({ length: 3 }).map((_, i) => <ReservationSkeleton key={i} />);
    }

    // Filtramos para obtener solo las reservas históricas
    const historicalReservations = reservations.filter(res => 
      res.isFinished === true || res.status === 'CANCELED'
    );

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
          src="/HistoricalReservations.png" // Podrías usar otra imagen para el historial
          alt="Ilustración de un archivo o historial"
          width={400}
          height={400}
          className="object-contain"
        />
      </div>
    </div>
  );
};