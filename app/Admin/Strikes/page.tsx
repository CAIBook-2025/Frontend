"use client"

import { useState } from "react"
import { Users, Ban, AlertTriangle, Flag, Plus } from "lucide-react"

import { UserStrikesTable } from "@/components/ui/admin/strikes/strikes-table"
import { ApplyStrikeModal } from "@/components/ui/admin/strikes/apply-strikes-modal"
import { StrikeHistoryTable } from "@/components/ui/admin/strikes/strikes-history-table"
import { UserStrikesHistoryModal } from "@/components/ui/admin/strikes/strikes-modal"
import { PageHeader } from "@/components/ui/page-header"
import { StatCard } from "@/components/ui/dashboard/QuickStatCard"
import { SearchBar } from "@/components/ui/search-bar"
import type { UserStrike } from "@/types/strikes"

const usersWithStrikes: UserStrike[] = [
  {
    id: "1",
    name: "María González",
    email: "maria.gonzalez@uc.cl",
    strikes: 2,
    maxStrikes: 3,
    lastStrike: "10/12/2024",
    status: "Advertencia",
    strikesHistory: [
      {
        id: "1",
        userId: "1",
        userName: "María González",
        userEmail: "maria.gonzalez@uc.cl",
        type: "No-show",
        reason: "No se presentó a reserva de sala confirmada",
        appliedBy: "Admin CAI",
        date: "10/12/2024",
      },
    ],
  },
  {
    id: "2",
    name: "Pedro Silva",
    email: "pedro.silva@uc.cl",
    strikes: 3,
    maxStrikes: 3,
    lastStrike: "08/12/2024",
    status: "Suspendido",
    suspendedUntil: "15/12/2024",
    strikesHistory: [
      {
        id: "2",
        userId: "2",
        userName: "Pedro Silva",
        userEmail: "pedro.silva@uc.cl",
        type: "Misuse",
        reason: "Uso inadecuado de sala de estudio (ruido excesivo)",
        appliedBy: "Admin CAI",
        date: "08/12/2024",
      },
    ],
  },
  {
    id: "3",
    name: "Ana García",
    email: "ana.garcia@uc.cl",
    strikes: 1,
    maxStrikes: 3,
    lastStrike: "05/12/2024",
    status: "Activo",
    strikesHistory: [
      {
        id: "3",
        userId: "3",
        userName: "Ana García",
        userEmail: "ana.garcia@uc.cl",
        type: "Late-cancellation",
        reason: "Cancelación tardía de reserva (menos de 2 horas)",
        appliedBy: "Admin CAI",
        date: "05/12/2024",
      },
    ],
  },
]

const pageHeader = {
  title: "Gestión de Strikes",
  subtitle: "Administra y monitorea los strikes de usuarios",
}

export default function StrikesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedUser, setSelectedUser] = useState<UserStrike | null>(null)
  const [isUserStrikesHistoryModalOpen, setIsUserStrikesHistoryModalOpen] = useState(false)
  const [isApplyStrikeModalOpen, setIsApplyStrikeModalOpen] = useState(false)

  const filteredUsers = usersWithStrikes.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const filteredStrikes = usersWithStrikes.flatMap((user) =>
    user.strikesHistory.filter(
      (strike) =>
        strike.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        strike.userEmail.toLowerCase().includes(searchQuery.toLowerCase()),
    ),
  )

  const handleViewHistory = (user: UserStrike) => {
    setSelectedUser(user)
    setIsUserStrikesHistoryModalOpen(true)
  }

  return (
    <>
      <main className="min-h-screen bg-slate-50">
        <div className="container mx-auto space-y-10 px-4 py-8 md:py-12">
          <PageHeader title={pageHeader.title} subtitle={pageHeader.subtitle} />

          <div className="flex justify-end">
            <button
              onClick={() => setIsApplyStrikeModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow transition-colors hover:bg-blue-700"
            >
              <Plus className="h-4 w-4" />
              Aplicar strike
            </button>
          </div>

          <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              icon={<Users className="h-4 w-4" />}
              value={filteredUsers.length}
              label="Usuarios con Strikes"
              footer="Total de usuarios sancionados"
              variant="red"
            />
            <StatCard
              icon={<Ban className="h-4 w-4" />}
              value={filteredUsers.filter((user) => user.strikes >= 3).length}
              label="Suspendidos"
              footer="3+ strikes"
              variant="red"
            />
            <StatCard
              icon={<AlertTriangle className="h-4 w-4" />}
              value={filteredUsers.filter((user) => user.strikes >= 1 && user.strikes < 3).length}
              label="En advertencia"
              footer="1-2 strikes"
              variant="yellow"
            />
            <StatCard
              icon={<Flag className="h-4 w-4" />}
              value={filteredUsers.reduce((total, user) => total + user.strikes, 0)}
              label="Strikes Totales"
              footer="Este mes"
              variant="blue"
            />
          </section>

          <section className="space-y-4">
            <SearchBar
              placeholder="Buscar por nombre de usuario..."
              value={searchQuery}
              onChange={setSearchQuery}
              className="mb-0"
            />
            <UserStrikesTable users={filteredUsers} onViewHistory={handleViewHistory} />
          </section>

          <section className="space-y-3">
            <div>
              <h2 className="text-2xl font-bold text-gray-800">Historial de Strikes</h2>
              <p className="text-sm text-slate-500">
                A continuación se muestra el historial completo de strikes para cada usuario.
              </p>
            </div>
            <StrikeHistoryTable strikes={filteredStrikes} />
          </section>
        </div>
      </main>

      <UserStrikesHistoryModal
        isOpen={isUserStrikesHistoryModalOpen}
        onClose={() => setIsUserStrikesHistoryModalOpen(false)}
        userName={selectedUser?.name || ""}
        userEmail={selectedUser?.email || ""}
        currentStrikes={selectedUser?.strikes || 0}
        maxStrikes={selectedUser?.maxStrikes || 0}
        status={selectedUser?.status || "Activo"}
        strikes={selectedUser?.strikesHistory || []}
      />

      <ApplyStrikeModal
        isOpen={isApplyStrikeModalOpen}
        onClose={() => setIsApplyStrikeModalOpen(false)}
        onApply={(payload) => {
          console.log("Aplicar Strike:", payload.email, payload.type, payload.description)
          setIsApplyStrikeModalOpen(false)
        }}
      />
    </>
  )
}
