"use client"
import { SettingsIcon } from "lucide-react"

import {
  Table,
  TableCard,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  TableScrollArea,
} from "@/components/ui/shared/table"
import { Room } from "@/types/room"

interface RoomsTableProps {
  rooms: Room[]
  onManage?: (room: Room) => void
}

const ROOM_STATUS_STYLES: Record<Room["status"], string> = {
  Activa: "bg-blue-500 text-white",
  Mantenimiento: "bg-yellow-500 text-white",
  Deshabilitada: "bg-red-500 text-white",
}

export const RoomsTable = ({ rooms, onManage }: RoomsTableProps) => {
  const renderStatusBadge = (status: Room["status"], statusNote?: string) => (
    <div>
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${ROOM_STATUS_STYLES[status]}`}>{status}</span>
      {statusNote && <p className="text-xs text-gray-500 mt-1">{statusNote}</p>}
    </div>
  )

  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 80) return "text-blue-600"
    if (utilization >= 50) return "text-yellow-600"
    return "text-red-600"
  }

  return (
    <TableCard>
      <TableScrollArea>
        <Table>
          <TableHead>
            <tr>
              <TableHeaderCell>Sala</TableHeaderCell>
              <TableHeaderCell>Ubicación</TableHeaderCell>
              <TableHeaderCell>Capacidad</TableHeaderCell>
              <TableHeaderCell>Estado</TableHeaderCell>
              <TableHeaderCell>Reservas Hoy</TableHeaderCell>
              <TableHeaderCell>Utilización</TableHeaderCell>
              <TableHeaderCell>Acciones</TableHeaderCell>
            </tr>
          </TableHead>
          <tbody>
            {rooms.map((room) => (
              <TableRow key={room.id}>
                <TableCell>
                  <div>
                    <p className="font-medium text-gray-900 text-sm mb-2">{room.name}</p>
                    <div className="flex flex-wrap gap-1">
                      {room.features.map((feature, index) => (
                        <span
                          key={index}
                          className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs border border-gray-300"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </div>
                </TableCell>
                <TableCell>
                  <div>
                    <p className="text-sm text-gray-900">{room.location}</p>
                    <p className="text-xs text-gray-500 mt-1">{room.floor}</p>
                  </div>
                </TableCell>
                <TableCell>{room.capacity} personas</TableCell>
                <TableCell>{renderStatusBadge(room.status, room.statusNote)}</TableCell>
                <TableCell className="text-center">{room.reservationsToday}</TableCell>
                <TableCell>
                  <span className={`text-sm font-medium ${getUtilizationColor(room.utilization)}`}>
                    {room.utilization}%
                  </span>
                </TableCell>
                <TableCell>
                  <button
                    className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded border border-gray-300 transition-colors"
                    onClick={() => onManage?.(room)}
                  >
                    <SettingsIcon />
                    Gestionar
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      </TableScrollArea>
    </TableCard>
  )
}
