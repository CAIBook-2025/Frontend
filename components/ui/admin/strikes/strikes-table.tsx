"use client"

import { EyeIcon } from "lucide-react"

interface UserStrike {
  id: string
  name: string
  email: string
  strikes: number
  maxStrikes: number
  lastStrike: string
  status: "Activo" | "Advertencia" | "Suspendido"
  suspendedUntil?: string
}

interface UserStrikesTableProps {
  users: UserStrike[]
  onViewHistory: (user: UserStrike) => void
}

export function UserStrikesTable({ users, onViewHistory }: UserStrikesTableProps ) {
  const getStatusBadge = (status: UserStrike["status"]) => {
    const statusStyles = {
      Activo: "bg-blue-500 text-white",
      Advertencia: "bg-yellow-500 text-white",
      Suspendido: "bg-red-600 text-white",
    }
    return <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyles[status]}`}>{status}</span>
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Usuario</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Strikes</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Último Strike</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Estado</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Suspendido Hasta</th>
              <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-4 px-4">
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{user.name}</p>
                    <p className="text-xs text-gray-500 mt-1">{user.email}</p>
                  </div>
                </td>
                <td className="py-4 px-4">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-bold text-gray-900">{user.strikes}</span>
                    <span className="text-sm text-gray-500">/ {user.maxStrikes}</span>
                  </div>
                </td>
                <td className="py-4 px-4 text-sm text-gray-700">{user.lastStrike}</td>
                <td className="py-4 px-4">{getStatusBadge(user.status)}</td>
                <td className="py-4 px-4 text-sm text-gray-700">{user.suspendedUntil || "-"}</td>
                <td className="py-4 px-4">
                  <div className="flex items-center gap-2">
                    <button
                      className="flex items-center gap-2 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded border border-gray-300 transition-colors"
                      onClick={() => onViewHistory(user)} // Usar onViewHistory aquí
                    >
                      <EyeIcon />
                      Historial
                    </button>
                    {user.status === "Suspendido" && (
                      <button
                        className="px-3 py-1.5 text-sm text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors"
                      >
                        Levantar Suspensión
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
