"use client";

import React from "react";
import { Building2, Calendar, Users, AlertTriangle } from "lucide-react";
import { StatCard } from "@/components/ui/dashboard/QuickStatCard";
import { DashboardSection } from "@/components/ui/dashboard/DashboardSection";
import { ActivityCard } from "@/components/ui/dashboard/admin/ActivityCard";
import { GroupRequestCard } from "@/components/ui/dashboard/admin/GroupRequestCard";
import { AdminToolsCard } from "@/components/ui/dashboard/admin/AdminTools";

const adminStats = {
  totalReservations: 120,
  activeEvents: 5,
  pendingGroups: 3,
  totalStrikes: 2,
};

export default function CAIAdminDashboard() {
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
          <DashboardSection
            title="Solicitudes de Grupo"
            buttonText="Ver Todas"
            href="/Admin/Groups"
          >
            <div className="space-y-4">
              <GroupRequestCard
                title="Club de Fotografía UC"
                subtitle="Solicitado hace 2 días"
                id="1"
              />
              <GroupRequestCard
                title="Comité de Sustentabilidad"
                subtitle="Solicitado hace 1 semana"
                id="2"
              />
              <GroupRequestCard
                title="Grupo de Debate UC"
                subtitle="Solicitado hace 2 semanas"
                id="3"
              />
            </div>
          </DashboardSection>

          <DashboardSection
            title="Actividad Reciente"
            buttonText="Ver Historial"
            href="/Admin/History"
          >
            <div className="space-y-3">
              <ActivityCard
                status="Reserva completada"
                details="Sala A1 - Juan Pérez"
                variant="green"
              />
              <ActivityCard
                status="Strike aplicado"
                details="No show - María González"
                variant="yellow"
              />
              <ActivityCard
                status="Evento creado"
                details="Taller Python - Club Programación"
                variant="blue"
              />
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
