// app/Student/Groups/Representative/[groupId]/Events/page.tsx
'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getAccessToken, useUser } from '@auth0/nextjs-auth0';
import {
  ArrowLeft,
  Plus,
  Calendar,
  Clock,
  MapPin,
  Users,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Filter,
  Eye,
} from 'lucide-react';
import { fetchEventRequests } from '@/lib/events/fetchEventRequests';
import { EventRequest, EventRequestStatus, EVENT_STATUS_CONFIG, getModuleTimeLabel } from '@/types/eventRequest';

interface EventsPageProps {
  params: Promise<{ groupId: string }>;
}

export default function GroupEventsPage({ params }: EventsPageProps) {
  const { groupId } = use(params);
  const router = useRouter();
  const { user, isLoading: authLoading } = useUser();

  const [events, setEvents] = useState<EventRequest[]>([]);
  const [filteredEvents, setFilteredEvents] = useState<EventRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<EventRequestStatus | 'ALL'>('ALL');
  const [groupName, setGroupName] = useState<string>('');

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

  // Cargar eventos del grupo
  useEffect(() => {
    async function loadEvents() {
      if (!accessToken) return;

      setIsLoading(true);
      setError(null);

      try {
        // Cargar info del grupo
        const groupResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/groups/${groupId}`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        if (groupResponse.ok) {
          const groupData = await groupResponse.json();
          setGroupName(groupData.groupRequest?.name || 'Grupo');
        }

        // Cargar eventos del grupo
        const eventsData = await fetchEventRequests(accessToken, {
          group_id: parseInt(groupId),
        });

        if (eventsData) {
          // Ordenar: pendientes primero, luego por fecha de creación
          const sorted = [...eventsData].sort((a, b) => {
            const statusOrder = { PENDING: 0, CONFIRMED: 1, CANCELLED: 2 };
            const statusDiff =
              statusOrder[a.status as keyof typeof statusOrder] - statusOrder[b.status as keyof typeof statusOrder];
            if (statusDiff !== 0) return statusDiff;
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          });
          setEvents(sorted);
          setFilteredEvents(sorted);
        }
      } catch (err) {
        console.error('Error loading events:', err);
        setError('Error al cargar los eventos');
      } finally {
        setIsLoading(false);
      }
    }

    if (accessToken) loadEvents();
  }, [accessToken, groupId]);

  // Filtrar eventos por estado
  useEffect(() => {
    if (statusFilter === 'ALL') {
      setFilteredEvents(events);
    } else {
      setFilteredEvents(events.filter((e) => e.status === statusFilter));
    }
  }, [statusFilter, events]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CL', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusIcon = (status: EventRequestStatus) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4" />;
      case 'CONFIRMED':
        return <CheckCircle2 className="h-4 w-4" />;
      case 'CANCELLED':
        return <XCircle className="h-4 w-4" />;
    }
  };

  const pendingCount = events.filter((e) => e.status === 'PENDING').length;
  const confirmedCount = events.filter((e) => e.status === 'CONFIRMED').length;
  const cancelledCount = events.filter((e) => e.status === 'CANCELLED').length;

  if (authLoading || isLoading) {
    return (
      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <p className="text-red-800 font-semibold">{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-4 py-8 md:py-12">
      {/* Navegación */}
      <section className="mb-6">
        <Link
          href={`/Student/Groups/Representative/${groupId}`}
          className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 font-medium"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver al grupo
        </Link>
      </section>

      {/* Header */}
      <section className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">Eventos del Grupo</h1>
            <p className="text-slate-600">{groupName}</p>
          </div>
          <Link
            href={`/Student/Groups/Representative/${groupId}/Events/Create`}
            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700 transition-colors"
          >
            <Plus className="h-5 w-5" />
            Solicitar Evento
          </Link>
        </div>
      </section>

      {/* Estadísticas rápidas */}
      <section className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 flex items-center gap-4">
          <div className="rounded-full bg-amber-100 p-3">
            <Clock className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-amber-800">{pendingCount}</p>
            <p className="text-sm text-amber-600">Pendientes</p>
          </div>
        </div>
        <div className="rounded-lg bg-green-50 border border-green-200 p-4 flex items-center gap-4">
          <div className="rounded-full bg-green-100 p-3">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-green-800">{confirmedCount}</p>
            <p className="text-sm text-green-600">Confirmados</p>
          </div>
        </div>
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 flex items-center gap-4">
          <div className="rounded-full bg-red-100 p-3">
            <XCircle className="h-6 w-6 text-red-600" />
          </div>
          <div>
            <p className="text-2xl font-bold text-red-800">{cancelledCount}</p>
            <p className="text-sm text-red-600">Cancelados</p>
          </div>
        </div>
      </section>

      {/* Filtros */}
      <section className="mb-6">
        <div className="flex items-center gap-2 flex-wrap">
          <Filter className="h-5 w-5 text-slate-500" />
          <span className="text-sm text-slate-600 mr-2">Filtrar:</span>
          {(['ALL', 'PENDING', 'CONFIRMED', 'CANCELLED'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                statusFilter === status ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {status === 'ALL' ? 'Todos' : EVENT_STATUS_CONFIG[status].label}
            </button>
          ))}
        </div>
      </section>

      {/* Lista de eventos */}
      <section>
        {filteredEvents.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center">
            <Calendar className="mx-auto h-16 w-16 text-slate-300 mb-4" />
            <h3 className="text-xl font-semibold text-slate-700 mb-2">
              {events.length === 0 ? 'No hay eventos aún' : 'No hay eventos con este filtro'}
            </h3>
            <p className="text-slate-500 mb-6">
              {events.length === 0
                ? 'Crea tu primera solicitud de evento para el grupo'
                : 'Prueba con otro filtro para ver más eventos'}
            </p>
            {events.length === 0 && (
              <Link
                href={`/Student/Groups/Representative/${groupId}/Events/Create`}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white font-semibold hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-5 w-5" />
                Crear Primer Evento
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEvents.map((event) => {
              const statusConfig = EVENT_STATUS_CONFIG[event.status];
              return (
                <div
                  key={event.id}
                  className="rounded-xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow overflow-hidden"
                >
                  <div className="p-6">
                    <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                      {/* Info principal */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-bold text-gray-800">{event.name}</h3>
                          <span
                            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${statusConfig.bgColor} ${statusConfig.color} ${statusConfig.borderColor} border`}
                          >
                            {getStatusIcon(event.status)}
                            {statusConfig.label}
                          </span>
                        </div>
                        <p className="text-slate-600 mb-4 line-clamp-2">{event.goal}</p>

                        {/* Detalles */}
                        <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="h-4 w-4 text-blue-500" />
                            <span>{formatDate(event.day)}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <Clock className="h-4 w-4 text-blue-500" />
                            <span>
                              Módulo {event.module} ({getModuleTimeLabel(event.module)})
                            </span>
                          </div>
                          {event.public_space && (
                            <>
                              <div className="flex items-center gap-1.5">
                                <MapPin className="h-4 w-4 text-blue-500" />
                                <span>{event.public_space.name}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Users className="h-4 w-4 text-blue-500" />
                                <span>Capacidad: {event.public_space.capacity}</span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>

                      {/* Acciones */}
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/Student/Groups/Representative/${groupId}/Events/${event.id}`}
                          className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-4 py-2 text-slate-700 font-medium hover:bg-slate-200 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                          Ver detalles
                        </Link>
                      </div>
                    </div>
                  </div>

                  {/* Barra de estado visual */}
                  <div
                    className={`h-1 ${
                      event.status === 'PENDING'
                        ? 'bg-amber-400'
                        : event.status === 'CONFIRMED'
                          ? 'bg-green-500'
                          : 'bg-red-400'
                    }`}
                  />
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
}
