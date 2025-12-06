// components/dashboard/GroupsView.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { getAccessToken, useUser } from '@auth0/nextjs-auth0';
import { Users, PlusCircle, ArrowRight, Loader2, Shield, Crown, CheckCircle, X, Clock, FileText, Trash2, Edit3, AlertCircle, XCircle, CheckCircle2 } from 'lucide-react';
import { fetchGroupRequests } from '@/lib/groups/fetchGroupRequests';
import { resolveAccessToken } from '@/app/Admin/Room/room-utils';
import { GroupRequest } from '@/types/groupRequest';

// --- Tipos basados en la response del backend ---
interface GroupRequestInfo {
  id: number;
  name: string;
  description: string;
  goal: string;
  logo: string | null;
  status: string;
}

interface Representative {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

interface Moderator {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

interface Group {
  id: number;
  reputation: string;
  repre_id: number;
  group_request_id: number;
  moderators_ids: number[];
  createdAt: string;
  updatedAt: string;
  groupRequest: GroupRequestInfo;
  representative: Representative;
  moderators: Moderator[];
  eventRequests?: any[];
}

interface MyGroupRole {
  group: Group;
  role: 'Representante' | 'Moderador';
}

type GroupsViewProps = {
  userId: number;
};

export const GroupsView: React.FC<GroupsViewProps> = ({ userId }) => {
  const { user, isLoading } = useUser();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [allGroups, setAllGroups] = useState<Group[]>([]);
  const [myGroups, setMyGroups] = useState<MyGroupRole[]>([]);
  const [isLoadingAll, setIsLoadingAll] = useState(true);
  const [isLoadingMy, setIsLoadingMy] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [pendingRequestsCount, setPendingRequestsCount] = useState<number>(0);
  const [isLoadingPendingRequests, setIsLoadingPendingRequests] = useState(true);
  const [myRequests, setMyRequests] = useState<GroupRequest[]>([]);
  const [isLoadingRequests, setIsLoadingRequests] = useState(true);
  const [deletingRequestId, setDeletingRequestId] = useState<number | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<number | null>(null);

  // Detectar si hay un parámetro de éxito en la URL
  useEffect(() => {
    const success = searchParams.get('success');
    if (success === 'true') {
      setShowSuccessMessage(true);
      // Limpiar el parámetro de la URL sin recargar la página
      const newUrl = window.location.pathname + window.location.search.replace(/[?&]success=true/, '');
      window.history.replaceState({}, '', newUrl);
    }
  }, [searchParams]);

  // Obtener access token
  useEffect(() => {
    async function fetchToken() {
      if (user) {
        try {
          const tokenResponse = await getAccessToken();
          const resolvedToken = resolveAccessToken(tokenResponse);
          setAccessToken(resolvedToken);
        } catch (error) {
          console.error('Error fetching access token:', error);
        }
      }
    }

    fetchToken();
  }, [user]);

  // Obtener solicitudes pendientes del usuario
  useEffect(() => {
    async function loadPendingRequests() {
      setIsLoadingPendingRequests(true);
      try {
        const requests = await fetchGroupRequests(accessToken, { 
          status: 'PENDING', 
          user_id: userId 
        });
        setPendingRequestsCount(requests?.length ?? 0);
      } catch (error) {
        console.error('Error loading pending requests:', error);
      } finally {
        setIsLoadingPendingRequests(false);
      }
    }

    if (accessToken && userId > 0) {
      loadPendingRequests();
    } else if (!isLoading && userId === 0) {
      setIsLoadingPendingRequests(false);
    }
  }, [accessToken, userId, isLoading]);

  // Obtener todas las solicitudes del usuario
  useEffect(() => {
    async function loadMyRequests() {
      console.log('[GroupsView] Cargando solicitudes para userId:', userId);
      setIsLoadingRequests(true);
      try {
        const requests = await fetchGroupRequests(accessToken, { user_id: userId });
        console.log('[GroupsView] Solicitudes recibidas:', requests);
        setMyRequests(requests ?? []);
      } catch (error) {
        console.error('[GroupsView] Error loading my requests:', error);
      } finally {
        setIsLoadingRequests(false);
      }
    }

    console.log('[GroupsView] Estado actual - accessToken:', !!accessToken, 'userId:', userId, 'isLoading:', isLoading);
    
    if (accessToken && userId !== undefined && userId !== null && userId > 0) {
      loadMyRequests();
    } else if (!isLoading && (!accessToken || userId === 0)) {
      // Si Auth0 terminó de cargar pero no hay token o userId válido
      console.log('[GroupsView] No hay token o userId válido, deteniendo loading');
      setIsLoadingRequests(false);
    }
  }, [accessToken, userId, isLoading]);

  // Función para eliminar una solicitud
  const handleDeleteRequest = async (requestId: number) => {
    if (!accessToken) return;

    setDeletingRequestId(requestId);
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/group-requests/${requestId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (response.ok) {
        // Actualizar la lista de solicitudes
        setMyRequests((prev) => prev.filter((req) => req.id !== requestId));
        // Actualizar el contador de pendientes si era una solicitud pendiente
        const deletedRequest = myRequests.find((req) => req.id === requestId);
        if (deletedRequest?.status === 'PENDING') {
          setPendingRequestsCount((prev) => Math.max(0, prev - 1));
        }
        setShowDeleteConfirm(null);
      } else {
        console.error('Error al eliminar la solicitud');
      }
    } catch (error) {
      console.error('Error deleting request:', error);
    } finally {
      setDeletingRequestId(null);
    }
  };

  // Obtener el ícono y estilos según el estado
  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'PENDING':
        return {
          icon: Clock,
          label: 'Pendiente',
          bgColor: 'bg-amber-100',
          textColor: 'text-amber-800',
          borderColor: 'border-amber-200',
        };
      case 'CONFIRMED':
        return {
          icon: CheckCircle2,
          label: 'Aprobada',
          bgColor: 'bg-green-100',
          textColor: 'text-green-800',
          borderColor: 'border-green-200',
        };
      case 'CANCELLED':
        return {
          icon: XCircle,
          label: 'Rechazada',
          bgColor: 'bg-red-100',
          textColor: 'text-red-800',
          borderColor: 'border-red-200',
        };
      default:
        return {
          icon: AlertCircle,
          label: status,
          bgColor: 'bg-slate-100',
          textColor: 'text-slate-800',
          borderColor: 'border-slate-200',
        };
    }
  };

  // Formatear fecha
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Cargar todos los grupos
  useEffect(() => {
    const loadAllGroups = async () => {
      if (!accessToken) return;

      setIsLoadingAll(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/groups`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          setAllGroups([]);
          return;
        }

        const data = await response.json();
        setAllGroups(data);
      } catch (error) {
        console.error('Error loading all groups:', error);
        setError('Error al cargar los grupos');
      } finally {
        setIsLoadingAll(false);
      }
    };

    if (accessToken) loadAllGroups();
  }, [accessToken]);

  // Cargar mis grupos (donde soy representante o moderador)
  useEffect(() => {
    const loadMyGroups = async () => {
      if (!accessToken) return;

      setIsLoadingMy(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/groups/my-groups`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        if (response.status === 403) {
          setMyGroups([]); // No es representante ni moderador de ningún grupo
          return;
        }

        if (!response.ok) {
          throw new Error('Error al cargar mis grupos');
        }

        const data: Group[] = await response.json();

        // Determinar el rol del usuario en cada grupo
        const groupsWithRoles: MyGroupRole[] = data.map((group) => {
          const isRepresentative = group.repre_id === userId;
          const isModerator = group.moderators_ids?.includes(userId!) ?? false;

          return {
            group,
            role: isRepresentative ? 'Representante' : 'Moderador',
          };
        });

        setMyGroups(groupsWithRoles);
      } catch (error) {
        console.error('Error loading my groups:', error);
        setError('Error al cargar mis grupos');
      } finally {
        setIsLoadingMy(false);
      }
    };

    if (accessToken && userId > 0) {
      loadMyGroups();
    } else if (!isLoading && (!accessToken || userId === 0)) {
      // Si no hay token o userId válido, no podemos cargar
      setIsLoadingMy(false);
    }
  }, [accessToken, userId, isLoading]);

  // Calcular el número total de miembros (representante + moderadores)
  const getMemberCount = (group: Group): number => {
    return 1 + (group.moderators?.length ?? 0); // 1 representante + N moderadores
  };

  const handleCreateAnother = () => {
    setShowSuccessMessage(false);
    router.push(`/Student/Groups/Form?userId=${userId}`);
  };

  // Verificar si el usuario tiene solicitudes pendientes
  const hasPendingRequests = pendingRequestsCount >= 1;

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-red-800 font-semibold">{error}</p>
      </div>
    );
  }

  return (
    <section className="space-y-10">
      {/* Mensaje de solicitud pendiente */}
      {!isLoadingPendingRequests && hasPendingRequests && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <Clock className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-amber-800 mb-2">
                Solicitud de grupo pendiente
              </h3>
              <p className="text-sm text-amber-700">
                Ya tienes {pendingRequestsCount} solicitud{pendingRequestsCount !== 1 ? 'es' : ''} de grupo pendiente{pendingRequestsCount !== 1 ? 's' : ''}. 
                Por favor espera a que se resuelva{pendingRequestsCount !== 1 ? 'n' : ''} antes de crear una nueva solicitud.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Mensaje de éxito */}
      {showSuccessMessage && (
        <div className="rounded-xl border border-green-200 bg-green-50 p-6 shadow-sm animate-fade-in">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4 flex-1">
              <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-green-800 mb-2">
                  ¡Solicitud de grupo enviada con éxito!
                </h3>
                <p className="text-sm text-green-700 mb-4">
                  Tu solicitud ha sido enviada y está siendo revisada. Puedes revisar el estado de tu solicitud en esta misma sección o realizar otra solicitud.
                </p>
                <div className="flex gap-3 flex-wrap">
                  <button
                    onClick={() => setShowSuccessMessage(false)}
                    className="inline-flex items-center gap-2 rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-700"
                  >
                    Continuar Explorando
                  </button>
                  {!hasPendingRequests && (
                    <button
                      onClick={handleCreateAnother}
                      className="inline-flex items-center gap-2 rounded-full bg-white border-2 border-green-600 px-4 py-2 text-sm font-semibold text-green-600 transition-colors hover:bg-green-50"
                    >
                      <PlusCircle size={16} /> Realizar Otra Solicitud
                    </button>
                  )}
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowSuccessMessage(false)}
              className="text-green-600 hover:text-green-800 transition-colors flex-shrink-0"
              aria-label="Cerrar mensaje"
            >
              <X size={20} />
            </button>
          </div>
        </div>
      )}
      {/* Sección: Mis Grupos */}
      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">Mis Grupos</h2>
            <p className="text-sm text-slate-600 mt-1">Grupos donde eres representante o moderador</p>
          </div>
          {hasPendingRequests ? (
            <div className="flex items-center gap-2 rounded-full bg-slate-400 px-4 py-2 text-sm font-semibold text-white cursor-not-allowed" title="Tienes solicitudes pendientes">
              <PlusCircle size={16} /> Crear Grupo
            </div>
          ) : (
            <Link
              href={{ pathname: '/Student/Groups/Form', query: { userId } }}
              className="flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
            >
              <PlusCircle size={16} /> Crear Grupo
            </Link>
          )}
        </div>

        {isLoadingMy ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : myGroups.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
            <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600">Aún no eres parte de ningún grupo como representante o moderador</p>
            {hasPendingRequests ? (
              <p className="mt-4 text-sm text-amber-600 font-medium">
                Tienes una solicitud pendiente. Espera a que se resuelva antes de crear otra.
              </p>
            ) : (
              <Link
                href={{ pathname: '/Student/Groups/Form', query: { userId } }}
                className="inline-flex items-center gap-2 mt-4 text-blue-600 hover:text-blue-700 font-semibold"
              >
                <PlusCircle size={16} /> Crear tu primer grupo
              </Link>
            )}
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <ul className="divide-y divide-slate-200">
              {myGroups.map(({ group, role }) => (
                <li key={group.id}>
                  <Link
                    href={`/Student/Groups/Representative/${group.id}`}
                    className="group block p-6 transition-colors hover:bg-slate-50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600">
                            {group.groupRequest?.name ?? 'Sin nombre'}
                          </h3>
                          <span
                            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold flex items-center gap-1 ${
                              role === 'Representante' ? 'bg-amber-100 text-amber-800' : 'bg-blue-100 text-blue-800'
                            }`}
                          >
                            {role === 'Representante' ? <Crown size={12} /> : <Shield size={12} />}
                            {role}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-slate-600 max-w-2xl">{group.groupRequest?.description ?? ''}</p>
                        <div className="mt-3 flex items-center gap-4 text-sm text-slate-500">
                          <div className="flex items-center gap-1.5">
                            <Users size={14} />
                            <span>{getMemberCount(group)} miembros</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-medium">Reputación:</span>
                            <span>{group.reputation}</span>
                          </div>
                        </div>
                      </div>
                      <ArrowRight className="mt-1 h-5 w-5 text-slate-400 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-blue-600 flex-shrink-0 ml-4" />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Sección: Mis Solicitudes */}
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Mis Solicitudes</h2>
          <p className="text-sm text-slate-600 mt-1">Historial de solicitudes de creación de grupos</p>
        </div>

        {isLoadingRequests ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : myRequests.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
            <FileText className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600">No tienes solicitudes de grupos</p>
            <Link
              href={{ pathname: '/Student/Groups/Form', query: { userId } }}
              className="inline-flex items-center gap-2 mt-4 text-blue-600 hover:text-blue-700 font-semibold"
            >
              <PlusCircle size={16} /> Crear tu primera solicitud
            </Link>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <ul className="divide-y divide-slate-200">
              {myRequests.map((request) => {
                const statusConfig = getStatusConfig(request.status);
                const StatusIcon = statusConfig.icon;
                const isPending = request.status === 'PENDING';
                const isConfirmed = request.status === 'CONFIRMED';

                return (
                  <li key={request.id} className="relative">
                    <div className="p-6">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="text-lg font-bold text-gray-800 truncate">
                              {request.name}
                            </h3>
                            <span
                              className={`rounded-full px-2.5 py-0.5 text-xs font-semibold flex items-center gap-1.5 ${statusConfig.bgColor} ${statusConfig.textColor}`}
                            >
                              <StatusIcon size={12} />
                              {statusConfig.label}
                            </span>
                          </div>
                          
                          <p className="mt-2 text-sm text-slate-600 line-clamp-2">
                            {request.description}
                          </p>
                          
                          <div className="mt-3 flex items-center gap-4 text-sm text-slate-500 flex-wrap">
                            <div className="flex items-center gap-1.5">
                              <span className="font-medium">Objetivo:</span>
                              <span className="truncate max-w-[200px]">{request.goal}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Clock size={14} />
                              <span>Creada: {formatDate(request.createdAt)}</span>
                            </div>
                            {isConfirmed && request.group_id && (
                              <Link
                                href={`/Student/Groups/Representative/${request.group_id}`}
                                className="flex items-center gap-1.5 text-blue-600 hover:text-blue-700 font-medium"
                              >
                                <ArrowRight size={14} />
                                Ver grupo creado
                              </Link>
                            )}
                          </div>
                        </div>

                        {/* Acciones */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          {isPending && (
                            <>
                              <Link
                                href={{ pathname: '/Student/Groups/Form', query: { userId, requestId: request.id, edit: 'true' } }}
                                className="p-2 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                                title="Editar solicitud"
                              >
                                <Edit3 size={18} />
                              </Link>
                              <button
                                onClick={() => setShowDeleteConfirm(request.id)}
                                className="p-2 rounded-lg text-slate-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                                title="Eliminar solicitud"
                              >
                                <Trash2 size={18} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Modal de confirmación de eliminación */}
                      {showDeleteConfirm === request.id && (
                        <div className="mt-4 p-4 rounded-lg bg-red-50 border border-red-200 animate-fade-in">
                          <div className="flex items-start gap-3">
                            <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                            <div className="flex-1">
                              <p className="text-sm font-medium text-red-800">
                                ¿Estás seguro de eliminar esta solicitud?
                              </p>
                              <p className="text-sm text-red-600 mt-1">
                                Esta acción no se puede deshacer.
                              </p>
                              <div className="flex gap-2 mt-3">
                                <button
                                  onClick={() => handleDeleteRequest(request.id)}
                                  disabled={deletingRequestId === request.id}
                                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
                                >
                                  {deletingRequestId === request.id ? (
                                    <Loader2 size={14} className="animate-spin" />
                                  ) : (
                                    <Trash2 size={14} />
                                  )}
                                  Eliminar
                                </button>
                                <button
                                  onClick={() => setShowDeleteConfirm(null)}
                                  className="px-3 py-1.5 rounded-lg bg-white text-slate-700 text-sm font-medium border border-slate-300 hover:bg-slate-50 transition-colors"
                                >
                                  Cancelar
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>

      {/* Sección: Todos los Grupos */}
      <div>
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-800">Explorar Grupos</h2>
          <p className="text-sm text-slate-600 mt-1">Descubre todos los grupos disponibles en la plataforma</p>
        </div>

        {isLoadingAll ? (
          <div className="flex justify-center items-center py-10">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : allGroups.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-8 text-center">
            <Users className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600">No hay grupos disponibles en este momento</p>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <ul className="divide-y divide-slate-200">
              {allGroups.map((group) => {
                // Verificar si este grupo está en "Mis Grupos"
                const myGroupData = myGroups.find((mg) => mg.group.id === group.id);
                const isMyGroup = !!myGroupData;

                return (
                  <li key={group.id}>
                    <Link
                      href={`/Student/Groups/User/${group.id}`}
                      className="group block p-6 transition-colors hover:bg-slate-50"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600">
                              {group.groupRequest?.name ?? 'Sin nombre'}
                            </h3>
                            {isMyGroup && (
                              <span
                                className={`rounded-full px-2.5 py-0.5 text-xs font-semibold flex items-center gap-1 ${
                                  myGroupData.role === 'Representante'
                                    ? 'bg-amber-100 text-amber-800'
                                    : 'bg-blue-100 text-blue-800'
                                }`}
                              >
                                {myGroupData.role === 'Representante' ? <Crown size={12} /> : <Shield size={12} />}
                                {myGroupData.role}
                              </span>
                            )}
                          </div>
                          <p className="mt-2 text-sm text-slate-600 max-w-2xl">{group.groupRequest?.description ?? ''}</p>
                          <div className="mt-3 flex items-center gap-4 text-sm text-slate-500">
                            <div className="flex items-center gap-1.5">
                              <Users size={14} />
                              <span>{getMemberCount(group)} miembros</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <span className="font-medium">Reputación:</span>
                              <span>{group.reputation}</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <Crown size={14} className="text-amber-600" />
                              <span>
                                {group.representative?.first_name ?? ''} {group.representative?.last_name ?? ''}
                              </span>
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="mt-1 h-5 w-5 text-slate-400 transition-transform duration-300 group-hover:translate-x-1 group-hover:text-blue-600 flex-shrink-0 ml-4" />
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
};