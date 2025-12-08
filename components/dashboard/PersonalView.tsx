// components/dashboard/PersonalView.tsx
'use client';

import { useState, useEffect } from 'react';
import Link, { type LinkProps } from 'next/link';
import { BookMarked, CalendarDays, ArrowRight, CalendarClock, PartyPopper, ShieldAlert, Loader2, Sparkles } from 'lucide-react';
import { useUser, getAccessToken } from '@auth0/nextjs-auth0';
import { fetchUserProfile, UserScheduleItem } from '@/lib/user/fetchUserProfile';

type Stats = {
  reservasActivas: number;
  // eventosProximos: number;
  strikes: number;
  userId: number;
};

// --- Componente para Tarjetas de Acción Principal ---
const ActionCard = ({
  href,
  icon,
  title,
  description,
  disabled = false,
  disabledMessage,
}: {
  href: LinkProps['href'];
  icon: React.ReactNode;
  title: string;
  description: string;
  disabled?: boolean;
  disabledMessage?: string;
}) => {
  if (disabled) {
    return (
      <div className="block rounded-xl border border-red-200 bg-red-50 p-6 shadow-md cursor-not-allowed opacity-80">
        <div className="flex items-start justify-between">
          <div>
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">{icon}</div>
            <h3 className="text-xl font-bold text-red-800">{title}</h3>
            <p className="mt-1 text-red-600">{disabledMessage || description}</p>
          </div>
          <ShieldAlert className="mt-1 h-5 w-5 text-red-400" />
        </div>
      </div>
    );
  }

  return (
    <Link
      href={href}
      className="group block rounded-xl border border-slate-200 bg-white p-6 shadow-md transition-all duration-300 hover:border-blue-500 hover:shadow-lg"
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-blue-100">{icon}</div>
          <h3 className="text-xl font-bold text-gray-800">{title}</h3>
          <p className="mt-1 text-slate-600">{description}</p>
        </div>
        <ArrowRight className="mt-1 h-5 w-5 text-slate-400 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-blue-500" />
      </div>
    </Link>
  );
};

// --- Componente para Estadísticas Rápidas ---
const StatCard = ({ icon, value, label }: { icon: React.ReactNode; value: string | number; label: string }) => (
  <div className="rounded-lg bg-white p-4 shadow-sm border border-slate-200">
    <div className="flex items-center gap-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">{icon}</div>
      <div>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        <p className="text-sm text-slate-500">{label}</p>
      </div>
    </div>
  </div>
);

// Función para formatear la fecha y hora
const formatDateTime = (day: string, module: number) => {
  const date = new Date(day);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const dateOnly = new Date(date);
  dateOnly.setHours(0, 0, 0, 0);

  // Mapeo de módulos a horas
  const moduleTimes: Record<number, string> = {
    1: '08:20 - 09:30',
    2: '09:40 - 10:50',
    3: '11:00 - 12:10',
    4: '12:20 - 13:30',
    5: '14:50 - 16:00',
    6: '16:10 - 17:20',
    7: '17:30 - 18:40',
    8: '18:50 - 20:00',
    9: '20:10 - 21:20',
  };

  const timeRange = moduleTimes[module] || `${module}:00`;

  let dateLabel = '';
  if (dateOnly.getTime() === today.getTime()) {
    dateLabel = 'Hoy';
  } else if (dateOnly.getTime() === tomorrow.getTime()) {
    dateLabel = 'Mañana';
  } else {
    dateLabel = date.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
    dateLabel = dateLabel.charAt(0).toUpperCase() + dateLabel.slice(1);
  }

  return `${dateLabel}, ${timeRange}`;
};

// Función para obtener el badge de estado
const getStatusBadge = (status: string) => {
  const statusMap: Record<string, { bg: string; text: string; label: string }> = {
    PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pendiente' },
    PRESENT: { bg: 'bg-green-100', text: 'text-green-800', label: 'Confirmada' },
    ABSENT: { bg: 'bg-red-100', text: 'text-red-800', label: 'Ausente' },
    CANCELED: { bg: 'bg-slate-100', text: 'text-slate-800', label: 'Cancelada' },
  };

  const statusInfo = statusMap[status] || { bg: 'bg-slate-100', text: 'text-slate-800', label: status };
  return (
    <span className={`rounded-full ${statusInfo.bg} px-3 py-1 text-xs font-medium ${statusInfo.text}`}>
      {statusInfo.label}
    </span>
  );
};

export const PersonalView = ({ stats }: { stats: Stats }) => {
  const { user } = useUser();
  const [upcomingReservations, setUpcomingReservations] = useState<UserScheduleItem[]>([]);
  const [isLoadingUpcoming, setIsLoadingUpcoming] = useState(true);

  useEffect(() => {
    async function loadUpcomingReservations() {
      if (!user) {
        setIsLoadingUpcoming(false);
        return;
      }

      try {
        const accessToken = await getAccessToken();
        const profile = await fetchUserProfile(accessToken);

        if (profile?.schedule) {
          const now = new Date();
          // Filtrar reservas que no están terminadas y están en el futuro o hoy
          const upcoming = profile.schedule
            .filter((reservation) => {
              const reservationDate = new Date(reservation.day);
              reservationDate.setHours(0, 0, 0, 0);
              const today = new Date(now);
              today.setHours(0, 0, 0, 0);
              
              return (
                !reservation.isFinished &&
                reservation.status !== 'CANCELED' &&
                reservationDate >= today
              );
            })
            .sort((a, b) => {
              // Ordenar por fecha más cercana primero
              const dateA = new Date(a.day).getTime();
              const dateB = new Date(b.day).getTime();
              if (dateA !== dateB) return dateA - dateB;
              return a.module - b.module;
            })
            .slice(0, 5); // Mostrar máximo 5 próximas reservas

          setUpcomingReservations(upcoming);
        }
      } catch (error) {
        console.error('Error loading upcoming reservations:', error);
      } finally {
        setIsLoadingUpcoming(false);
      }
    }

    loadUpcomingReservations();
  }, [user]);

  return (
    <>
      {/* 2. Resumen Rápido (Stats) */}
      <section className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard icon={<CalendarClock size={20} />} value={stats.reservasActivas} label="Reservas Activas" />
        <StatCard icon={<PartyPopper size={20} />} value={'0'} label="Evento Próximo" />
        <StatCard icon={<ShieldAlert size={20} />} value={stats.strikes} label="Strikes" />
      </section>

      {/* Alerta de cuenta bloqueada por strikes */}
      {stats.strikes >= 3 && (
        <section className="mb-8">
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 shadow-sm">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="rounded-full bg-red-100 p-2">
                  <ShieldAlert className="h-6 w-6 text-red-600" />
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-red-800 mb-2">
                  Tu cuenta está restringida
                </h3>
                <p className="text-sm text-red-700">
                  Has acumulado {stats.strikes} strikes, por lo que no puedes realizar nuevas reservas de salas. 
                  Por favor, acércate a un administrador para revisar tu caso y resolver esta situación.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 3. Acciones Principales */}
      <section className="mb-12 grid grid-cols-1 gap-8 md:grid-cols-3">
        <ActionCard
          href={{ pathname: '/Student/StudyRoomBooker', query: { userId: stats.userId } }}
          icon={<BookMarked className={`h-6 w-6 ${stats.strikes >= 3 ? 'text-red-500' : 'text-blue-500'}`} />}
          title="Reservar una Sala"
          description="Busca y asegura un espacio de estudio para ti o tu grupo."
          disabled={stats.strikes >= 3}
          disabledMessage="No puedes reservar salas. Acércate a un administrador para revisar tu caso."
        />
        <ActionCard
          href="Reservations"
          icon={<BookMarked className="h-6 w-6 text-blue-500" />}
          title="Ver mis reservas"
          description="Revisa tus reservas de salas, no se te vaya a olvidar!."
        />
        <ActionCard
          href="/events"
          icon={<CalendarDays className="h-6 w-6 text-blue-500" />}
          title="Explorar Eventos"
          description="Descubre talleres, charlas y actividades organizadas por la comunidad."
        />
      </section>

      {/* 4. Próximos Compromisos */}
      <section>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Próximamente</h2>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          {isLoadingUpcoming ? (
            <div className="flex justify-center items-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
            </div>
          ) : upcomingReservations.length === 0 ? (
            <div className="text-center py-12">
              <div className="flex justify-center mb-4">
                <div className="rounded-full bg-blue-100 p-4">
                  <Sparkles className="h-8 w-8 text-blue-600" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">¡No tienes reservas próximas!</h3>
              <p className="text-slate-600 mb-6 max-w-md mx-auto">
                ¡Encuentra el espacio perfecto para concentrarte y alcanzar tus objetivos!
              </p>
            </div>
          ) : (
            <ul className="space-y-4">
              {upcomingReservations.map((reservation, index) => (
                <li
                  key={reservation.id}
                  className={`flex items-center justify-between ${
                    index < upcomingReservations.length - 1 ? 'border-b border-slate-100 pb-3' : ''
                  }`}
                >
                  <div>
                    <p className="font-semibold text-gray-800">{reservation.roomName}</p>
                    <p className="text-sm text-slate-500">
                      {formatDateTime(reservation.day, reservation.module)}
                    </p>
                    {reservation.location && (
                      <p className="text-xs text-slate-400 mt-1">{reservation.location}</p>
                    )}
                  </div>
                  {getStatusBadge(reservation.status)}
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  );
};