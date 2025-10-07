"use client"

import { Building2, CheckCircle2, Gauge, UserX } from "lucide-react"

import { StatCard } from "@/components/ui/dashboard/QuickStatCard"
import { ReservationHistoryTable } from "@/components/ui/admin/history/reservation-history-table"
import type { Reservation } from "@/types/history"

const reservations: Reservation[] = [
  {
    id: "RES-20251004-001",
    userName: "Camila Rojas",
    userEmail: "camila.rojas@example.com",
    room: "Sala Andes 1",
    date: "2025-10-04",
    timeRange: "09:00–10:00",
    checkInTime: "08:55",
    status: "Completada",
  },
  {
    id: "RES-20251004-002",
    userName: "Javier Pérez",
    userEmail: "javier.perez@example.com",
    room: "Sala Pacífico",
    date: "2025-10-04",
    timeRange: "10:00–11:30",
    status: "Cancelada",
  },
  {
    id: "RES-20251003-003",
    userName: "María González",
    userEmail: "maria.gonzalez@example.com",
    room: "Sala Atacama",
    date: "2025-10-03",
    timeRange: "15:00–16:00",
    checkInTime: "15:03",
    status: "Completada",
  },
  {
    id: "RES-20251003-004",
    userName: "Diego Silva",
    userEmail: "diego.silva@example.com",
    room: "Sala Andes 2",
    date: "2025-10-03",
    timeRange: "11:00–12:00",
    status: "No Show",
  },
  {
    id: "RES-20251002-005",
    userName: "Valentina Torres",
    userEmail: "valentina.torres@example.com",
    room: "Sala Patagonia",
    date: "2025-10-02",
    timeRange: "09:30–10:30",
    checkInTime: "09:28",
    status: "Completada",
  },
  {
    id: "RES-20251002-006",
    userName: "Tomás Muñoz",
    userEmail: "tomas.munoz@example.com",
    room: "Sala Pacífico",
    date: "2025-10-02",
    timeRange: "14:00–15:30",
    status: "Cancelada",
  },
  {
    id: "RES-20251001-007",
    userName: "Isidora Herrera",
    userEmail: "isidora.herrera@example.com",
    room: "Sala Atacama",
    date: "2025-10-01",
    timeRange: "16:00–17:00",
    status: "No Show",
  },
  {
    id: "RES-20250930-008",
    userName: "Felipe Castro",
    userEmail: "felipe.castro@example.com",
    room: "Sala Andes 1",
    date: "2025-09-30",
    timeRange: "10:00–11:00",
    checkInTime: "10:01",
    status: "Completada",
  },
  {
    id: "RES-20250929-009",
    userName: "Sofía Lara",
    userEmail: "sofia.lara@example.com",
    room: "Sala Patagonia",
    date: "2025-09-29",
    timeRange: "13:00–14:00",
    status: "Cancelada",
  },
  {
    id: "RES-20250929-010",
    userName: "Matías Vega",
    userEmail: "matias.vega@example.com",
    room: "Sala Pacífico",
    date: "2025-09-29",
    timeRange: "09:00–10:00",
    checkInTime: "08:57",
    status: "Completada",
  },
]

const totalReservas = reservations.length
const totalCompletadas = reservations.filter((reservation) => reservation.status === "Completada").length
const totalNoShow = reservations.filter((reservation) => reservation.status === "No Show").length
const tasaUso = Math.round((totalCompletadas * 100) / Math.max(1, totalReservas))

export function ReservationSection() {
  return (
    <div className="space-y-8">
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          icon={<Building2 className="h-4 w-4" />}
          value={totalReservas}
          label="Reservas Totales"
          footer="Este mes"
          variant="blue"
        />
        <StatCard
          icon={<CheckCircle2 className="h-4 w-4" />}
          value={totalCompletadas}
          label="Completadas"
          footer="Check-ins exitosos"
          variant="yellow"
        />
        <StatCard
          icon={<UserX className="h-4 w-4" />}
          value={totalNoShow}
          label="No Show"
          footer="Sin presentarse"
          variant="red"
        />
        <StatCard
          icon={<Gauge className="h-4 w-4" />}
          value={`${tasaUso}%`}
          label="Tasa de Uso"
          footer="Efectividad"
          variant="yellow"
        />
      </section>

      <ReservationHistoryTable reservations={reservations} />
    </div>
  )
}
