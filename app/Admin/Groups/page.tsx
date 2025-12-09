// app/Admin/Groups/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import { TabNavigation } from '@/components/ui/tab-navigation';
import { SearchBar } from '@/components/ui/search-bar';
import { GroupRequestsTable } from '@/components/ui/admin/groups/group-requests-table';
import { PageHeader } from '@/components/ui/page-header';
import { GroupDetailsModal } from '@/components/ui/admin/groups/group-details-modal';
import { GroupDetailView } from '@/components/dashboard/GroupDetailView'; // Importar el componente
import { fetchGroupRequests } from '@/lib/groups/fetchGroupRequests';
import { GroupRequest } from '@/types/groupRequest';
import { getAccessToken } from '@auth0/nextjs-auth0';
import { resolveAccessToken } from '@/app/Admin/Room/room-utils';
import { updateGroupRequest } from '@/lib/groups/updateGroupRequest';
import { X } from 'lucide-react'; // Importar icono para cerrar

export default function AdminGroupsPage() {
  const searchParams = useSearchParams();

  const [activeTab, setActiveTab] = useState(0);
  const [searchValue, setSearchValue] = useState('');

  const [requests, setRequests] = useState<GroupRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedRequest, setSelectedRequest] = useState<GroupRequest | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Estado para gestionar grupo (eliminar)
  const [managingGroupId, setManagingGroupId] = useState<number | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);

      const tokenResponse = await getAccessToken();
      const accessToken = resolveAccessToken(tokenResponse);
      const data = await fetchGroupRequests(accessToken);

      if (data) {
        const mapped: GroupRequest[] = data.map((req: any) => ({
          id: req.id,
          name: req.groupName ?? req.name ?? '',
          goal: req.goal ?? '',
          description: req.description ?? '',
          logo: req.logo ?? null,
          status: req.status ?? 'PENDING',
          user: {
            id: req.user_id ?? 0,
            first_name: req.user.first_name,
            last_name: req.user.last_name,
            email: req.user.email,
            role: req.user.role,
          },
          group_created: req.group_created ?? false,
          group_id: req.group_id ?? null,
          createdAt: req.createdAt ?? req.date ?? new Date().toISOString(),
          updatedAt: req.updatedAt ?? new Date().toISOString(),
        }));

        setRequests(mapped);
      }
    } catch (error) {
      console.error('Error cargando solicitudes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleView = useCallback(
    (id: number) => {
      const req = requests.find((r) => r.id === id);
      if (req) {
        setSelectedRequest(req);
        setIsModalOpen(true);
      }
    },
    [requests]
  );

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    const id = searchParams.get('groupId');
    if (id) handleView(Number(id));
  }, [searchParams, requests, handleView]);

  const updateStatus = async (id: number, status: 'CONFIRMED' | 'CANCELLED') => {
    try {
      setLoading(true);

      const tokenResponse = await getAccessToken();
      const accessToken = resolveAccessToken(tokenResponse);
      if (!accessToken) return console.warn('Token no disponible');

      await updateGroupRequest(accessToken, id, { status });

      await loadData();
    } catch (error) {
      console.error('Error actualizando solicitud:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = (id: number) => updateStatus(id, 'CONFIRMED');
  const handleReject = (id: number) => updateStatus(id, 'CANCELLED');

  const handleManage = (group_id: number | null) => {
    if (!group_id) return;
    setManagingGroupId(group_id);
  };

  const handleCloseModal = () => {
    setSelectedRequest(null);
    setIsModalOpen(false);
  };

  const handleCloseManageModal = () => {
    setManagingGroupId(null);
  };

  const handleAdminDeleteSuccess = () => {
    setManagingGroupId(null);
    loadData(); // Recargar datos para actualizar la lista
  };

  const requestsByStatus = {
    pending: requests.filter((r) => r.status === 'PENDING'),
    approved: requests.filter((r) => r.status === 'CONFIRMED'),
    rejected: requests.filter((r) => r.status === 'CANCELLED'),
  };

  const tabs = [
    { label: 'Pendientes', count: requestsByStatus.pending.length, active: activeTab === 0 },
    { label: 'Aprobados', count: requestsByStatus.approved.length, active: activeTab === 1 },
    { label: 'Rechazados', count: requestsByStatus.rejected.length, active: activeTab === 2 },
  ];

  const getTableType = () => {
    if (activeTab === 0) return 'PENDING';
    if (activeTab === 1) return 'CONFIRMED';
    return 'CANCELLED';
  };

  const getCurrentRequests = () => {
    if (activeTab === 0) return requestsByStatus.pending;
    if (activeTab === 1) return requestsByStatus.approved;
    return requestsByStatus.rejected;
  };

  const filteredRequests = getCurrentRequests().filter((r) => {
    const t = searchValue.toLowerCase();
    return r.name.toLowerCase().includes(t) || r.user.first_name.toLowerCase().includes(t);
  });

  const pageHeader =
    activeTab === 0
      ? { title: 'Administrar Grupos - Pendientes', subtitle: 'Revisa y aprueba o rechaza nuevas solicitudes' }
      : activeTab === 1
        ? { title: 'Administrar Grupos - Aprobados', subtitle: 'Gestiona los grupos aprobados' }
        : { title: 'Administrar Grupos - Rechazados', subtitle: 'Historial de solicitudes rechazadas' };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader title={pageHeader.title} subtitle={pageHeader.subtitle} />

        {loading ? (
          <p className="text-center text-gray-500 mt-8">Cargando solicitudes...</p>
        ) : (
          <>
            <TabNavigation tabs={tabs} onTabChange={setActiveTab} />
            <SearchBar placeholder="Buscar..." value={searchValue} onChange={setSearchValue} />
            <GroupRequestsTable
              requests={filteredRequests}
              tableType={getTableType()}
              onView={handleView}
              onApprove={handleApprove}
              onReject={handleReject}
              onManage={handleManage}
            />
          </>
        )}

        <GroupDetailsModal
          request={selectedRequest}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onApprove={handleApprove}
          onReject={handleReject}
        />

        {/* Modal de Gestión de Grupo (Admin) */}
        {managingGroupId && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
            {/* Wrapper para el contenido del modal */}
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] flex flex-col relative my-8">
              {/* Botón de cierre sticky o absoluto */}
              <button
                onClick={handleCloseManageModal}
                className="absolute top-4 right-4 z-10 p-2 bg-white/80 rounded-full hover:bg-gray-100 transition-colors"
                title="Cerrar"
              >
                <X className="h-6 w-6 text-gray-500" />
              </button>

              {/* Contenedor escrolleable para el contenido */}
              <div className="overflow-y-auto p-6 md:p-8">
                <GroupDetailView
                  groupId={managingGroupId.toString()}
                  viewMode="admin"
                  onAdminDeleteSuccess={handleAdminDeleteSuccess}
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
