"use client"

import { useEffect, useState } from "react"
import { AlertTriangleIcon, CheckCircleIcon, SettingsIcon } from "lucide-react"

import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  ModalHeader,
} from "@/components/ui/shared/modal"
import { Room } from "@/types/room"

type RoomStatus = "Activa" | "Mantenimiento" | "Deshabilitada"

interface RoomManagementModalProps {
  room: Room | null
  isOpen: boolean
  onClose: () => void
  onSave: (id: string, status: RoomStatus, statusNote?: string) => void
}

export function RoomManagementModal({ room, isOpen, onClose, onSave }: RoomManagementModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<RoomStatus>("Activa")
  const [statusNote, setStatusNote] = useState("")

  useEffect(() => {
    if (room && isOpen) {
      setSelectedStatus(room.status)
      setStatusNote(room.statusNote ?? "")
    }
  }, [room, isOpen])

  if (!isOpen || !room) return null

  const handleSave = () => {
    onSave(room.id, selectedStatus, selectedStatus !== "Activa" ? statusNote : undefined)
    onClose()
  }

  const handleClose = () => {
    onClose()
  }

  const showReasonField = selectedStatus === "Mantenimiento" || selectedStatus === "Deshabilitada"

  return (
    <Modal isOpen={isOpen} onClose={handleClose} contentClassName="max-w-md w-full">
      <ModalHeader
        title="Gestionar Sala"
        subtitle={room.name}
        actions={<ModalCloseButton onClose={handleClose} aria-label="Cerrar gestión de sala" />}
      />

      <ModalBody>
        <h3 className="text-sm font-medium text-gray-900 mb-4">Estado de la Sala</h3>
        <div className="space-y-3">
          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="radio"
              name="roomStatus"
              value="Activa"
              checked={selectedStatus === "Activa"}
              onChange={(event) => setSelectedStatus(event.target.value as RoomStatus)}
              className="mt-0.5 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <div className="flex items-start gap-2 flex-1">
              <div className="text-green-600 mt-0.5">
                <CheckCircleIcon />
              </div>
              <span className="text-sm text-gray-900">
                Activa <span className="text-gray-600">(disponible para reservas)</span>
              </span>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="radio"
              name="roomStatus"
              value="Mantenimiento"
              checked={selectedStatus === "Mantenimiento"}
              onChange={(event) => setSelectedStatus(event.target.value as RoomStatus)}
              className="mt-0.5 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <div className="flex items-start gap-2 flex-1">
              <div className="text-orange-600 mt-0.5">
                <SettingsIcon />
              </div>
              <span className="text-sm text-gray-900">
                En mantenimiento <span className="text-gray-600">(temporalmente cerrada)</span>
              </span>
            </div>
          </label>

          <label className="flex items-start gap-3 cursor-pointer group">
            <input
              type="radio"
              name="roomStatus"
              value="Deshabilitada"
              checked={selectedStatus === "Deshabilitada"}
              onChange={(event) => setSelectedStatus(event.target.value as RoomStatus)}
              className="mt-0.5 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
            />
            <div className="flex items-start gap-2 flex-1">
              <div className="text-red-600 mt-0.5">
                <AlertTriangleIcon />
              </div>
              <span className="text-sm text-gray-900">
                Deshabilitada <span className="text-gray-600">(fuera de servicio)</span>
              </span>
            </div>
          </label>
        </div>

        {showReasonField && (
          <div className="mt-4">
            <label htmlFor="statusNote" className="block text-sm font-medium text-gray-900 mb-2">
              Motivo
            </label>
            <textarea
              id="statusNote"
              value={statusNote}
              onChange={(event) => setStatusNote(event.target.value)}
              placeholder="Ingrese el motivo del cambio de estado..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>
        )}
      </ModalBody>

      <ModalFooter className="gap-3">
        <button
          onClick={handleClose}
          className="flex-1 bg-white hover:bg-gray-50 text-gray-700 px-4 py-2.5 rounded-lg font-medium transition-colors border border-gray-300"
        >
          Cancelar
        </button>
        <button
          onClick={handleSave}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors"
        >
          Guardar Cambios
        </button>
      </ModalFooter>
    </Modal>
  )
}
