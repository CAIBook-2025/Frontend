"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { TabNavigation } from "@/components/ui/tab-navigation"
import { SearchBar } from "@/components/ui/admin/groups/search-bar"
import { GroupRequestsTable, type GroupRequest } from "@/components/ui/admin/groups/group-requests-table"
import { PageHeader } from "@/components/ui/page-header"
import { GroupDetailsModal } from "@/components/ui/admin/groups/group-details-modal"

const mockPendingRequests: GroupRequest[] = [
  {
    id: "1",
    type: "pending",
    groupName: "Club de Fotografía UC",
    description: "Grupo dedicado a la fotografía artística y documental",
    applicantName: "Ana García",
    applicantEmail: "ana.garcia@uc.cl",
    date: "10/12/2024",
    status: "Pendiente",
  },
  {
    id: "2",
    type: "pending",
    groupName: "Comité de Sustentabilidad",
    description: "Promovemos prácticas sustentables en el campus universitario",
    applicantName: "Carlos Mendoza",
    applicantEmail: "carlos.mendoza@uc.cl",
    date: "08/12/2024",
    status: "Pendiente",
  },
  {
    id: "3",
    type: "pending",
    groupName: "Grupo de Debate UC",
    description: "Espacio para practicar debate académico y competitivo",
    applicantName: "María López",
    applicantEmail: "maria.lopez@uc.cl",
    date: "05/12/2024",
    status: "Pendiente",
  },
]

const mockApprovedRequests: GroupRequest[] = [
  {
    id: "4",
    type: "approved",
    groupName: "Club de Programación UC",
    description: "Grupo dedicado a enseñar y practicar programación",
    responsibleName: "Juan Pérez",
    responsibleEmail: "juan.perez@uc.cl",
    date: "15/11/2024",
    approvalDate: "15/11/2024",
    members: 45,
    events: 8,
  },
  {
    id: "5",
    type: "approved",
    groupName: "Club de Ajedrez UC",
    description: "Promoción y práctica del ajedrez universitario",
    responsibleName: "Sofía Ruiz",
    responsibleEmail: "sofia.ruiz@uc.cl",
    date: "20/11/2024",
    approvalDate: "20/11/2024",
    members: 32,
    events: 5,
  },
]

const mockRejectedRequests: GroupRequest[] = [
  {
    id: "6",
    type: "rejected",
    groupName: "Club de Fiestas UC",
    description: "Organización de fiestas y eventos sociales",
    applicantName: "Pedro Silva",
    applicantEmail: "pedro.silva@uc.cl",
    date: "10/11/2024",
    rejectionDate: "10/11/2024",
    reason: "No cumple con los objetivos académicos de la universidad",
  },
]

export default function AdminGroupsPage() {
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState(0)
  const [searchValue, setSearchValue] = useState("")
  const [selectedRequest, setSelectedRequest] = useState<any>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  useEffect(() => {
    const groupId = searchParams.get("groupId")
    if (groupId) {
      handleView(groupId)
    }
  }, [searchParams])

  const tabs = [
    { label: "Pendientes", count: 3, active: activeTab === 0 },
    { label: "Aprobados", count: 2, active: activeTab === 1 },
    { label: "Rechazados", count: 1, active: activeTab === 2 },
  ]

  const getCurrentRequests = () => {
    switch (activeTab) {
      case 0:
        return mockPendingRequests
      case 1:
        return mockApprovedRequests
      case 2:
        return mockRejectedRequests
      default:
        return []
    }
  }

  const getTableType = () => {
    switch (activeTab) {
      case 0:
        return "pending" as const
      case 1:
        return "approved" as const
      case 2:
        return "rejected" as const
      default:
        return "pending" as const
    }
  }

  const filteredRequests = getCurrentRequests().filter((request) => {
    const searchLower = searchValue.toLowerCase()
    const groupNameMatch = request.groupName.toLowerCase().includes(searchLower)

    if (request.type === "pending" || request.type === "rejected") {
      return groupNameMatch || request.applicantName.toLowerCase().includes(searchLower)
    } else if (request.type === "approved") {
      return groupNameMatch || request.responsibleName.toLowerCase().includes(searchLower)
    }

    return groupNameMatch
  })

  const getPageHeader = () => {
    switch (activeTab) {
      case 0:
        return {
          title: "Administrar Grupos - Pendientes",
          subtitle: "Revisa y aprueba o rechaza las solicitudes de nuevos grupos",
        }
      case 1:
        return {
          title: "Administrar Grupos - Aprobados",
          subtitle: "Gestiona los grupos que han sido aprobados",
        }
      case 2:
        return {
          title: "Administrar Grupos - Rechazados",
          subtitle: "Historial de solicitudes que han sido rechazadas",
        }
      default:
        return {
          title: "Administrar Grupos - Pendientes",
          subtitle: "Revisa y aprueba o rechaza las solicitudes de nuevos grupos",
        }
    }
  }

  const handleView = (id: string) => {
    const allRequests = [...mockPendingRequests, ...mockApprovedRequests, ...mockRejectedRequests]
    const request = allRequests.find((r) => r.id === id)
    if (request) {
      setSelectedRequest(request)
      setIsModalOpen(true)
    }
  }

  const handleApprove = (id: string) => {
    console.log("Aprobar solicitud:", id)
    setIsModalOpen(false)
    setSelectedRequest(null)
  }

  const handleReject = (id: string) => {
    console.log("Rechazar solicitud:", id)
    setIsModalOpen(false)
    setSelectedRequest(null)
  }

  const handleManage = (id: string) => {
    console.log("Gestionar grupo:", id)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedRequest(null)
  }

  const pageHeader = getPageHeader()

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader title={pageHeader.title} subtitle={pageHeader.subtitle} />

        <TabNavigation tabs={tabs} onTabChange={setActiveTab} />

        <SearchBar
          placeholder="Buscar por nombre de grupo o solicitante..."
          value={searchValue}
          onChange={setSearchValue}
        />

        <GroupRequestsTable
          requests={filteredRequests}
          tableType={getTableType()}
          onView={handleView}
          onApprove={handleApprove}
          onReject={handleReject}
          onManage={handleManage}
        />

        <GroupDetailsModal
          request={selectedRequest}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      </div>
    </div>
  )
}
