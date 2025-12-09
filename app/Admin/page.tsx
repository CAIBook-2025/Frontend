'use client';

import React, { useEffect, useState } from 'react';
import { Building2, Calendar, Users, AlertTriangle } from 'lucide-react';
import { StatCard } from '@/components/ui/dashboard/QuickStatCard';
import { DashboardSection } from '@/components/ui/dashboard/DashboardSection';
import { ActivityCard } from '@/components/ui/dashboard/admin/ActivityCard';
import { GroupRequestCard } from '@/components/ui/dashboard/admin/GroupRequestCard';
import { AdminToolsCard } from '@/components/ui/dashboard/admin/AdminTools';
import { fetchGroupRequests } from '@/lib/groups/fetchGroupRequests';
import { fetchSchedule } from '@/lib/schedule/fetchSchedule';
import { fetchEventRequests } from '@/lib/events/fetchEventRequests';
import { getStrikes } from '@/lib/strikes/getStrikes';
import { getAccessToken } from '@auth0/nextjs-auth0';
import { resolveAccessToken } from '@/app/Admin/Room/room-utils';
import { GroupRequest } from '@/types/groupRequest';
import { StatsGridSkeleton, ListSkeleton } from '@/components/ui/dashboard/admin/DashboardSkeletons';

function getTimeAgo(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return 'hace unos segundos';

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `hace ${diffInMinutes} minuto${diffInMinutes > 1 ? 's' : ''}`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;

  const diffInWeeks = Math.floor(diffInDays / 7);
  return `hace ${diffInWeeks} semana${diffInWeeks > 1 ? 's' : ''}`;
}

export default function CAIAdminDashboard() {
  const [stats, setStats] = useState({
    totalReservations: 0,
    activeEvents: 0,
    pendingGroups: 0,
    totalStrikes: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  const [recentRequests, setRecentRequests] = useState<GroupRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);

  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loadingActivity, setLoadingActivity] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const tokenResponse = await getAccessToken();
        const accessToken = resolveAccessToken(tokenResponse);

        // 1. Fetch Request Group (Existing logic + Stats)
        const groupRequests = await fetchGroupRequests(accessToken, { status: 'PENDING' });

        if (groupRequests) {
          // Sort for list
          const sorted = groupRequests
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 3);
          setRecentRequests(sorted);
        }
        setLoadingRequests(false);

        // 2. Fetch Schedule (Total Reserves This Week)
        // Calculate current week dates (Monday to Sunday)
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0 (Sun) - 6 (Sat)
        const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
        const monday = new Date(today);
        monday.setDate(today.getDate() + diffToMonday);

        const weekDates: string[] = [];
        for (let i = 0; i < 7; i++) {
          const d = new Date(monday);
          d.setDate(monday.getDate() + i);
          weekDates.push(d.toISOString().split('T')[0]);
        }

        const schedulePromises = weekDates.map((date) => fetchSchedule(accessToken, { day: date }));
        const weeklySchedules = await Promise.all(schedulePromises);
        const totalReservations = weeklySchedules.reduce((acc, curr) => acc + (curr?.total || 0), 0);

        // 3. Fetch Active Events
        const activeEvents = await fetchEventRequests(accessToken, { status: 'CONFIRMED' });

        // 4. Fetch Strikes
        const allStrikes = accessToken ? await getStrikes(accessToken) : [];

        setStats({
          totalReservations,
          activeEvents: activeEvents?.length || 0,
          pendingGroups: groupRequests?.length || 0,
          totalStrikes: allStrikes?.length || 0,
        });
        setLoadingStats(false);

        // 5. Recent Activity (Schedules + Events)
        const recentSchedulesRaw = await fetchSchedule(accessToken, { take: 20 });
        const allEventsRaw = await fetchEventRequests(accessToken);

        const activities: { date: Date; type: string; item: any }[] = [];

        if (recentSchedulesRaw?.items) {
          recentSchedulesRaw.items.forEach((s) => {
            if (s.createdAt && s.user) {
              activities.push({ date: new Date(s.createdAt), type: 'RESERVATION', item: s });
            }
          });
        }

        if (allEventsRaw) {
          allEventsRaw.forEach((e) => {
            activities.push({ date: new Date(e.createdAt), type: 'EVENT', item: e });
          });
        }

        // Sort descending
        activities.sort((a, b) => b.date.getTime() - a.date.getTime());

        // Take top 3
        const top3 = activities.slice(0, 3).map((act) => {
          if (act.type === 'RESERVATION') {
            const s = act.item; // ScheduleItem
            const userName = s.user ? `${s.user.first_name} ${s.user.last_name}` : 'Usuario desconocido';
            const roomName = s.studyRoom ? s.studyRoom.name : 'Sala desconocida';
            return {
              id: `sched-${s.id}`,
              status: 'Reserva creada',
              details: `${roomName} - ${userName}`,
              variant: 'green',
            };
          } else {
            const e = act.item; // EventRequest
            let statusText = 'Evento solicitado';
            let variant = 'blue';
            if (e.status === 'CONFIRMED') {
              statusText = 'Evento confirmado';
              variant = 'green';
            } else if (e.status === 'CANCELLED') {
              statusText = 'Evento cancelado';
              variant = 'red';
            } else if (e.status === 'PENDING') {
              statusText = 'Evento pendiente';
              variant = 'yellow';
            }

            return {
              id: `event-${e.id}`,
              status: statusText,
              details: `${e.name} - ${e.group?.name || 'Sin grupo'}`,
              variant: variant,
            };
          }
        });

        setRecentActivity(top3);
        setLoadingActivity(false);
      } catch (error) {
        console.error('Error loading dashboard data:', error);
      } finally {
        setLoadingStats(false);
        setLoadingRequests(false);
        setLoadingActivity(false);
      }
    };

    loadDashboardData();
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Quick Stats */}
      <section>
        {loadingStats ? (
          <StatsGridSkeleton />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={<Building2 className="h-4 w-4" />}
              value={stats.totalReservations}
              label="Reservas Totales"
              footer="Este mes"
              variant="blue"
            />
            <StatCard
              icon={<Calendar className="h-4 w-4" />}
              value={stats.activeEvents}
              label="Eventos Activos"
              footer="En curso"
              variant="yellow"
            />
            <StatCard
              icon={<Users className="h-4 w-4" />}
              value={stats.pendingGroups}
              label="Grupos Pendientes"
              footer="Requieren revisión"
              variant="blue"
            />
            <StatCard
              icon={<AlertTriangle className="h-4 w-4" />}
              value={stats.totalStrikes}
              label="Strikes Activos"
              footer="Usuarios sancionados"
              variant="red"
            />
          </div>
        )}
      </section>

      {/* Dos columnas iguales en altura */}
      <section>
        <div className="grid gap-6 lg:grid-cols-2">
          <DashboardSection title="Solicitudes de Grupo" buttonText="Ver Todas" href="/Admin/Groups">
            <div className="space-y-4">
              {loadingRequests ? (
                <ListSkeleton />
              ) : recentRequests.length > 0 ? (
                recentRequests.map((req) => (
                  <GroupRequestCard
                    key={req.id}
                    title={req.name}
                    subtitle={`Solicitado ${getTimeAgo(req.createdAt)}`}
                    id={req.id.toString()}
                  />
                ))
              ) : (
                <p className="text-sm text-gray-500">No hay solicitudes pendientes.</p>
              )}
            </div>
          </DashboardSection>

          <DashboardSection title="Actividad Reciente" buttonText="Ver Historial" href="/Admin/History">
            <div className="space-y-3">
              {loadingActivity ? (
                <ListSkeleton />
              ) : recentActivity.length > 0 ? (
                recentActivity.map((act) => (
                  <ActivityCard key={act.id} status={act.status} details={act.details} variant={act.variant as any} />
                ))
              ) : (
                <p className="text-sm text-gray-500">No hay actividad reciente.</p>
              )}
            </div>
          </DashboardSection>
        </div>
      </section>

      <div className="lg:col-span-2">
        <AdminToolsCard />
      </div>
    </div>
  );
}
