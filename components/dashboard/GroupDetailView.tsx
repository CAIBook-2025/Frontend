// components/dashboard/GroupDetailView.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAccessToken, useUser } from '@auth0/nextjs-auth0';
import { fetchUserProfile, UserProfileResponse } from '@/lib/user/fetchUserProfile';
import {
  Users,
  Crown,
  CalendarPlus,
  Trash2,
  ArrowRight,
  Star,
  Loader2,
  AlertTriangle,
  Clock,
  CheckCircle2,
  XCircle,
  Calendar,
  MapPin,
  Eye,
} from 'lucide-react';

import { fetchEventRequests } from '@/lib/events/fetchEventRequests';
import { deleteGroupRequest } from '@/lib/groups/deleteGroupRequest';
import { softDeleteGroupAsAdmin } from '@/lib/groups/deleteGroupAsAdmin';
import { EventRequest, EVENT_STATUS_CONFIG, getModuleTimeLabel } from '@/types/eventRequest';

// --- Tipos basados en la API ---
interface GroupRequest {
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

interface GroupDetails {
  id: number;
  reputation: string;
  repre_id: number;
  group_request_id: number;
  is_deleted: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  groupRequest: GroupRequest;
  representative: Representative;
  eventRequests?: any[];
}

interface GroupDetailViewProps {
  groupId: string;
  viewMode?: 'representative' | 'admin';
  onAdminDeleteSuccess?: () => void;
}

// --- Componente para Tarjetas de Acción ---
const ActionCard = ({
  href,
  icon,
  title,
  description,
  variant = 'default',
  onClick,
  disabled = false,
}: {
  href?: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  variant?: 'default' | 'danger';
  onClick?: () => void;
  disabled?: boolean;
}) => {
  const baseClasses = 'group block rounded-xl border p-6 shadow-md transition-all duration-300';
  const variantClasses =
    variant === 'danger'
      ? 'border-red-200 bg-red-50 hover:border-red-500 hover:shadow-lg'
      : 'border-slate-200 bg-white hover:border-blue-500 hover:shadow-lg';

  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';

  const content = (
    <div className="flex items-start justify-between">
      <div>
        <div
          className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full ${
            variant === 'danger' ? 'bg-red-100' : 'bg-blue-100'
          }`}
        >
          {icon}
        </div>
        <h3 className="text-xl font-bold text-gray-800">{title}</h3>
        <p className="mt-1 text-slate-600">{description}</p>
        {disabled && <p className="mt-2 text-xs text-orange-600 font-medium">Próximamente disponible</p>}
      </div>
      <ArrowRight
        className={`mt-1 h-5 w-5 text-slate-400 transition-transform duration-300 group-hover:translate-x-1 ${
          variant === 'danger' ? 'group-hover:text-red-500' : 'group-hover:text-blue-500'
        }`}
      />
    </div>
  );

  if (disabled) {
    return <div className={`${baseClasses} ${variantClasses} ${disabledClasses}`}>{content}</div>;
  }

  if (href) {
    return (
      <a href={href} className={`${baseClasses} ${variantClasses}`}>
        {content}
      </a>
    );
  }

  return (
    <button onClick={onClick} className={`${baseClasses} ${variantClasses} w-full text-left`}>
      {content}
    </button>
  );
};

// --- Componente para Estadísticas ---
const StatCard = ({ icon, value, label }: { icon: React.ReactNode; value: string | number; label: string }) => (
  <div className="rounded-lg bg-white p-4 shadow-sm border border-slate-200">
    <div className="flex items-center gap-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">{icon}</div>
      <div>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        <p className="text-sm text-slate-500">{label}</p>
      </div>
    </div>
  </div>
);

// --- Componente Principal ---
export const GroupDetailView = ({
  groupId,
  viewMode = 'representative',
  onAdminDeleteSuccess,
}: GroupDetailViewProps) => {
  const { user, isLoading: isUserLoading } = useUser();
  const router = useRouter();
  const [groupDetails, setGroupDetails] = useState<GroupDetails | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfileResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [recentEvents, setRecentEvents] = useState<EventRequest[]>([]);

  // Determinar el rol del usuario (comparar ID del perfil con repre_id del grupo)
  // En modo admin, siempre permitimos ver, pero las acciones dependen del viewMode
  const isRepresentative =
    viewMode === 'representative' && userProfile?.user && groupDetails
      ? groupDetails.repre_id === userProfile.user.id
      : false;

  const isAdmin = viewMode === 'admin';

  // Obtener access token
  useEffect(() => {
    async function fetchAccessToken() {
      if (user) {
        try {
          const token = await getAccessToken();
          setAccessToken(token);
        } catch (error) {
          console.error('Error fetching access token:', error);
          setError('Error al autenticar');
        }
      }
    }

    fetchAccessToken();
  }, [user]);

  // Cargar perfil del usuario
  useEffect(() => {
    const loadUserProfile = async () => {
      if (!accessToken) return;

      try {
        const profile = await fetchUserProfile(accessToken);
        setUserProfile(profile);
      } catch (error) {
        console.error('Error loading user profile:', error);
      }
    };

    if (accessToken) loadUserProfile();
  }, [accessToken]);

  // Cargar detalles del grupo y eventos recientes
  useEffect(() => {
    const loadGroupDetails = async () => {
      if (!accessToken) return;

      setIsLoading(true);
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/groups/${groupId}`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error('Error al cargar los detalles del grupo');
        }

        const data = await response.json();
        console.log('📋 Group Details:', data);
        setGroupDetails(data);

        // Cargar eventos recientes del grupo
        const events = await fetchEventRequests(accessToken, { group_id: parseInt(groupId) });
        if (events) {
          // Ordenar: pendientes primero, luego por fecha
          const sorted = [...events].sort((a, b) => {
            const statusOrder = { PENDING: 0, CONFIRMED: 1, CANCELLED: 2 };
            const statusDiff =
              statusOrder[a.status as keyof typeof statusOrder] - statusOrder[b.status as keyof typeof statusOrder];
            if (statusDiff !== 0) return statusDiff;
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          });
          setRecentEvents(sorted.slice(0, 3)); // Solo los 3 más recientes
        }
      } catch (error) {
        console.error('Error loading group details:', error);
        setError('Error al cargar los detalles del grupo');
      } finally {
        setIsLoading(false);
      }
    };

    if (accessToken) loadGroupDetails();
  }, [accessToken, groupId]);

  // Eliminar grupo (representante o admin)
  const handleDeleteGroup = async () => {
    if (!accessToken || !groupDetails) return;

    setIsDeleting(true);

    let result;
    if (isAdmin) {
      result = await softDeleteGroupAsAdmin(accessToken, groupDetails.id); // Ensure using correct ID for admin delete
    } else {
      result = await deleteGroupRequest(accessToken, groupDetails.group_request_id);
    }

    if (result.success) {
      if (isAdmin && onAdminDeleteSuccess) {
        onAdminDeleteSuccess();
      } else {
        // Redirigir al dashboard después de eliminar si es estudiante
        router.push('/Student?view=groups');
      }
    } else {
      console.error('Error deleting group:', result.error);
      setError(result.error || 'Error al eliminar el grupo');
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  if (isLoading || isUserLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !groupDetails) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-red-800 font-semibold">{error || 'Error al cargar el grupo'}</p>
      </div>
    );
  }

  return (
    <>
      {/* 1. Header con información del grupo */}
      <section className="mb-8">
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-800 mb-2">{groupDetails.groupRequest.name}</h1>
              <p className="text-slate-600 mb-4 max-w-2xl">{groupDetails.groupRequest.description}</p>
              <div className="flex items-center gap-4 text-sm text-slate-500">
                <div className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  <span>{groupDetails.reputation}/5.0</span>
                </div>
                <span>•</span>
                <span>Creado el {new Date(groupDetails.createdAt).toLocaleDateString('es-CL')}</span>
              </div>
            </div>
            {isRepresentative && (
              <div className="flex items-center gap-2">
                <Crown className="h-6 w-6 text-amber-500" />
                <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800">
                  Representante
                </span>
              </div>
            )}
            {isAdmin && (
              <div className="flex items-center gap-2">
                <div className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">Vista Admin</div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 2. Estadísticas del Grupo */}
      <section className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-2">
        <StatCard icon={<Star size={20} />} value={groupDetails.reputation} label="Reputación" />
        <StatCard
          icon={<CalendarPlus size={20} />}
          value={groupDetails.eventRequests?.length || 0}
          label="Eventos Creados"
        />
      </section>

      {/* 3. Eventos Recientes */}
      {(isRepresentative || isAdmin) && recentEvents.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-800">Eventos Recientes</h2>
            {!isAdmin && (
              <a
                href={`/Student/Groups/Representative/${groupId}/Events`}
                className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1"
              >
                Ver todos <ArrowRight className="h-4 w-4" />
              </a>
            )}
          </div>
          <div className="space-y-3">
            {recentEvents.map((event) => {
              const statusConfig = EVENT_STATUS_CONFIG[event.status];
              const StatusIcon =
                event.status === 'PENDING' ? Clock : event.status === 'CONFIRMED' ? CheckCircle2 : XCircle;

              return (
                <div
                  key={event.id}
                  className="rounded-lg border border-slate-200 bg-white p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-800 truncate">{event.name}</h3>
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusConfig.bgColor} ${statusConfig.color}`}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {statusConfig.label}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-3 text-sm text-slate-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {new Date(event.day).toLocaleDateString('es-CL', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {getModuleTimeLabel(event.module)}
                        </span>
                        {event.public_space && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3.5 w-3.5" />
                            {event.public_space.name}
                          </span>
                        )}
                      </div>
                    </div>
                    {!isAdmin && (
                      <a
                        href={`/Student/Groups/Representative/${groupId}/Events/${event.id}`}
                        className="flex-shrink-0 p-2 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-colors"
                        title="Ver detalles"
                      >
                        <Eye className="h-5 w-5" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 4. Acciones según el rol */}
      {(isRepresentative || isAdmin) && (
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Acciones Disponibles</h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            {!isAdmin && (
              <ActionCard
                href={`/Student/Groups/Representative/${groupId}/Events`}
                icon={<CalendarPlus className="h-6 w-6 text-blue-500" />}
                title="Gestionar Eventos"
                description="Crea, visualiza y gestiona los eventos de tu grupo."
              />
            )}

            {/* <ActionCard
              icon={<Edit3 className="h-6 w-6 text-blue-500" />}
              title="Editar Grupo"
              description="Modifica la descripción, logo y configuración del grupo."
              disabled={true}
            /> */}

            <ActionCard
              variant="danger"
              icon={<Trash2 className="h-6 w-6 text-red-500" />}
              title="Eliminar Grupo"
              description="Elimina permanentemente el grupo y todos sus datos."
              onClick={() => setShowDeleteConfirm(true)}
            />
          </div>
        </section>
      )}

      {/* 5. Información del Representante */}
      <section>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Representante del Grupo</h2>

        <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="p-6 bg-gradient-to-r from-amber-50 to-white border-b border-slate-200">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Crown className="h-5 w-5 text-amber-500" />
              Representante
            </h3>
          </div>
          <div className="p-6">
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-amber-100 flex items-center justify-center">
                <span className="text-amber-600 font-bold text-2xl">
                  {groupDetails.representative.first_name[0]}
                  {groupDetails.representative.last_name[0]}
                </span>
              </div>
              <div>
                <p className="font-semibold text-gray-800 text-lg">
                  {groupDetails.representative.first_name} {groupDetails.representative.last_name}
                </p>
                <p className="text-sm text-slate-500">{groupDetails.representative.email}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Modal de Confirmación para Eliminar Grupo */}
      {showDeleteConfirm && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => !isDeleting && setShowDeleteConfirm(false)}
        >
          <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-shrink-0 rounded-full bg-red-100 p-2">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Confirmar Eliminación {isAdmin ? '(Admin)' : ''}</h3>
            </div>

            <div className="mb-6">
              <p className="text-slate-600 mb-4">
                ¿Estás seguro de que deseas eliminar el grupo{' '}
                <span className="font-semibold text-gray-800">&quot;{groupDetails.groupRequest.name}&quot;</span>?
              </p>

              {/* Advertencia de eliminación en cascada */}
              <div className="rounded-lg bg-red-50 border border-red-200 p-4">
                <p className="text-sm font-semibold text-red-800 mb-2">Esta acción eliminará permanentemente:</p>
                <ul className="text-sm text-red-700 space-y-1">
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                    La solicitud del grupo
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                    El grupo y toda su información
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                    Todos los eventos del grupo (
                    {recentEvents.length > 0 ? `${groupDetails.eventRequests?.length || 0} eventos` : 'sin eventos'})
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                    Todos los feedbacks asociados
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteGroup}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2 transition-colors"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  'Eliminar Grupo'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
