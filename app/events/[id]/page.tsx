// app/events/[id]/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Calendar, MapPin, Users, Clock, ArrowLeft, Edit, Trash2, Target, AlertCircle } from 'lucide-react';
import EventFeedback from '@/components/dashboard/EventFeedback';
import { useUser } from '@auth0/nextjs-auth0';
import { fetchUserProfile, UserProfileResponse } from '@/lib/user/fetchUserProfile';
import { getAccessToken } from '@auth0/nextjs-auth0';

interface Event {
  id: number;
  name: string;
  goal: string;
  description: string;
  status: 'ACTIVE' | 'CANCELLED' | 'FINISHED';
  day: string;
  module: number;
  group: {
    id: number;
    name: string;
    logo: string | null;
    reputation: string;
  };
  public_space: {
    id: number;
    name: string;
    capacity: number;
    location: string;
    available: string;
  };
  createdAt: string;
  updatedAt: string;
}

interface GroupData {
  id: number;
  group_request_id: number;
  repre_id: number;
  reputation: string;
  is_deleted: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
  groupRequest: {
    id: number;
    user_id: number;
    name: string;
    goal: string;
    description: string;
    logo: string | null;
    status: string;
    is_deleted: boolean;
    createdAt: string;
    updatedAt: string;
    deletedAt: string | null;
    user: {
      id: number;
      first_name: string;
      last_name: string;
      email: string;
      role: string;
    };
  };
  eventRequests: any[];
  representative: {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    role: string;
    is_representative: boolean;
  };
}

export default function EventDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isLoading: authLoading } = useUser();

  const [event, setEvent] = useState<Event | null>(null);
  const [profileData, setProfileData] = useState<UserProfileResponse["user"] | null>(null);
  const [groupData, setGroupData] = useState<GroupData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      router.push('/auth/login');
      return;
    }

    const loadData = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const token = await getAccessToken();
        if (!token) {
          throw new Error('No se pudo obtener el token de autenticación');
        }
        setAccessToken(token);

        // Cargar perfil del usuario
        const profile = await fetchUserProfile(token);
        setProfileData(profile);

        // Cargar evento específico
        const eventResponse = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/api/events/${params.id}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!eventResponse.ok) {
          throw new Error('Evento no encontrado');
        }

        const eventData = await eventResponse.json();
        setEvent(eventData);

        // Cargar información del grupo para verificar representante
        if (eventData?.group?.id) {
          const groupResponse = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/groups/${eventData.group.id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );

          if (groupResponse.ok) {
            const groupInfo = await groupResponse.json();
            setGroupData(groupInfo);
          }
        }
      } catch (err) {
        console.error('Failed to load event:', err);
        setError('No se pudo cargar el evento. Inténtalo de nuevo más tarde.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user, authLoading, params.id, router]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-CL', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getModuleTime = (module: number) => {
    const times: Record<number, string> = {
      1: '08:00 - 09:20',
      2: '09:30 - 10:50',
      3: '11:00 - 12:20',
      4: '12:30 - 13:50',
      5: '14:00 - 15:20',
      6: '15:30 - 16:50',
      7: '17:00 - 18:20',
      8: '18:30 - 19:50',
    };
    return times[module] || 'Horario no especificado';
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: { label: 'Activo', color: 'bg-green-100 text-green-800 border-green-200' },
      CANCELLED: { label: 'Cancelado', color: 'bg-red-100 text-red-800 border-red-200' },
      FINISHED: { label: 'Finalizado', color: 'bg-gray-100 text-gray-800 border-gray-200' },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.ACTIVE;
    return (
      <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const handleDelete = async () => {
    if (!accessToken || !event) return;

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/events/${event.id}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error('Error al eliminar el evento');
      }

      router.push('/events');
    } catch (error) {
      console.error('Error deleting event:', error);
      setError('Error al eliminar el evento');
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };

  const isRepresentative = profileData?.role === 'REPRESENTATIVE';
  const isAdmin = profileData?.role === 'ADMIN';
  const canManageEvent = isRepresentative &&
    groupData?.representative?.id === profileData?.id;

  if (isLoading) {
    return (
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
            <div className="bg-white rounded-lg shadow-md p-8">
              <div className="h-10 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-5/6 mb-8"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !event) {
    return (
      <main className="container mx-auto px-6 py-8">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => router.push('/events')}
            className="flex items-center text-blue-600 hover:text-blue-800 mb-6 font-medium"
          >
            <ArrowLeft size={20} className="mr-2" />
            Volver a eventos
          </button>
          <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
            <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
            <p className="text-red-700 text-lg">{error || 'Evento no encontrado'}</p>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-6 py-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => router.push('/events')}
          className="flex items-center text-blue-600 hover:text-blue-800 mb-6 font-medium transition-colors"
        >
          <ArrowLeft size={20} className="mr-2" />
          Volver a eventos
        </button>

        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-8">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h1 className="text-4xl font-bold mb-2">{event.name}</h1>
                <div className="flex items-center gap-3">
                  <Users size={20} />
                  <span className="text-lg">Organizado por {event.group.name}</span>
                  <div className="flex items-center bg-white/20 px-3 py-1 rounded-full backdrop-blur-sm border border-white/30" title="Reputación del grupo">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="#FCD34D" stroke="#FCD34D" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                    <span className="font-bold">{event.group.reputation}</span>
                  </div>
                </div>
              </div>
              {getStatusBadge(event.status)}
            </div>
          </div>

          {/* Content */}
          <div className="p-8">
            {/* Objetivo */}
            <div className="mb-8">
              <div className="flex items-center gap-2 mb-3">
                <Target size={24} className="text-blue-600" />
                <h2 className="text-2xl font-bold text-gray-900">Objetivo</h2>
              </div>
              <p className="text-lg text-gray-700 bg-blue-50 p-4 rounded-lg">{event.goal}</p>
            </div>

            {/* Descripción */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Descripción</h2>
              <p className="text-gray-700 leading-relaxed">{event.description}</p>
            </div>

            {/* Detalles */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4 text-lg">Detalles del Evento</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <Calendar size={20} className="mr-3 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-500">Fecha</p>
                      <p className="font-medium text-gray-900">{formatDate(event.day)}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Clock size={20} className="mr-3 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-500">Horario</p>
                      <p className="font-medium text-gray-900">
                        Módulo {event.module} ({getModuleTime(event.module)})
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-4 text-lg">Ubicación</h3>
                <div className="space-y-4">
                  <div className="flex items-start">
                    <MapPin size={20} className="mr-3 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-500">Espacio</p>
                      <p className="font-medium text-gray-900">{event.public_space.name}</p>
                      <p className="text-gray-600">{event.public_space.location}</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <Users size={20} className="mr-3 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-sm text-gray-500">Capacidad</p>
                      <p className="font-medium text-gray-900">
                        {event.public_space.capacity} personas
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Información adicional */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8">
              <h3 className="font-semibold text-gray-900 mb-3">Información Adicional</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-500">Creado:</span>
                  <span className="ml-2 text-gray-900">{formatDateTime(event.createdAt)}</span>
                </div>
                <div>
                  <span className="text-gray-500">Última actualización:</span>
                  <span className="ml-2 text-gray-900">{formatDateTime(event.updatedAt)}</span>
                </div>

              </div>
            </div>

            {/* Acciones para representantes */}
            {canManageEvent && (
              <div className="flex flex-wrap gap-4 pt-6 border-t">
                <button
                  onClick={() => router.push(`/events/${event.id}/edit`)}
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
                >
                  <Edit size={20} />
                  Editar Evento
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(true)}
                  className="flex items-center gap-2 px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-semibold"
                >
                  <Trash2 size={20} />
                  Eliminar Evento
                </button>
              </div>
            )}

            {/* Event Feedback Section */}
            {profileData && (
              <EventFeedback
                eventId={event.id}
                isAdmin={isAdmin}
                isGroupRep={canManageEvent} // Since canManageEvent is true only if they are the rep of THIS group
                userId={profileData.id}
                accessToken={accessToken}
              />
            )}
          </div>
        </div>
      </div>

      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-4">Confirmar Eliminación</h3>
            <p className="text-gray-700 mb-6">
              ¿Estás seguro de que deseas eliminar el evento{' '}
              <strong className="text-gray-900">{event.name}</strong>? Esta acción no se puede
              deshacer.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isDeleting ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}