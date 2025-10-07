"use client"

import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  ModalHeader,
} from "@/components/ui/shared/modal"
import { STRIKE_TYPE_METADATA, USER_STRIKE_STATUS_STYLES } from "@/components/ui/admin/strikes/constants"
import type { Strike, UserStrikeStatus } from "@/types/strikes"

interface UserStrikesHistoryModalProps {
  isOpen: boolean
  onClose: () => void
  userName: string
  userEmail: string
  currentStrikes: number
  maxStrikes: number
  status: UserStrikeStatus
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      contentClassName="max-w-2xl w-full max-h-[90vh]"
    >
      <ModalHeader
        title="Historial de Strikes"
        actions={<ModalCloseButton onClose={onClose} aria-label="Cerrar historial de strikes" />}
      />

      <div className="border-b border-gray-200">
        <ModalBody className="space-y-3">
          <div>
            <p className="font-medium text-gray-900">{userName}</p>
            <p className="text-sm text-gray-500 mt-1">{userEmail}</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-sm text-gray-700">
              Strikes actuales:{" "}
              <span className="font-bold text-gray-900">
                {currentStrikes}
              </span>{" "}
              /{" "}
              <span className="font-bold text-gray-900">
                {maxStrikes}
              </span>
            </span>
            <span
              className={`px-3 py-1 rounded-full text-xs font-medium ${USER_STRIKE_STATUS_STYLES[status]}`}
            >
              {status}
            </span>
          </div>
        </ModalBody>
      </div>

      <ModalBody className="space-y-4 flex-1 overflow-y-auto">
        {strikes.length === 0 ? (
          <p className="text-sm text-gray-500 text-center py-8">
            No hay strikes registrados
          </p>
        ) : (
          strikes.map((strike) => (
            <div key={strike.id} className="border-l-4 border-blue-500 bg-gray-50 rounded-lg p-4">
              <div className="flex items-start justify-between mb-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    STRIKE_TYPE_METADATA[strike.type].badgeClass
                  }`}
                >
                  {STRIKE_TYPE_METADATA[strike.type].label}
                </span>
                <span className="text-sm text-gray-600">{strike.date}</span>
              </div>
              <p className="text-sm text-gray-900 mb-2">{strike.reason}</p>
              <p className="text-xs text-gray-500">Aplicado por: {strike.appliedBy}</p>
            </div>
          ))
        )}
      </ModalBody>

      <ModalFooter>
        <button
          onClick={onClose}
          className="px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-lg border border-gray-300 transition-colors"
        >
          Cerrar
        </button>
      </ModalFooter>
    </Modal>
  )
}
