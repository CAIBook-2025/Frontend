"use client"

import { XIcon } from "lucide-react"
import { Strike } from "@/app/Admin/Strikes/page"


interface UserStrikesHistoryModalProps {
  isOpen: boolean
  onClose: () => void
  userName: string
  userEmail: string
  currentStrikes: number
  maxStrikes: number
  status: "Activo" | "Advertencia" | "Suspendido"
  strikes: Strike[]
}

export function UserStrikesHistoryModal({
  isOpen,
  onClose,
  userName,
  userEmail,
  currentStrikes,
  maxStrikes,
  status,
  strikes,
}: UserStrikesHistoryModalProps) {
  if (!isOpen) return null

  const getStatusBadge = (status: "Activo" | "Advertencia" | "Suspendido") => {
    const statusStyles = {
      Activo: "bg-blue-500 text-white",
      Advertencia: "bg-yellow-500 text-white",
      Suspendido: "bg-red-600 text-white",
    }
    return <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyles[status]}`}>{status}</span>
  }

  const getTypeBadge = (type: Strike["type"]) => {
    const typeStyles = {
      "No-show": "bg-red-600 text-white",
      "Misuse": "bg-yellow-600 text-white",
      "Late-cancellation": "bg-yellow-500 text-white",
    }
    const typeText = {
        "No-show": "No Show",
        "Misuse": "Mal Uso",
        "Late-cancellation": "Cancelación Tardía",
    }
    return <span className={`px-3 py-1 rounded-full text-xs font-medium ${typeStyles[type]}`}>{typeText[type]}</span>
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Historial de Strikes</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <XIcon className="text-gray-500" />
          </button>
        </div>

        {/* User Info */}
        <div className="p-6 border-b border-gray-200">
          <p className="font-medium text-gray-900">{userName}</p>
          <p className="text-sm text-gray-500 mt-1">{userEmail}</p>
          <div className="flex items-center gap-3 mt-3">
            <span className="text-sm text-gray-700">
              Strikes actuales: <span className="font-bold text-gray-900">{currentStrikes}</span> /{" "}
              <span className="font-bold text-gray-900">{maxStrikes}</span>
            </span>
            {getStatusBadge(status)}
          </div>
        </div>

        {/* Strikes List */}
        <div className="p-6 space-y-4">
          {strikes.length === 0 ? (
            <p className="text-sm text-gray-500 text-center py-8">No hay strikes registrados</p>
          ) : (
            strikes.map((strike) => (
              <div key={strike.id} className="border-l-4 border-blue-500 bg-gray-50 rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  {getTypeBadge(strike.type)}
                  <span className="text-sm text-gray-600">{strike.date}</span>
                </div>
                <p className="text-sm text-gray-900 mb-2">{strike.reason}</p>
                <p className="text-xs text-gray-500">Aplicado por: {strike.appliedBy}</p>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg border border-gray-300 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  )
}
