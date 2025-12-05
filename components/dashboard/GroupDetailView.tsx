// components/dashboard/GroupDetailView.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAccessToken, useUser } from '@auth0/nextjs-auth0';
import {
  Settings,
  Users,
  Crown,
  Shield,
  CalendarPlus,
  Trash2,
  ArrowRight,
  Star,
  Loader2,
  Edit3,
  UserPlus,
  AlertTriangle,
  LogOut,
  UserCheck,
} from 'lucide-react';

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

interface Moderator {
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
  moderators_ids: number[];
  createdAt: string;
  updatedAt: string;
  groupRequest: GroupRequest;
  representative: Representative;
  moderators: Moderator[];
  eventRequests?: any[];
}

interface GroupDetailViewProps {
  groupId: string;
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
  variant?: 'default' | 'danger' | 'warning';
  onClick?: () => void;
  disabled?: boolean;
}) => {
  const baseClasses = 'group block rounded-xl border p-6 shadow-md transition-all duration-300';
  const variantClasses =
    variant === 'danger'
      ? 'border-red-200 bg-red-50 hover:border-red-500 hover:shadow-lg'
      : variant === 'warning'
      ? 'border-orange-200 bg-orange-50 hover:border-orange-500 hover:shadow-lg'
      : 'border-slate-200 bg-white hover:border-blue-500 hover:shadow-lg';

  const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : '';

  const content = (
    <div className="flex items-start justify-between">
      <div>
        <div
          className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full ${
            variant === 'danger'
              ? 'bg-red-100'
              : variant === 'warning'
              ? 'bg-orange-100'
              : 'bg-blue-100'
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
          variant === 'danger'
            ? 'group-hover:text-red-500'
            : variant === 'warning'
            ? 'group-hover:text-orange-500'
            : 'group-hover:text-blue-500'
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
export const GroupDetailView = ({ groupId }: GroupDetailViewProps) => {
  const { user, isLoading: isUserLoading } = useUser();
  const router = useRouter();
  const [groupDetails, setGroupDetails] = useState<GroupDetails | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  // Determinar el rol del usuario
  const isRepresentative = groupDetails?.repre_id === user?.id;
  const isModerator = groupDetails?.moderators_ids.includes(user?.id);
  const userRole = isRepresentative ? 'Representante' : isModerator ? 'Moderador' : 'Miembro';

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

  // Cargar detalles del grupo
  useEffect(() => {
    const loadGroupDetails = async () => {
      if (!accessToken) return;

      setIsLoading(true);
      try {
        console.log('Fetching group details for groupId:', groupId);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/groups/${groupId}`, {
          headers: {
            method: 'GET',
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error('Error al cargar los detalles del grupo');
        }

        const data = await response.json();
        setGroupDetails(data);
      } catch (error) {
        console.error('Error loading group details:', error);
        setError('Error al cargar los detalles del grupo');
      } finally {
        setIsLoading(false);
      }
    };

    if (accessToken) loadGroupDetails();
  }, [accessToken, groupId]);

  // Eliminar grupo (solo representante)
  const handleDeleteGroup = async () => {
    if (!accessToken) return;

    setIsDeleting(true);
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/groups/${groupId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al eliminar el grupo');
      }

      // Redirigir al dashboard después de eliminar
      router.push('/Student/Dashboard');
    } catch (error) {
      console.error('Error deleting group:', error);
      setError('Error al eliminar el grupo');
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  // Salir del grupo (moderador)
  const handleLeaveGroup = async () => {
    // TODO: Implementar cuando el endpoint esté disponible
    console.log('Salir del grupo - Endpoint pendiente');
    setShowLeaveConfirm(false);
  };

  const getMemberCount = (): number => {
    if (!groupDetails) return 0;
    return 1 + groupDetails.moderators.length; // 1 representante + N moderadores
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
            <div className="flex items-center gap-2">
              {isRepresentative ? (
                <>
                  <Crown className="h-6 w-6 text-amber-500" />
                  <span className="rounded-full bg-amber-100 px-3 py-1 text-sm font-medium text-amber-800">
                    Representante
                  </span>
                </>
              ) : isModerator ? (
                <>
                  <Shield className="h-6 w-6 text-blue-500" />
                  <span className="rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800">
                    Moderador
                  </span>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      {/* 2. Estadísticas del Grupo */}
      <section className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard icon={<Users size={20} />} value={getMemberCount()} label="Miembros Totales" />
        <StatCard icon={<Shield size={20} />} value={groupDetails.moderators.length} label="Moderadores" />
        <StatCard icon={<Star size={20} />} value={groupDetails.reputation} label="Reputación" />
      </section>

      {/* 3. Acciones según el rol */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Acciones Disponibles</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {/* Acciones para todos (Moderadores y Representantes) */}
          <ActionCard
            icon={<CalendarPlus className="h-6 w-6 text-blue-500" />}
            title="Crear Evento"
            description="Organiza y reserva espacios para eventos del grupo."
            disabled={true}
          />

          <ActionCard
            icon={<UserPlus className="h-6 w-6 text-blue-500" />}
            title="Agregar Moderador"
            description="Convierte a un miembro en moderador del grupo."
            disabled={true}
          />

          {/* Acciones exclusivas del Representante */}
          {isRepresentative && (
            <>
              <ActionCard
                icon={<Edit3 className="h-6 w-6 text-blue-500" />}
                title="Editar Grupo"
                description="Modifica la descripción, logo y configuración del grupo."
                disabled={true}
              />

              <ActionCard
                icon={<Crown className="h-6 w-6 text-blue-500" />}
                title="Transferir Liderazgo"
                description="Cede la posición de representante a un moderador."
                disabled={true}
              />

              <ActionCard
                variant="danger"
                icon={<Trash2 className="h-6 w-6 text-red-500" />}
                title="Eliminar Grupo"
                description="Elimina permanentemente el grupo y todos sus datos."
                onClick={() => setShowDeleteConfirm(true)}
              />
            </>
          )}

          {/* Acción para Moderadores (no Representantes) */}
          {isModerator && !isRepresentative && (
            <ActionCard
              variant="warning"
              icon={<LogOut className="h-6 w-6 text-orange-500" />}
              title="Salir del Grupo"
              description="Renuncia a tu rol de moderador en este grupo."
              onClick={() => setShowLeaveConfirm(true)}
            />
          )}
        </div>
      </section>

      {/* 4. Información del Equipo */}
      <section>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Equipo de Gestión</h2>

        {/* Representante */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm mb-4">
          <div className="p-6 bg-gradient-to-r from-amber-50 to-white border-b border-slate-200">
            <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
              <Crown className="h-5 w-5 text-amber-500" />
              Representante
            </h3>
          </div>
          <div className="p-4">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-amber-100 flex items-center justify-center">
                <span className="text-amber-600 font-bold text-lg">
                  {groupDetails.representative.first_name[0]}
                  {groupDetails.representative.last_name[0]}
                </span>
              </div>
              <div>
                <p className="font-semibold text-gray-800">
                  {groupDetails.representative.first_name} {groupDetails.representative.last_name}
                </p>
                <p className="text-sm text-slate-500">{groupDetails.representative.email}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Moderadores */}
        {groupDetails.moderators.length > 0 && (
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="p-6 bg-gradient-to-r from-blue-50 to-white border-b border-slate-200">
              <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-500" />
                Moderadores ({groupDetails.moderators.length})
              </h3>
            </div>
            <ul className="divide-y divide-slate-200">
              {groupDetails.moderators.map((moderator) => (
                <li key={moderator.id} className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center">
                      <span className="text-blue-600 font-bold text-lg">
                        {moderator.first_name[0]}
                        {moderator.last_name[0]}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-800">
                        {moderator.first_name} {moderator.last_name}
                      </p>
                      <p className="text-sm text-slate-500">{moderator.email}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </section>

      {/* Modal de Confirmación para Eliminar Grupo */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-red-500" />
              <h3 className="text-lg font-bold text-gray-800">Confirmar Eliminación</h3>
            </div>
            <p className="text-slate-600 mb-6">
              ¿Estás seguro de que deseas eliminar el grupo &quot;{groupDetails.groupRequest.name}&quot;? Esta acción
              no se puede deshacer y se perderán todos los datos del grupo.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDeleteGroup}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 flex items-center gap-2"
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

      {/* Modal de Confirmación para Salir del Grupo */}
      {showLeaveConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <div className="flex items-center gap-3 mb-4">
              <AlertTriangle className="h-6 w-6 text-orange-500" />
              <h3 className="text-lg font-bold text-gray-800">Confirmar Salida</h3>
            </div>
            <p className="text-slate-600 mb-6">
              ¿Estás seguro de que deseas salir del grupo &quot;{groupDetails.groupRequest.name}&quot;? Perderás tu rol
              de moderador.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowLeaveConfirm(false)}
                disabled={isLeaving}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleLeaveGroup}
                disabled={isLeaving}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 flex items-center gap-2"
              >
                {isLeaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saliendo...
                  </>
                ) : (
                  'Salir del Grupo'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};