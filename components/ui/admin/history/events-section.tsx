"use client"

import { CalendarDays, CheckCircle2, Users, Percent } from "lucide-react";
import { StatCard } from "@/components/ui/dashboard/QuickStatCard";
import { EventHistoryTable, Event } from "@/components/ui/admin/history/events-history-table";


export const events: Event[] = [
  {
    id: "EVT-20251004-001",
    eventName: "Workshop React Avanzado",
    group: "Comunidad Dev Santiago",
    room: "Sala Andes 1",
    date: "2025-10-04",
    timeRange: "09:00–12:00",
    registered: 45,
    attendees: 41,
    checkInTime: "08:48",
    status: "Completada",
  },
  {
    id: "EVT-20251004-002",
    eventName: "Charla UX Writing",
    group: "UX Chile",
    room: "Sala Pacífico",
    date: "2025-10-04",
    timeRange: "15:00–16:30",
    registered: 60,
    attendees: 0,
    status: "Activo", // aún no comienza / en curso según tu lógica
  },
  {
    id: "EVT-20251003-003",
    eventName: "Meetup Data Science",
    group: "DataLatam",
    room: "Sala Atacama",
    date: "2025-10-03",
    timeRange: "18:00–20:00",
    registered: 80,
    attendees: 72,
    checkInTime: "17:42",
    status: "Completada",
  },
  {
    id: "EVT-20251003-004",
    eventName: "Introducción a Kubernetes",
    group: "Cloud Native CL",
    room: "Sala Patagonia",
    date: "2025-10-03",
    timeRange: "10:00–13:00",
    registered: 35,
    attendees: 0,
    status: "Cancelada",
  },
  {
    id: "EVT-20251002-005",
    eventName: "Design Crit Live",
    group: "Diseñadores U.",
    room: "Sala Pacífico",
    date: "2025-10-02",
    timeRange: "14:00–15:30",
    registered: 28,
    attendees: 26,
    checkInTime: "13:55",
    status: "Completada",
  },
  {
    id: "EVT-20251002-006",
    eventName: "Taller de Oratoria",
    group: "Club Speakers",
    room: "Sala Andes 2",
    date: "2025-10-02",
    timeRange: "16:00–18:00",
    registered: 20,
    attendees: 0,
    status: "Cancelada",
  },
  {
    id: "EVT-20251001-007",
    eventName: "Sesión Agile Retrospective",
    group: "Equipo Phoenix",
    room: "Sala Atacama",
    date: "2025-10-01",
    timeRange: "11:00–12:00",
    registered: 12,
    attendees: 12,
    checkInTime: "10:58",
    status: "Completada",
  },
  {
    id: "EVT-20250930-008",
    eventName: "Networking Tech",
    group: "Tech Founders CL",
    room: "Sala Patagonia",
    date: "2025-09-30",
    timeRange: "19:00–21:00",
    registered: 50,
    attendees: 47,
    checkInTime: "18:50",
    status: "Completada",
  },
  {
    id: "EVT-20250930-009",
    eventName: "Demo Day",
    group: "Aceleradora Sur",
    room: "Sala Andes 1",
    date: "2025-09-30",
    timeRange: "15:00–17:00",
    registered: 100,
    attendees: 92,
    checkInTime: "14:40",
    status: "Completada",
  },
  {
    id: "EVT-20250929-010",
    eventName: "Introducción a Figma",
    group: "UX School",
    room: "Sala Pacífico",
    date: "2025-09-29",
    timeRange: "09:30–11:00",
    registered: 32,
    attendees: 30,
    checkInTime: "09:22",
    status: "Completada",
  },
  {
    id: "EVT-20250929-011",
    eventName: "Python para Finanzas",
    group: "PyFinance CL",
    room: "Sala Andes 2",
    date: "2025-09-29",
    timeRange: "14:00–16:30",
    registered: 40,
    attendees: 37,
    checkInTime: "13:53",
    status: "Completada",
  },
  {
    id: "EVT-20250928-012",
    eventName: "Clínica de Pitch",
    group: "Startups U.",
    room: "Sala Atacama",
    date: "2025-09-28",
    timeRange: "10:00–12:00",
    registered: 22,
    attendees: 0,
    status: "Cancelada",
  },
];


const totalEventos = events.length;
const totalCompletados = events.filter(e => e.status === "Completada").length;
const totalInscritos = events.reduce((acc, e) => acc + e.registered, 0);
const totalAsistentes = events.reduce((acc, e) => acc + e.attendees, 0);
const tasaAsistencia = Math.round((totalAsistentes * 100) / Math.max(1, totalInscritos));

export function EventSection() {
  return (
    <>
      <section>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard
            icon={<CalendarDays className="h-4 w-4" />}
            value={totalEventos}
            label="Eventos Totales"
            footer="Este mes"
            variant="blue"
          />
          <StatCard
            icon={<CheckCircle2 className="h-4 w-4" />}
            value={totalCompletados}
            label="Completados"
            footer="Finalizados con éxito"
            variant="yellow"
          />
          <StatCard
            icon={<Users className="h-4 w-4" />}
            value={totalInscritos}
            label="Total Inscritos"
            footer="Participantes"
            variant="blue"
          />
          <StatCard
            icon={<Percent className="h-4 w-4" />}
            value={`${tasaAsistencia}%`}
            label="Tasa de Asistencia"
            footer="Efectividad"
            variant="yellow"
          />
        </div>
      </section>

      <EventHistoryTable events={events} />
    </>
  );
}