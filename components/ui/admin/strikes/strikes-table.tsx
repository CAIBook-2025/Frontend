"use client"

import { EyeIcon } from "lucide-react"

import {
  Table,
  TableCard,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  TableScrollArea,
} from "@/components/ui/shared/table"
import { USER_STRIKE_STATUS_STYLES } from "@/components/ui/admin/strikes/constants"
import type { UserStrike } from "@/types/strikes"

interface UserStrikesTableProps {
  users: UserStrike[]
  onViewHistory: (user: UserStrike) => void
}

export function UserStrikesTable({ users, onViewHistory }: UserStrikesTableProps) {
  const renderStatusBadge = (status: UserStrike["status"]) => (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${USER_STRIKE_STATUS_STYLES[status]}`}>
      {status}
    </span>
  )

  return (
    <TableCard>
      <TableScrollArea>
        <Table>
          <TableHead>
            <tr>
              <TableHeaderCell>Usuario</TableHeaderCell>
              <TableHeaderCell>Strikes</TableHeaderCell>
              <TableHeaderCell>Último Strike</TableHeaderCell>
              <TableHeaderCell>Estado</TableHeaderCell>
              <TableHeaderCell>Suspendido Hasta</TableHeaderCell>
              <TableHeaderCell>Acciones</TableHeaderCell>
            </tr>
          </TableHead>
          <tbody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{user.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{user.email}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-gray-900">{user.strikes}</span>
                    <span className="text-sm text-gray-500">/ {user.maxStrikes}</span>
                  </div>
                </TableCell>
                <TableCell>{user.lastStrike}</TableCell>
                <TableCell>{renderStatusBadge(user.status)}</TableCell>
                <TableCell>{user.suspendedUntil || "-"}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <button
                      className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded border border-gray-300 transition-colors"
                      onClick={() => onViewHistory(user)}
                    >
                      <EyeIcon />
                      Historial
                    </button>
                    {user.status === "Suspendido" && (
                      <button className="px-3 py-1.5 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors">
                        Levantar Suspensión
                      </button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </Table>
      </TableScrollArea>
    </TableCard>
  )
}
