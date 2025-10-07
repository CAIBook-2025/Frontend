"use client"

import { Check } from "lucide-react"

import {
  Table,
  TableCard,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  TableScrollArea,
} from "@/components/ui/shared/table"
import type { Reservation } from "@/types/history"

interface ReservationHistoryTableProps {
  reservations: Reservation[]
}

const RESERVATION_STATUS_STYLES: Record<Reservation["status"], string> = {
  Completada: "bg-blue-500 text-white",
  "No Show": "bg-red-500 text-white",
  Cancelada: "bg-yellow-500 text-white",
}

export const ReservationHistoryTable = ({ reservations }: ReservationHistoryTableProps) => {
  const renderStatusBadge = (status: Reservation["status"]) => (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${RESERVATION_STATUS_STYLES[status]}`}>
      {status}
    </span>
  )

  const renderCheckIn = (checkInTime?: string) => {
    if (!checkInTime) {
      return <span className="text-red-600 text-sm">No realizado</span>
    }

    return (
      <div className="flex items-center gap-1 text-blue-600">
        <Check />
        <span className="text-sm font-medium">{checkInTime}</span>
      </div>
    )
  }

  return (
    <TableCard>
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Historial de Reservas</h2>
        <p className="text-sm text-gray-600 mt-1">Registro completo de todas las reservas de salas</p>
      </div>
      <TableScrollArea>
        <Table>
          <TableHead>
            <tr>
              <TableHeaderCell>Usuario</TableHeaderCell>
              <TableHeaderCell>Sala</TableHeaderCell>
              <TableHeaderCell>Fecha y Hora</TableHeaderCell>
              <TableHeaderCell>Check-in</TableHeaderCell>
              <TableHeaderCell>Estado</TableHeaderCell>
            </tr>
          </TableHead>
          <tbody>
            {reservations.map((reservation) => (
              <TableRow key={reservation.id}>
                <TableCell>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{reservation.userName}</p>
                    <p className="text-gray-600 text-xs mt-1">{reservation.userEmail}</p>
                  </div>
                </TableCell>
                <TableCell>{reservation.room}</TableCell>
                <TableCell>
                  <div>
                    <p className="text-sm text-gray-900">{reservation.date}</p>
                    <p className="text-xs text-gray-500 mt-1">{reservation.timeRange}</p>
                  </div>
                </TableCell>
                <TableCell>{renderCheckIn(reservation.checkInTime)}</TableCell>
                <TableCell>{renderStatusBadge(reservation.status)}</TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      </TableScrollArea>
    </TableCard>
  )
}
