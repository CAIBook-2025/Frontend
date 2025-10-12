'use client';

import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/dashboard/QuickStatCard';
import { Users, Ban, AlertTriangle, Flag, Plus } from 'lucide-react'; // Añadimos Plus para el icono
import { SearchBar } from '@/components/ui/search-bar';
import { useState } from 'react';
import { UserStrikesTable } from '@/components/ui/admin/strikes/strikes-table';
import { StrikeHistoryTable } from '@/components/ui/admin/strikes/strikes-history-table';
import { UserStrikesHistoryModal } from '@/components/ui/admin/strikes/strikes-modal';
import { ApplyStrikeModal } from '@/components/ui/admin/strikes/apply-strikes-modal';

// Definimos el tipo de strike como una unión de los diferentes tipos de strike.
type StrikeType = 'No-show' | 'Misuse' | 'Late-cancellation';

export interface Strike {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  type: StrikeType;
  reason: string;
  appliedBy: string;
  date: string;
}

interface UserStrike {
  id: string;
  name: string;
  email: string;
  strikes: number;
  maxStrikes: number;
  lastStrike: string;
  status: 'Activo' | 'Advertencia' | 'Suspendido';
  suspendedUntil?: string;
  strikesHistory: Strike[]; // Cada usuario tiene su propio historial de strikes
}

const usersWithStrikes: UserStrike[] = [
  {
    id: '1',
    name: 'María González',
    email: 'maria.gonzalez@uc.cl',
    strikes: 2,
    maxStrikes: 3,
    lastStrike: '10/12/2024',
    status: 'Advertencia' as const,
    strikesHistory: [
      {
        id: '1',
        userId: '1',
        userName: 'María González',
        userEmail: 'maria.gonzalez@uc.cl',
        type: 'No-show',
        reason: 'No se presentó a reserva de sala confirmada',
        appliedBy: 'Admin CAI',
        date: '10/12/2024',
      },
    ],
  },
  {
    id: '2',
    name: 'Pedro Silva',
    email: 'pedro.silva@uc.cl',
    strikes: 3,
    maxStrikes: 3,
    lastStrike: '08/12/2024',
    status: 'Suspendido' as const,
    suspendedUntil: '15/12/2024',
    strikesHistory: [
      {
        id: '2',
        userId: '2',
        userName: 'Pedro Silva',
        userEmail: 'pedro.silva@uc.cl',
        type: 'Misuse',
        reason: 'Uso inadecuado de sala de estudio (ruido excesivo)',
        appliedBy: 'Admin CAI',
        date: '08/12/2024',
      },
    ],
  },
  {
    id: '3',
    name: 'Ana García',
    email: 'ana.garcia@uc.cl',
    strikes: 1,
    maxStrikes: 3,
    lastStrike: '05/12/2024',
    status: 'Activo' as const,
    strikesHistory: [
      {
        id: '3',
        userId: '3',
        userName: 'Ana García',
        userEmail: 'ana.garcia@uc.cl',
        type: 'Late-cancellation',
        reason: 'Cancelación tardía de reserva (menos de 2 horas)',
        appliedBy: 'Admin CAI',
        date: '05/12/2024',
      },
    ],
  },
];

const pageHeader = {
  title: 'Gestión de Strikes',
  subtitle: 'Administra y monitorea los strikes de usuarios',
};

export default function StrikesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserStrike | null>(null);

  // Estado separado para cada modal
  const [isUserStrikesHistoryModalOpen, setIsUserStrikesHistoryModalOpen] = useState(false);
  const [isApplyStrikeModalOpen, setIsApplyStrikeModalOpen] = useState(false);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  // Filtrado de usuarios basado en la búsqueda
  const filteredUsers = usersWithStrikes.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filtrado de historial de strikes basado en la búsqueda
  const filteredStrikes = usersWithStrikes.flatMap((user) =>
    user.strikesHistory.filter(
      (strike) =>
        strike.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        strike.userEmail.toLowerCase().includes(searchQuery.toLowerCase())
    )
  );

  // Abrir modal de historial de strikes
  const handleViewHistory = (user: any) => {
    setSelectedUser(user);
    setIsUserStrikesHistoryModalOpen(true);
  };

  // Abrir modal de aplicar strike
  const handleOpenApplyStrikeModal = () => {
    setIsApplyStrikeModalOpen(true);
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          <PageHeader title={pageHeader.title} subtitle={pageHeader.subtitle} />

          {/* Botón azul redondo para abrir el modal de aplicar strike */}
          <button
            onClick={handleOpenApplyStrikeModal}
            className="fixed bottom-8 right-8 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-6 w-6" />
          </button>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
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
          </div>
          <SearchBar placeholder="Buscar por nombre de usuario..." value={searchQuery} onChange={handleSearchChange} />
          <UserStrikesTable
            users={filteredUsers}
            onViewHistory={handleViewHistory} // Pasamos el handler al componente de la tabla
          />

          <div className="my-8">
            <h3 className="text-lg font-semibold">Historial de Strikes</h3>
            <p className="text-sm text-muted-foreground">
              A continuación se muestra el historial completo de strikes para cada usuario.
            </p>
          </div>
          <StrikeHistoryTable strikes={filteredStrikes} />
        </div>

        {/* Modales */}
        <UserStrikesHistoryModal
          isOpen={isUserStrikesHistoryModalOpen}
          onClose={() => setIsUserStrikesHistoryModalOpen(false)}
          userName={selectedUser?.name || ''}
          userEmail={selectedUser?.email || ''}
          currentStrikes={selectedUser?.strikes || 0}
          maxStrikes={selectedUser?.maxStrikes || 0}
          status={selectedUser?.status || 'Activo'}
          strikes={selectedUser?.strikesHistory || []}
        />

        <ApplyStrikeModal
          isOpen={isApplyStrikeModalOpen}
          onClose={() => setIsApplyStrikeModalOpen(false)}
          onApply={(email, type, description) => {
            setIsApplyStrikeModalOpen(false);
          }}
        />
      </div>
    </>
  );
}
