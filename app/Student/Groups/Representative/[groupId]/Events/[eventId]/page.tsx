// app/Student/Groups/Representative/[groupId]/Events/[eventId]/page.tsx
'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getAccessToken, useUser } from '@auth0/nextjs-auth0';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Edit3,
  Trash2,
  Target,
  FileText,
  AlertTriangle,
  Info,
} from 'lucide-react';
import { fetchEventById } from '@/lib/events/fetchEventById';
import { deleteEventRequest } from '@/lib/events/deleteEventRequest';
import { EventRequestDetail, EventRequestStatus, EVENT_STATUS_CONFIG, getModuleTimeLabel } from '@/types/eventRequest';

interface EventDetailPageProps {
  params: Promise<{ groupId: string; eventId: string }>;
}

export default function EventDetailPage({ params }: EventDetailPageProps) {
  const { groupId, eventId } = use(params);
  const router = useRouter();
  const { user, isLoading: authLoading } = useUser();

  const [event, setEvent] = useState<EventRequestDetail | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Obtener access token
  useEffect(() => {
    async function fetchToken() {
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
    fetchToken();
  }, [user]);

  // Cargar evento
  useEffect(() => {
    async function loadEvent() {
      if (!accessToken) return;

      setIsLoading(true);
      setError(null);

      try {
        const eventData = await fetchEventById(accessToken, parseInt(eventId));
        if (eventData) {
          setEvent(eventData);
        } else {
          setError('Evento no encontrado');
        }
      } catch (err) {
        console.error('Error loading event:', err);
        setError('Error al cargar el evento');
      } finally {
        setIsLoading(false);
      }
    }

    if (accessToken) loadEvent();
  }, [accessToken, eventId]);

  const handleDelete = async () => {
    if (!accessToken || !event) return;

    setIsDeleting(true);
    setDeleteError(null);

    const result = await deleteEventRequest(accessToken, event.id);

    if (result.success) {
      router.push(`/Student/Groups/Representative/${groupId}/Events?deleted=true`);
    } else {
      setDeleteError(result.error || 'Error al eliminar');
      setIsDeleting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CL', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('es-CL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusIcon = (status: EventRequestStatus) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-6 w-6" />;
      case 'CONFIRMED':
        return <CheckCircle2 className="h-6 w-6" />;
      case 'CANCELLED':
        return <XCircle className="h-6 w-6" />;
    }
  };

  const getStatusMessage = (status: EventRequestStatus) => {
    switch (status) {
      case 'PENDING':
        return 'Tu solicitud está siendo revisada por un administrador. Te notificaremos cuando haya una actualización.';
      case 'CONFIRMED':
        return '¡Tu evento ha sido aprobado! El espacio está reservado para la fecha y horario indicados.';
      case 'CANCELLED':
        return 'Esta solicitud ha sido cancelada. Puedes crear una nueva solicitud si lo deseas.';
    }
  };

  // Loading
  if (authLoading || isLoading) {
    return (
      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </main>
    );
  }

  // Error
  if (error || !event) {
    return (
      <main className="container mx-auto px-4 py-8 md:py-12">
        <section className="mb-6">
          <Link
            href={`/Student/Groups/Representative/${groupId}/Events`}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a eventos
          </Link>
        </section>
        <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <p className="text-red-800 font-semibold text-lg">{error || 'Evento no encontrado'}</p>
        </div>
      </main>
    );
  }

  const statusConfig = EVENT_STATUS_CONFIG[event.status];
  const canEdit = event.status === 'PENDING';
  const canDelete = event.status !== 'CONFIRMED';

  return (
    <main className="container mx-auto px-4 py-8 md:py-12">
      {/* Navegación */}
      <section className="mb-6">
        <Link
          href={`/Student/Groups/Representative/${groupId}/Events`}
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver a eventos
        </Link>
      </section>

      {/* Header con estado */}
      <section className="mb-8">
        <div className="rounded-xl overflow-hidden shadow-lg">
          {/* Banner de estado */}
          <div
            className={`p-6 ${
              event.status === 'PENDING'
                ? 'bg-gradient-to-r from-amber-500 to-amber-600'
                : event.status === 'CONFIRMED'
                  ? 'bg-gradient-to-r from-green-500 to-green-600'
                  : 'bg-gradient-to-r from-red-500 to-red-600'
            } text-white`}
          >
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-full">{getStatusIcon(event.status)}</div>
                <div>
                  <span className="text-sm font-medium opacity-90">Estado de la solicitud</span>
                  <h2 className="text-2xl font-bold">{statusConfig.label}</h2>
                </div>
              </div>
              {event.status === 'PENDING' && (
                <div className="flex items-center gap-2 bg-white/10 px-4 py-2 rounded-full">
                  <Clock className="h-4 w-4" />
                  <span className="text-sm">En revisión</span>
                </div>
              )}
            </div>
          </div>

          {/* Mensaje de estado */}
          <div className="bg-white p-4 border-b border-slate-200">
            <div className="flex gap-3">
              <Info className="h-5 w-5 text-slate-500 flex-shrink-0 mt-0.5" />
              <p className="text-slate-600 text-sm">{getStatusMessage(event.status)}</p>
            </div>
          </div>

          {/* Contenido principal */}
          <div className="bg-white p-6 md:p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{event.name}</h1>
            <p className="text-slate-600 mb-6">
              Organizado por <span className="font-medium">{event.group.name}</span>
            </p>

            {/* Grid de información */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Objetivo */}
              <div className="rounded-xl bg-blue-50 border border-blue-100 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Target className="h-5 w-5 text-blue-600" />
                  <h3 className="font-semibold text-gray-800">Objetivo</h3>
                </div>
                <p className="text-slate-700">{event.goal}</p>
              </div>

              {/* Descripción */}
              <div className="rounded-xl bg-slate-50 border border-slate-100 p-5">
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="h-5 w-5 text-slate-600" />
                  <h3 className="font-semibold text-gray-800">Descripción</h3>
                </div>
                <p className="text-slate-700 text-sm">{event.description || 'Sin descripción'}</p>
              </div>
            </div>

            {/* Detalles del evento */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {/* Fecha y hora */}
              <div className="rounded-xl border border-slate-200 p-5">
                <h3 className="font-semibold text-gray-800 mb-4">Fecha y Horario</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Calendar className="h-5 w-5 text-blue-500" />
                    <span className="text-slate-700">{formatDate(event.day)}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Clock className="h-5 w-5 text-blue-500" />
                    <span className="text-slate-700">
                      Módulo {event.module} ({getModuleTimeLabel(event.module)})
                    </span>
                  </div>
                </div>
              </div>

              {/* Ubicación */}
              {event.public_space && (
                <div className="rounded-xl border border-slate-200 p-5">
                  <h3 className="font-semibold text-gray-800 mb-4">Ubicación</h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <MapPin className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="font-medium text-gray-800">{event.public_space.name}</p>
                        <p className="text-sm text-slate-600">{event.public_space.location}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Users className="h-5 w-5 text-blue-500" />
                      <span className="text-slate-700">Capacidad: {event.public_space.capacity} personas</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Timeline de estado */}
            <div className="rounded-xl bg-slate-50 border border-slate-200 p-5 mb-8">
              <h3 className="font-semibold text-gray-800 mb-4">Historial</h3>
              <div className="space-y-4">
                <div className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <div className="w-0.5 h-full bg-slate-200"></div>
                  </div>
                  <div className="pb-4">
                    <p className="font-medium text-gray-800">Solicitud creada</p>
                    <p className="text-sm text-slate-500">{formatDateTime(event.createdAt)}</p>
                  </div>
                </div>
                {event.status !== 'PENDING' && (
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          event.status === 'CONFIRMED' ? 'bg-green-500' : 'bg-red-500'
                        }`}
                      ></div>
                    </div>
                    <div>
                      <p className="font-medium text-gray-800">
                        {event.status === 'CONFIRMED' ? 'Evento confirmado' : 'Evento cancelado'}
                      </p>
                      <p className="text-sm text-slate-500">{formatDateTime(event.updatedAt)}</p>
                    </div>
                  </div>
                )}
                {event.status === 'PENDING' && (
                  <div className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-amber-400 animate-pulse"></div>
                    </div>
                    <div>
                      <p className="font-medium text-amber-700">Esperando revisión...</p>
                      <p className="text-sm text-slate-500">En proceso</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Acciones */}
            {(canEdit || canDelete) && (
              <div className="flex flex-wrap gap-3 pt-6 border-t border-slate-200">
                {canEdit && (
                  <Link
                    href={`/Student/Groups/Representative/${groupId}/Events/${eventId}/Edit`}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-white font-medium hover:bg-blue-700 transition-colors"
                  >
                    <Edit3 className="h-4 w-4" />
                    Editar Evento
                  </Link>
                )}
                {canDelete && (
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-white font-medium hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="h-4 w-4" />
                    Eliminar Solicitud
                  </button>
                )}
              </div>
            )}

            {/* Mensaje si no se puede editar/eliminar */}
            {event.status === 'CONFIRMED' && (
              <div className="mt-6 p-4 rounded-lg bg-amber-50 border border-amber-200">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0" />
                  <p className="text-sm text-amber-800">
                    Los eventos confirmados no pueden ser editados ni eliminados. Si necesitas hacer cambios, contacta a
                    un administrador.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-red-100 rounded-full">
                <AlertTriangle className="h-6 w-6 text-red-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-800">Eliminar Solicitud</h3>
            </div>
            <p className="text-slate-600 mb-6">
              ¿Estás seguro de que deseas eliminar la solicitud del evento <strong>&quot;{event.name}&quot;</strong>?
              Esta acción no se puede deshacer.
            </p>

            {deleteError && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                {deleteError}
              </div>
            )}

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                disabled={isDeleting}
                className="px-4 py-2 border border-slate-300 rounded-lg text-slate-700 hover:bg-slate-50 font-medium disabled:opacity-50"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium disabled:opacity-50 flex items-center gap-2"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  'Eliminar'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
