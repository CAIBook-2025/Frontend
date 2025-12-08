'use client';

import React, { useEffect, useState } from 'react';
import { Building2, Calendar, Users, AlertTriangle } from 'lucide-react';
import { StatCard } from '@/components/ui/dashboard/QuickStatCard';
import { DashboardSection } from '@/components/ui/dashboard/DashboardSection';
import { ActivityCard } from '@/components/ui/dashboard/admin/ActivityCard';
import { GroupRequestCard } from '@/components/ui/dashboard/admin/GroupRequestCard';
import { AdminToolsCard } from '@/components/ui/dashboard/admin/AdminTools';
import { fetchGroupRequests } from '@/lib/groups/fetchGroupRequests';
import { getAccessToken } from '@auth0/nextjs-auth0';
import { resolveAccessToken } from '@/app/Admin/Room/room-utils';
import { GroupRequest } from '@/types/groupRequest';

const adminStats = {
  totalReservations: 120,
  activeEvents: 5,
  pendingGroups: 3,
  totalStrikes: 2,
};

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
  const [recentRequests, setRecentRequests] = useState<GroupRequest[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(true);

  useEffect(() => {
    const loadRequests = async () => {
      try {
        const tokenResponse = await getAccessToken();
        const accessToken = resolveAccessToken(tokenResponse);
        const data = await fetchGroupRequests(accessToken, { status: 'PENDING' });

        if (data) {
          // Sort by createdAt descending and take top 3
          const sorted = data
            .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 3);
          setRecentRequests(sorted);
        }
      } catch (error) {
        console.error('Error loading group requests:', error);
      } finally {
        setLoadingRequests(false);
      }
    };

    loadRequests();
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Quick Stats */}
      <section>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<Building2 className="h-4 w-4" />}
            value={adminStats.totalReservations}
            label="Reservas Totales"
            footer="Este mes"
            variant="blue"
          />
          <StatCard
            icon={<Calendar className="h-4 w-4" />}
            value={adminStats.activeEvents}
            label="Eventos Activos"
            footer="En curso"
            variant="yellow"
          />
          <StatCard
            icon={<Users className="h-4 w-4" />}
            value={adminStats.pendingGroups}
            label="Grupos Pendientes"
            footer="Requieren revisión"
            variant="blue"
          />
          <StatCard
            icon={<AlertTriangle className="h-4 w-4" />}
            value={adminStats.totalStrikes}
            label="Strikes Activos"
            footer="Usuarios sancionados"
            variant="red"
          />
        </div>
      </section>

      {/* Dos columnas iguales en altura */}
      <section>
        <div className="grid gap-6 lg:grid-cols-2">
          <DashboardSection title="Solicitudes de Grupo" buttonText="Ver Todas" href="/Admin/Groups">
            <div className="space-y-4">
              {loadingRequests ? (
                <p className="text-sm text-gray-500">Cargando solicitudes...</p>
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
              <ActivityCard status="Reserva completada" details="Sala A1 - Juan Pérez" variant="green" />
              <ActivityCard status="Strike aplicado" details="No show - María González" variant="yellow" />
              <ActivityCard status="Evento creado" details="Taller Python - Club Programación" variant="blue" />
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
