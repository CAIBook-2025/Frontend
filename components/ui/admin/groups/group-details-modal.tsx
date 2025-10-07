"use client"

import { Check, X, XIcon } from "lucide-react"

import {
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  ModalHeader,
} from "@/components/ui/shared/modal"
import type {
  ApprovedGroupRequest,
  GroupRequest,
  PendingGroupRequest,
  RejectedGroupRequest,
} from "@/types/groups"

type DetailedGroupRequest = GroupRequest & {
  objective?: string
}

interface GroupDetailsModalProps {
  request: DetailedGroupRequest | null
  isOpen: boolean
  onClose: () => void
  onApprove: (id: string) => void
  onReject: (id: string) => void
}

const isPendingRequest = (request: GroupRequest): request is PendingGroupRequest =>
  request.type === "pending"

const isApprovedRequest = (request: GroupRequest): request is ApprovedGroupRequest =>
  request.type === "approved"

const isRejectedRequest = (request: GroupRequest): request is RejectedGroupRequest =>
  request.type === "rejected"

const formatDate = (date: string) =>
  new Date(date.split("/").reverse().join("-")).toLocaleDateString("es-ES", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })

export const GroupDetailsModal = ({
  request,
  isOpen,
  onClose,
  onApprove,
  onReject,
}: GroupDetailsModalProps) => {
  if (!isOpen || !request) return null

  const contactTitle = isApprovedRequest(request) ? "Responsable" : "Solicitante"
  const contactName = isApprovedRequest(request) ? request.responsibleName : request.applicantName
  const contactEmail = isApprovedRequest(request) ? request.responsibleEmail : request.applicantEmail

  const dateLabel = (() => {
    if (isApprovedRequest(request)) return "Fecha de Aprobación"
    if (isRejectedRequest(request)) return "Fecha de Rechazo"
    return "Fecha de Solicitud"
  })()

  const dateValue = (() => {
    if (isApprovedRequest(request)) return formatDate(request.approvalDate)
    if (isRejectedRequest(request)) return formatDate(request.rejectionDate)
    return formatDate(request.date)
  })()

  const handleApprove = () => {
    if (isPendingRequest(request)) {
      onApprove(request.id)
      onClose()
    }
  }

  const handleReject = () => {
    if (isPendingRequest(request)) {
      onReject(request.id)
      onClose()
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} contentClassName="max-w-md w-full max-h-[90vh]">
      <ModalHeader
        title={request.groupName}
        subtitle="Detalles de la solicitud"
        actions={<ModalCloseButton onClose={onClose} aria-label="Cerrar detalles del grupo" />}
      />

      <ModalBody className="space-y-6 overflow-y-auto">
        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-2">Descripción</h3>
          <p className="text-sm text-gray-700">{request.description}</p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-2">Objetivo</h3>
          <p className="text-sm text-gray-700">
            {request.objective || "Promover el arte fotográfico entre estudiantes y organizar exposiciones"}
          </p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-2">{contactTitle}</h3>
          <p className="text-sm text-gray-700">
            {contactName} ({contactEmail})
          </p>
        </div>

        <div>
          <h3 className="text-sm font-medium text-gray-900 mb-2">{dateLabel}</h3>
          <p className="text-sm text-gray-700">{dateValue}</p>
        </div>

        {isRejectedRequest(request) && (
          <div>
            <h3 className="text-sm font-medium text-gray-900 mb-2">Razón del Rechazo</h3>
            <p className="text-sm text-gray-700">{request.reason}</p>
          </div>
        )}
      </ModalBody>

      {isPendingRequest(request) && (
        <ModalFooter className="gap-3">
          <button
            onClick={handleApprove}
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <Check className="w-4 h-4" />
            Aprobar
          </button>
          <button
            onClick={handleReject}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white px-4 py-2.5 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
          >
            <XIcon className="w-4 h-4" />
            Rechazar
          </button>
        </ModalFooter>
      )}

      {isApprovedRequest(request) && (
        <ModalFooter className="justify-end">
          <span className="inline-flex items-center gap-2 text-sm text-green-700">
            <Check className="w-4 h-4" />
            Solicitud aprobada
          </span>
        </ModalFooter>
      )}

      {isRejectedRequest(request) && (
        <ModalFooter className="justify-end">
          <span className="inline-flex items-center gap-2 text-sm text-red-700">
            <X className="w-4 h-4" />
            Solicitud rechazada
          </span>
        </ModalFooter>
      )}
    </Modal>
  )
}
