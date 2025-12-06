'use client';

import { PageHeader } from '@/components/ui/page-header';
import { StatCard } from '@/components/ui/dashboard/QuickStatCard';
import { Users, Ban, AlertTriangle, Flag, Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { SearchBar } from '@/components/ui/search-bar';
import { useState, useEffect } from 'react';
import { UserStrikesTable } from '@/components/ui/admin/strikes/strikes-table';
import { StrikeHistoryTable } from '@/components/ui/admin/strikes/strikes-history-table';
import { UserStrikesHistoryModal } from '@/components/ui/admin/strikes/strikes-modal';
import { ApplyStrikeModal } from '@/components/ui/admin/strikes/apply-strikes-modal';
import { LiftSuspensionModal } from '@/components/ui/admin/strikes/lift-suspension-modal';
import { getStrikes } from '@/lib/strikes/getStrikes';
import { deleteStrike } from '@/lib/strikes/deleteStrike';
import { Strike as ApiStrike } from '@/types/strike';
import { getAccessToken } from '@auth0/nextjs-auth0';
import { resolveAccessToken } from '@/app/Admin/Room/room-utils';

interface UserStrike {
  id: string;
  name: string;
  email: string;
  strikes: number;
  maxStrikes: number;
  lastStrike: string;
  status: 'Activo' | 'Advertencia' | 'Suspendido';
  suspendedUntil?: string;
  strikesHistory: ApiStrike[];
}

const pageHeader = {
  title: 'Gestión de Strikes',
  subtitle: 'Administra y monitorea los strikes de usuarios',
};

const ITEMS_PER_PAGE = 10;

export default function StrikesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserStrike | null>(null);

  // Data state
  const [strikes, setStrikes] = useState<ApiStrike[]>([]);
  const [loading, setLoading] = useState(true);
  const [usersWithStrikes, setUsersWithStrikes] = useState<UserStrike[]>([]);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);

  // Modal state
  const [isUserStrikesHistoryModalOpen, setIsUserStrikesHistoryModalOpen] = useState(false);
  const [isApplyStrikeModalOpen, setIsApplyStrikeModalOpen] = useState(false);
  const [userToLiftSuspension, setUserToLiftSuspension] = useState<UserStrike | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const tokenResponse = await getAccessToken();
      const accessToken = resolveAccessToken(tokenResponse);
      if (!accessToken) return;
      setAccessToken(accessToken);

      const data = await getStrikes(accessToken);
      setStrikes(data);
      processStrikesData(data);
    } catch (error) {
      console.error("Error loading strikes:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const processStrikesData = (data: ApiStrike[]) => {
    const usersMap = new Map<number, UserStrike>();

    data.forEach(strike => {
      const userId = strike.student_id;
      const userName = strike.student?.first_name + ' ' + strike.student?.last_name;
      const userEmail = strike.student?.email || 'N/A';

      if (!usersMap.has(userId)) {
        usersMap.set(userId, {
          id: userId.toString(),
          name: userName,
          email: userEmail,
          strikes: 0,
          maxStrikes: 3,
          lastStrike: '',
          status: 'Activo',
          strikesHistory: []
        });
      }

      const user = usersMap.get(userId)!;
      user.strikes += 1;
      user.strikesHistory.push(strike);

    });

    const processedUsers = Array.from(usersMap.values()).map(user => {
      user.strikesHistory.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

      if (user.strikesHistory.length > 0) {
        user.lastStrike = new Date(user.strikesHistory[0].date).toLocaleDateString();
      }

      if (user.strikes >= 3) user.status = 'Suspendido';
      else if (user.strikes >= 1) user.status = 'Advertencia';
      else user.status = 'Activo';

      return user;
    });

    setUsersWithStrikes(processedUsers);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };


  const filteredUsers = usersWithStrikes.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const allStrikes = usersWithStrikes.flatMap(u => u.strikesHistory);
  const filteredStrikes = allStrikes.filter(
    (strike) =>
      strike.student?.first_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      strike.student?.last_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      strike.student?.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalPages = Math.ceil(filteredStrikes.length / ITEMS_PER_PAGE);
  const paginatedStrikes = filteredStrikes.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const handleViewHistory = (user: UserStrike) => {
    setSelectedUser(user);
    setIsUserStrikesHistoryModalOpen(true);
  };

  const handleOpenApplyStrikeModal = () => {
    setIsApplyStrikeModalOpen(true);
  };

  const initLiftSuspension = (user: UserStrike) => {
    setUserToLiftSuspension(user);
  };

  const handleConfirmLiftSuspension = async () => {
    if (!accessToken || !userToLiftSuspension) return;

    try {
      setLoading(true);
      const deletePromises = userToLiftSuspension.strikesHistory.map(strike =>
        deleteStrike(accessToken, Number(strike.id))
      );

      await Promise.all(deletePromises);
      await loadData();
      setUserToLiftSuspension(null);
    } catch (error) {
      console.error("Error lifting suspension:", error);
      alert("Hubo un error al levantar la suspensión. Revisa la consola.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          <PageHeader title={pageHeader.title} subtitle={pageHeader.subtitle} />

          <button
            onClick={handleOpenApplyStrikeModal}
            className="fixed bottom-8 right-8 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-10"
          >
            <Plus className="h-6 w-6" />
          </button>

          {loading && !userToLiftSuspension ? (
            <div className="text-center py-8">Cargando...</div>
          ) : (
            <>
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
                  footer="Este mes" // TODO: Filter by month if needed
                  variant="blue"
                />
              </div>
              <SearchBar placeholder="Buscar por nombre de usuario..." value={searchQuery} onChange={handleSearchChange} />

              <UserStrikesTable
                users={filteredUsers}
                onViewHistory={handleViewHistory}
                onLiftSuspension={initLiftSuspension}
              />

              <div className="my-8">
                <h3 className="text-lg font-semibold">Historial de Strikes</h3>
                <p className="text-sm text-muted-foreground">
                  A continuación se muestra el historial completo de strikes.
                </p>
              </div>

              <StrikeHistoryTable strikes={paginatedStrikes} />

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center space-x-4 mt-4">
                  <button
                    onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-md border border-gray-300 disabled:opacity-50 hover:bg-gray-100"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="text-sm text-gray-700">
                    Página {currentPage} de {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-md border border-gray-300 disabled:opacity-50 hover:bg-gray-100"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>

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
          accessToken={accessToken}
          onSuccess={() => {
            setIsApplyStrikeModalOpen(false);
            loadData(); // Reload data
          }}
        />

        <LiftSuspensionModal
          isOpen={!!userToLiftSuspension}
          onClose={() => setUserToLiftSuspension(null)}
          onConfirm={handleConfirmLiftSuspension}
          userName={userToLiftSuspension?.name || ''}
          loading={loading && !!userToLiftSuspension}
        />
      </div>
    </>
  );
}
