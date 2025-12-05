// components/dashboard/GroupsView.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { getAccessToken, useUser } from '@auth0/nextjs-auth0';
import { Users, PlusCircle, ArrowRight, Loader2, Crown, CheckCircle, X, Clock } from 'lucide-react';

// --- Tipos basados en la response del backend ---
interface GroupRequest {
  id: number;
  name: string;
  description: string;
  goal: string;
  logo: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
  // Otros campos opcionales que vienen del backend
  group_created?: boolean;
  group_id?: number | null;
}

interface Representative {
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
  is_deleted: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  groupRequest: GroupRequest;
  representative?: Representative;
  eventRequests?: any[];
}

interface MyGroupsResponse {
  total_groups: number;
  groups: Group[];
}

type GroupsViewProps = {
  userId: number;
};

export const GroupsView: React.FC<GroupsViewProps> = ({ userId }) => {
  const { user, isLoading } = useUser();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [allGroups, setAllGroups] = useState<Group[]>([]);
  const [myGroups, setMyGroups] = useState<Group[]>([]);
  const [pendingRequests, setPendingRequests] = useState<GroupRequest[]>([]);
  const [isLoadingAll, setIsLoadingAll] = useState(true);
  const [isLoadingMy, setIsLoadingMy] = useState(true);
  const [isLoadingPending, setIsLoadingPending] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);

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

  // Obtener access token y perfil del usuario
  useEffect(() => {
    async function fetchAccessToken() {
      if (user) {
        try {
          const token = await getAccessToken();
          setAccessToken(token);
        } catch (error) {
          console.error('Error fetching access token:', error);
        }
      }
    }

    fetchAccessToken();
  }, [user]);

  // Cargar solicitudes pendientes
  useEffect(() => {
    const loadPendingRequests = async () => {
      if (!accessToken || !userId) return;

      setIsLoadingPending(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/group-requests?user_id=${userId}&status=PENDING`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          console.error('Error fetching pending requests:', response.status);
          // No bloqueamos la UI si falla esto, solo asumimos 0 pendientes o manejamos error silenciosamente
          return;
        }

        const data = await response.json();
        setPendingRequests(data);
      } catch (error) {
        console.error('Error loading pending requests:', error);
      } finally {
        setIsLoadingPending(false);
      }
    };

    if (accessToken && userId) loadPendingRequests();
  }, [accessToken, userId]);

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

  // Cargar mis grupos (donde soy representante)
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
          setMyGroups([]); // No es representante de ningún grupo
          return;
        }

        if (!response.ok) {
          throw new Error('Error al cargar mis grupos');
        }

        const data: MyGroupsResponse = await response.json();
        setMyGroups(data.groups || []);
      } catch (error) {
        console.error('Error loading my groups:', error);
        setError('Error al cargar mis grupos');
      } finally {
        setIsLoadingMy(false);
      }
    };

    if (accessToken && userId) loadMyGroups();
  }, [accessToken, userId]);

  const handleCreateAnother = () => {
    setShowSuccessMessage(false);
    router.push(`/Student/Groups/Form?userId=${userId}`);
  };

  // Verificar si el usuario tiene solicitudes pendientes
  const pendingCount = pendingRequests.length;
  const hasPendingRequests = pendingCount >= 1;

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
      {!isLoadingPending && hasPendingRequests && (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <Clock className="h-6 w-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-amber-800 mb-2">
                Solicitud de grupo pendiente
              </h3>
              <p className="text-sm text-amber-700">
                Ya tienes {pendingCount} solicitud{pendingCount !== 1 ? 'es' : ''} de grupo pendiente{pendingCount !== 1 ? 's' : ''}.
                Por favor espera a que se resuelva{pendingCount !== 1 ? 'n' : ''} antes de crear una nueva solicitud.
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
            <p className="text-sm text-slate-600 mt-1">Grupos donde eres representante</p>
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
            <p className="text-slate-600">Aún no eres representante de ningún grupo</p>
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
              {myGroups.map((group) => (
                <li key={group.id}>
                  <Link
                    href={`/Student/Groups/Representative/${group.id}`}
                    className="group block p-6 transition-colors hover:bg-slate-50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="text-lg font-bold text-gray-800 group-hover:text-blue-600">
                            {group.groupRequest.name}
                          </h3>
                          <span className="rounded-full px-2.5 py-0.5 text-xs font-semibold flex items-center gap-1 bg-amber-100 text-amber-800">
                            <Crown size={12} />
                            Representante
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-slate-600 max-w-2xl">{group.groupRequest.description}</p>
                        <div className="mt-3 flex items-center gap-4 text-sm text-slate-500">
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
                const isMyGroup = myGroups.some((mg) => mg.id === group.id);

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
                              {group.groupRequest.name}
                            </h3>
                            {isMyGroup && (
                              <span className="rounded-full px-2.5 py-0.5 text-xs font-semibold flex items-center gap-1 bg-amber-100 text-amber-800">
                                <Crown size={12} />
                                Representante
                              </span>
                            )}
                          </div>
                          <p className="mt-2 text-sm text-slate-600 max-w-2xl">{group.groupRequest.description}</p>
                          <div className="mt-3 flex items-center gap-4 text-sm text-slate-500">
                            <div className="flex items-center gap-1.5">
                              <span className="font-medium">Reputación:</span>
                              <span>{group.reputation}</span>
                            </div>
                            {group.representative && (
                              <div className="flex items-center gap-1.5">
                                <Crown size={14} className="text-amber-600" />
                                <span>
                                  {group.representative.first_name} {group.representative.last_name}
                                </span>
                              </div>
                            )}
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