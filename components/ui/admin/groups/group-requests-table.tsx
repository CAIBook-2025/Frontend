"use client"

import { Eye } from "lucide-react"

import {
  Table,
  TableCard,
  TableCell,
  TableHead,
  TableHeaderCell,
  TableRow,
  TableScrollArea,
} from "@/components/ui/shared/table"
import type {
  ApprovedGroupRequest,
  GroupRequest,
  PendingGroupRequest,
  RejectedGroupRequest,
} from "@/types/groups"

interface GroupRequestsTableProps {
  requests: GroupRequest[]
  tableType: "pending" | "approved" | "rejected"
  onView: (id: string) => void
  onApprove?: (id: string) => void
  onReject?: (id: string) => void
  onManage?: (id: string) => void
}

const STATUS_STYLES = {
  Pendiente: "bg-orange-100 text-orange-800",
  Aprobado: "bg-green-100 text-green-800",
  Rechazado: "bg-red-100 text-red-800",
} as const

export const GroupRequestsTable = ({
  requests,
  tableType,
  onView,
  onApprove,
  onReject,
  onManage,
}: GroupRequestsTableProps) => {
  const getStatusBadge = (status: keyof typeof STATUS_STYLES) => (
    <span className={`px-3 py-1 rounded-full text-xs font-medium ${STATUS_STYLES[status]}`}>{status}</span>
  )

  const getTableHeaders = () => {
    switch (tableType) {
      case "pending":
        return ["Grupo", "Solicitante", "Fecha", "Estado", "Acciones"]
      case "approved":
        return ["Grupo", "Responsable", "Fecha Aprobación", "Miembros", "Eventos", "Acciones"]
      case "rejected":
        return ["Grupo", "Solicitante", "Fecha Rechazo", "Razón"]
      default:
        return []
    }
  }

  const renderPendingRow = (request: PendingGroupRequest) => (
    <TableRow key={request.id}>
      <TableCell>
        <div>
          <h4 className="font-medium text-gray-900 text-sm">{request.groupName}</h4>
          <p className="text-gray-500 text-xs mt-1">{request.description}</p>
        </div>
      </TableCell>
      <TableCell>
        <div>
          <p className="font-medium text-gray-900 text-sm">{request.applicantName}</p>
          <p className="text-blue-600 text-xs mt-1">{request.applicantEmail}</p>
        </div>
      </TableCell>
      <TableCell>{request.date}</TableCell>
      <TableCell>{getStatusBadge(request.status)}</TableCell>
      <TableCell>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onView(request.id)}
            className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
            title="Ver detalles"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={() => onApprove?.(request.id)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
          >
            Aprobar
          </button>
          <button
            onClick={() => onReject?.(request.id)}
            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
          >
            Rechazar
          </button>
        </div>
      </TableCell>
    </TableRow>
  )

  const renderApprovedRow = (request: ApprovedGroupRequest) => (
    <TableRow key={request.id}>
      <TableCell>
        <div>
          <h4 className="font-medium text-gray-900 text-sm">{request.groupName}</h4>
          <p className="text-gray-500 text-xs mt-1">{request.description}</p>
        </div>
      </TableCell>
      <TableCell>
        <div>
          <p className="font-medium text-gray-900 text-sm">{request.responsibleName}</p>
          <p className="text-blue-600 text-xs mt-1">{request.responsibleEmail}</p>
        </div>
      </TableCell>
      <TableCell>{request.approvalDate}</TableCell>
      <TableCell>{request.members}</TableCell>
      <TableCell>{request.events}</TableCell>
      <TableCell>
        <button
          onClick={() => onManage?.(request.id)}
          className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
        >
          Gestionar
        </button>
      </TableCell>
    </TableRow>
  )

  const renderRejectedRow = (request: RejectedGroupRequest) => (
    <TableRow key={request.id}>
      <TableCell>
        <div>
          <h4 className="font-medium text-gray-900 text-sm">{request.groupName}</h4>
          <p className="text-gray-500 text-xs mt-1">{request.description}</p>
        </div>
      </TableCell>
      <TableCell>
        <div>
          <p className="font-medium text-gray-900 text-sm">{request.applicantName}</p>
          <p className="text-blue-600 text-xs mt-1">{request.applicantEmail}</p>
        </div>
      </TableCell>
      <TableCell>{request.rejectionDate}</TableCell>
      <TableCell>{request.reason}</TableCell>
    </TableRow>
  )

  const renderTableRow = (request: GroupRequest) => {
    switch (request.type) {
      case "pending":
        return renderPendingRow(request)
      case "approved":
        return renderApprovedRow(request)
      case "rejected":
        return renderRejectedRow(request)
      default:
        return null
    }
  }

  return (
    <TableCard>
      <TableScrollArea>
        <Table>
          <TableHead>
            <tr>
              {getTableHeaders().map((header) => (
                <TableHeaderCell key={header}>{header}</TableHeaderCell>
              ))}
            </tr>
          </TableHead>
          <tbody>{requests.map((request) => renderTableRow(request))}</tbody>
        </Table>
      </TableScrollArea>
    </TableCard>
  )
}

export type {
  GroupRequest,
  PendingGroupRequest as PendingRequest,
  ApprovedGroupRequest as ApprovedRequest,
  RejectedGroupRequest as RejectedRequest,
} from "@/types/groups"
