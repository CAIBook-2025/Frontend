'use client';

import { CalendarDays, CheckCircle2, ClipboardClock } from 'lucide-react';
import { StatCard } from '@/components/ui/dashboard/QuickStatCard';
import { EventHistoryTable } from '@/components/ui/admin/history/events-history-table';
import { useCallback, useEffect, useState } from 'react';
import { useUser, getAccessToken } from '@auth0/nextjs-auth0';
import { fetchEventRequests } from '@/lib/events/fetchEventRequests';
import { EventRequest } from '@/types/eventRequest';
import { resolveAccessToken } from '@/app/Admin/Room/room-utils';

export function EventSection() {
  const { user, isLoading: isUserLoading } = useUser();
  const [events, setEvents] = useState<EventRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadEvents = useCallback(async () => {
    if (!user) return;
    setIsLoading(true);

    try {
      const tokenResponse = await getAccessToken();
      const accessToken = resolveAccessToken(tokenResponse);

      if (!accessToken) {
        console.warn('Access token not available');
        return;
      }

      const fetchedEvents = await fetchEventRequests(accessToken);
      if (fetchedEvents) {
        setEvents(fetchedEvents);
      }
    } catch (error) {
      console.error('Error fetching event requests:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (isUserLoading) return;
    if (user) {
      loadEvents();
    }
  }, [isUserLoading, user, loadEvents]);

  const totalEventos = events.length;
  const totalCompletados = events.filter((e) => e.status === 'CONFIRMED').length;
  const totalPendientes = events.filter((e) => e.status === 'PENDING').length;

  return (
    <>
      {isLoading ? (
        <div className="p-8 text-center text-gray-500">Cargando eventos...</div>
      ) : (
        <section className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
              icon={<CalendarDays className="h-4 w-4" />}
              value={totalEventos}
              label="Eventos Totales"
              footer="Histórico"
              variant="blue"
            />
            <StatCard
              icon={<CheckCircle2 className="h-4 w-4" />}
              value={totalCompletados}
              label="Aprobados/Completados"
              footer="Eventos exitosos"
              variant="blue"
            />
            <StatCard
              icon={<ClipboardClock className="h-4 w-4" />}
              value={totalPendientes}
              label="Pendientes"
              footer="Por revisar"
              variant="yellow"
            />
          </div>
          <EventHistoryTable events={events} onUpdate={loadEvents} />
        </section>
      )}
    </>
  );
}
