"use client"

import { Eye } from "lucide-react"

interface BaseGroupRequest {
  id: string
  groupName: string
  description: string
  date: string
}

interface PendingRequest extends BaseGroupRequest {
  type: "pending"
  applicantName: string
  applicantEmail: string
  status: "Pendiente"
}

interface ApprovedRequest extends BaseGroupRequest {
  type: "approved"
  responsibleName: string
  responsibleEmail: string
  approvalDate: string
  members: number
  events: number
}

interface RejectedRequest extends BaseGroupRequest {
  type: "rejected"
  applicantName: string
  applicantEmail: string
  rejectionDate: string
  reason: string
}

type GroupRequest = PendingRequest | ApprovedRequest | RejectedRequest

interface GroupRequestsTableProps {
  requests: GroupRequest[]
  tableType: "pending" | "approved" | "rejected"
  onView: (id: string) => void
  onApprove?: (id: string) => void
  onReject?: (id: string) => void
  onManage?: (id: string) => void
}

export const GroupRequestsTable = ({
  requests,
  tableType,
  onView,
  onApprove,
  onReject,
  onManage,
}: GroupRequestsTableProps) => {
  const getStatusBadge = (status: string) => {
    const statusStyles = {
      Pendiente: "bg-orange-100 text-orange-800",
      Aprobado: "bg-green-100 text-green-800",
      Rechazado: "bg-red-100 text-red-800",
    }

    return (
      <span
        className={`px-3 py-1 rounded-full text-xs font-medium ${statusStyles[status as keyof typeof statusStyles]}`}
      >
        {status}
      </span>
    )
  }

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

  const renderTableRow = (request: GroupRequest) => {
    switch (request.type) {
      case "pending":
        return (
          <tr key={request.id} className="border-b border-gray-100 hover:bg-gray-50">
            <td className="py-4 px-4">
              <div>
                <h4 className="font-medium text-gray-900 text-sm">{request.groupName}</h4>
                <p className="text-gray-500 text-xs mt-1">{request.description}</p>
              </div>
            </td>
            <td className="py-4 px-4">
              <div>
                <p className="font-medium text-gray-900 text-sm">{request.applicantName}</p>
                <p className="text-blue-600 text-xs mt-1">{request.applicantEmail}</p>
              </div>
            </td>
            <td className="py-4 px-4 text-sm text-gray-700">{request.date}</td>
            <td className="py-4 px-4">{getStatusBadge(request.status)}</td>
            <td className="py-4 px-4">
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
            </td>
          </tr>
        )

      case "approved":
        return (
          <tr key={request.id} className="border-b border-gray-100 hover:bg-gray-50">
            <td className="py-4 px-4">
              <div>
                <h4 className="font-medium text-gray-900 text-sm">{request.groupName}</h4>
                <p className="text-gray-500 text-xs mt-1">{request.description}</p>
              </div>
            </td>
            <td className="py-4 px-4">
              <div>
                <p className="font-medium text-gray-900 text-sm">{request.responsibleName}</p>
                <p className="text-blue-600 text-xs mt-1">{request.responsibleEmail}</p>
              </div>
            </td>
            <td className="py-4 px-4 text-sm text-gray-700">{request.approvalDate}</td>
            <td className="py-4 px-4 text-sm text-gray-700">{request.members}</td>
            <td className="py-4 px-4 text-sm text-gray-700">{request.events}</td>
            <td className="py-4 px-4">
              <button
                onClick={() => onManage?.(request.id)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition-colors"
              >
                Gestionar
              </button>
            </td>
          </tr>
        )

      case "rejected":
        return (
          <tr key={request.id} className="border-b border-gray-100 hover:bg-gray-50">
            <td className="py-4 px-4">
              <div>
                <h4 className="font-medium text-gray-900 text-sm">{request.groupName}</h4>
                <p className="text-gray-500 text-xs mt-1">{request.description}</p>
              </div>
            </td>
            <td className="py-4 px-4">
              <div>
                <p className="font-medium text-gray-900 text-sm">{request.applicantName}</p>
                <p className="text-blue-600 text-xs mt-1">{request.applicantEmail}</p>
              </div>
            </td>
            <td className="py-4 px-4 text-sm text-gray-700">{request.rejectionDate}</td>
            <td className="py-4 px-4 text-sm text-gray-700">{request.reason}</td>
          </tr>
        )

      default:
        return null
    }
  }

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {getTableHeaders().map((header) => (
                <th key={header} className="text-left py-3 px-4 font-medium text-gray-700 text-sm">
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>{requests.map((request) => renderTableRow(request))}</tbody>
        </table>
      </div>
    </div>
  )
}

export type { GroupRequest, PendingRequest, ApprovedRequest, RejectedRequest }
