'use client';

import { useState, useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { PageHeader } from '@/components/ui/page-header';
import { UsersTable } from '@/components/ui/admin/users/users-table';
import { fetchAllUsers } from '@/lib/users/fetchAllUsers';
import { UserProfile } from '@/types/userProfile';
import { getAccessToken } from '@auth0/nextjs-auth0';
import { resolveAccessToken } from '@/app/Admin/Room/room-utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ConfirmationModal } from '@/components/common/ConfirmationModal';
import { deleteUser } from '@/lib/users/deleteUser';
import { restoreUser } from '@/lib/users/restoreUser';
import { promoteUser } from '@/lib/users/promoteUser';

export default function AdminUsersPage() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const page = Number(searchParams.get('page')) || 1;
  const take = 10;

  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const [userToDelete, setUserToDelete] = useState<{ id: number; name: string } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [userToRestore, setUserToRestore] = useState<{ id: number; name: string } | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const [userToPromote, setUserToPromote] = useState<{ id: number; name: string } | null>(null);
  const [isPromoting, setIsPromoting] = useState(false);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const tokenResponse = await getAccessToken();
      const accessToken = resolveAccessToken(tokenResponse);

      if (!accessToken) {
        console.warn('No access token available');
        return;
      }

      const response = await fetchAllUsers(accessToken, page, take);

      if (response) {
        if (Array.isArray(response)) {
          // Direct array response (fallback)
          setUsers(response as any);
          setTotalPages(1);
        } else if (response.items) {
          // Paginated response with items
          setUsers(response.items);
          const lastPage = Math.ceil(response.total / response.take);
          setTotalPages(lastPage);
        } else {
          // Fallback
          setUsers([]);
          setTotalPages(1);
        }
      }
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, [page]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= totalPages) {
      router.push(`/Admin/Users?page=${newPage}`);
    }
  };

  const handleDeleteClick = (userId: number, userName: string) => {
    setUserToDelete({ id: userId, name: userName });
  };

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return;

    try {
      setIsDeleting(true);
      const tokenResponse = await getAccessToken();
      const accessToken = resolveAccessToken(tokenResponse);

      if (!accessToken) {
        console.warn('No access token available');
        return;
      }

      const result = await deleteUser(accessToken, userToDelete.id);

      if (result.success) {
        // Reload users after successful deletion
        await loadUsers();
        setUserToDelete(null);
      } else {
        console.error('Error deleting user:', result.error);
        alert(result.error || 'Error al eliminar el usuario');
      }
    } catch (error) {
      console.error('Error in delete handler:', error);
      alert('Error al eliminar el usuario');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteCancel = () => {
    setUserToDelete(null);
  };

  const handleRestoreClick = (userId: number, userName: string) => {
    setUserToRestore({ id: userId, name: userName });
  };

  const handleRestoreConfirm = async () => {
    if (!userToRestore) return;

    try {
      setIsRestoring(true);
      const tokenResponse = await getAccessToken();
      const accessToken = resolveAccessToken(tokenResponse);

      if (!accessToken) {
        console.warn('No access token available');
        return;
      }

      const result = await restoreUser(accessToken, userToRestore.id);

      if (result.success) {
        // Reload users after successful restoration
        await loadUsers();
        setUserToRestore(null);
      } else {
        console.error('Error restoring user:', result.error);
        alert(result.error || 'Error al restaurar el usuario');
      }
    } catch (error) {
      console.error('Error in restore handler:', error);
      alert('Error al restaurar el usuario');
    } finally {
      setIsRestoring(false);
    }
  };

  const handleRestoreCancel = () => {
    setUserToRestore(null);
  };

  const handlePromoteClick = (userId: number, userName: string) => {
    setUserToPromote({ id: userId, name: userName });
  };

  const handlePromoteConfirm = async () => {
    if (!userToPromote) return;

    try {
      setIsPromoting(true);
      const tokenResponse = await getAccessToken();
      const accessToken = resolveAccessToken(tokenResponse);

      if (!accessToken) {
        console.warn('No access token available');
        return;
      }

      const result = await promoteUser(accessToken, userToPromote.id);

      if (result.success) {
        // Reload users after successful promotion
        await loadUsers();
        setUserToPromote(null);
      } else {
        console.error('Error promoting user:', result.error);
        alert(result.error || 'Error al promover el usuario');
      }
    } catch (error) {
      console.error('Error in promote handler:', error);
      alert('Error al promover el usuario');
    } finally {
      setIsPromoting(false);
    }
  };

  const handlePromoteCancel = () => {
    setUserToPromote(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <PageHeader
          title="Gestionar Usuarios"
          subtitle="Visualiza y administra todos los usuarios registrados en la plataforma"
        />

        {loading ? (
          <p className="text-center text-gray-500 mt-8">Cargando usuarios...</p>
        ) : (
          <>
            <UsersTable
              users={users}
              onDelete={handleDeleteClick}
              onRestore={handleRestoreClick}
              onPromote={handlePromoteClick}
            />

            {/* Pagination Controls */}
            <div className="flex justify-center items-center mt-6 gap-4">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
                className="p-2 rounded-lg bg-white border border-gray-200 disabled:opacity-50 hover:bg-gray-50 transition-colors"
                title="Página anterior"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600" />
              </button>

              <span className="text-sm font-medium text-gray-700">
                Página {page} de {totalPages}
              </span>

              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= totalPages}
                className="p-2 rounded-lg bg-white border border-gray-200 disabled:opacity-50 hover:bg-gray-50 transition-colors"
                title="Página siguiente"
              >
                <ChevronRight className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </>
        )}

        {/* Confirmation Modal for Deletion */}
        <ConfirmationModal
          isOpen={!!userToDelete}
          onClose={handleDeleteCancel}
          onConfirm={handleDeleteConfirm}
          title="Confirmar Eliminación"
          confirmText="Eliminar Usuario"
          cancelText="Cancelar"
          loadingText="Eliminando..."
          isLoading={isDeleting}
          variant="danger"
        >
          <p>
            ¿Estás seguro de que deseas eliminar al usuario <strong>{userToDelete?.name}</strong>?
          </p>
          <p className="mt-2 text-sm text-gray-500">Esta acción marcará al usuario como eliminado en el sistema.</p>
        </ConfirmationModal>

        {/* Confirmation Modal for Restoration */}
        <ConfirmationModal
          isOpen={!!userToRestore}
          onClose={handleRestoreCancel}
          onConfirm={handleRestoreConfirm}
          title="Confirmar Restauración"
          confirmText="Restaurar Usuario"
          cancelText="Cancelar"
          loadingText="Restaurando..."
          isLoading={isRestoring}
          variant="primary"
        >
          <p>
            ¿Estás seguro de que deseas restaurar al usuario <strong>{userToRestore?.name}</strong>?
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Esta acción marcará al usuario como activo nuevamente en el sistema.
          </p>
        </ConfirmationModal>

        {/* Confirmation Modal for Promotion */}
        <ConfirmationModal
          isOpen={!!userToPromote}
          onClose={handlePromoteCancel}
          onConfirm={handlePromoteConfirm}
          title="Confirmar Promoción"
          confirmText="Promover a Administrador"
          cancelText="Cancelar"
          loadingText="Promoviendo..."
          isLoading={isPromoting}
          variant="primary"
        >
          <p>
            ¿Estás seguro de que deseas promover a <strong>{userToPromote?.name}</strong> a administrador?
          </p>
          <p className="mt-2 text-sm text-gray-500">
            Esta acción cambiará el rol del usuario a ADMIN, otorgándole permisos administrativos completos.
          </p>
        </ConfirmationModal>
      </div>
    </div>
  );
}
