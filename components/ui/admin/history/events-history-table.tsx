"use client"

import {
  Table,
  TableCard,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  TableScrollArea,
} from "@/components/ui/shared/table"
import type { Event } from "@/types/history"

interface EventHistoryTableProps {
  events: Event[]
}

const EVENT_STATUS_STYLES: Record<Event["status"], string> = {
  Completada: "bg-blue-500 text-white",
  Activo: "bg-yellow-500 text-white",
  Cancelada: "bg-red-500 text-white",
}

const formatAttendancePercentage = (event: Event) => {
  if (!event.registered) return "0% de asistencia"
  const pct = Math.round((event.attendees * 100) / event.registered)
  const clamped = Math.min(100, Math.max(0, pct))
  return `${clamped}% de asistencia`
}

export const EventHistoryTable = ({ events }: EventHistoryTableProps) => {
  const renderStatusBadge = (status: Event["status"]) => (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${EVENT_STATUS_STYLES[status]}`}>{status}</span>
  )

  return (
    <TableCard>
      <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Historial de Eventos</h2>
        <p className="text-sm text-gray-600 mt-1">Registro completo de todos los eventos realizados</p>
      </div>
      <TableScrollArea>
        <Table>
          <TableHead>
            <tr>
              <TableHeaderCell>Evento</TableHeaderCell>
              <TableHeaderCell>Sala</TableHeaderCell>
              <TableHeaderCell>Fecha</TableHeaderCell>
              <TableHeaderCell>Inscritos</TableHeaderCell>
              <TableHeaderCell>Asistencia</TableHeaderCell>
              <TableHeaderCell>Estado</TableHeaderCell>
            </tr>
          </TableHead>
          <tbody>
            {events.map((event) => (
              <TableRow key={event.id}>
                <TableCell>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{event.eventName}</p>
                    <p className="text-gray-600 text-xs mt-1">{event.group}</p>
                  </div>
                </TableCell>
                <TableCell>{event.room}</TableCell>
                <TableCell>
                  <div>
                    <p className="text-sm text-gray-900">{event.date}</p>
                    <p className="text-xs text-gray-500 mt-1">{event.timeRange}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-gray-700">
                    {event.attendees} / {event.registered}
                  </span>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="text-sm text-gray-900">{event.attendees}</p>
                    <p className="text-xs text-gray-500 mt-1">{formatAttendancePercentage(event)}</p>
                  </div>
                </TableCell>
                <TableCell>{renderStatusBadge(event.status)}</TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      </TableScrollArea>
    </TableCard>
  )
}
