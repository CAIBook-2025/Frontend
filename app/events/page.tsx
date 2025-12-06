
// app/events/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Clock, Info } from 'lucide-react';
import { useUser } from '@auth0/nextjs-auth0';
import { fetchUserProfile, UserProfileResponse } from '@/lib/user/fetchUserProfile';
import { getAccessToken } from '@auth0/nextjs-auth0';
import { useRouter } from 'next/navigation';

interface Event {
  id: number;
  name: string;
  goal: string;
  description: string;
  status: 'confirmed' | 'CANCELLED' | 'FINISHED';
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

export default function EventsPage() {
  const { user, isLoading: authLoading } = useUser();
  const router = useRouter();

  const [events, setEvents] = useState<Event[]>([]);
  const [profileData, setProfileData] = useState<UserProfileResponse["user"] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<'all' | 'confirmed' | 'cancelled' | 'finished'>('all');

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setIsLoading(false);
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

        // Cargar perfil del usuario
        const profile = await fetchUserProfile(token);
        setProfileData(profile);

        // Cargar eventos
        const eventsResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!eventsResponse.ok) {
          throw new Error('Error al cargar los eventos');
        }

        const eventsData = await eventsResponse.json();
        setEvents(Array.isArray(eventsData) ? eventsData : []);
      } catch (err) {
        console.error('Failed to load data:', err);
        setError('No se pudieron cargar los eventos. Inténtalo de nuevo más tarde.');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user, authLoading]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-CL', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
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
      CONFIRMED: { label: 'Activo', color: 'bg-green-100 text-green-800' },
      CANCELLED: { label: 'Cancelado', color: 'bg-red-100 text-red-800' },
      FINISHED: { label: 'Finalizado', color: 'bg-gray-100 text-gray-800' },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.CONFIRMED;
    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${config.color}`}>
        {config.label}
      </span>
    );
  };

  const filteredEvents = events.filter((event) => {
    if (filterStatus === 'all') return true;
    return event.status.toLowerCase() === filterStatus;
  });

  const isRepresentative = profileData?.role === 'REPRESENTATIVE';

  if (isLoading) {
    return (
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Eventos</h1>
          <p className="text-slate-600">Cargando eventos...</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-md p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-full mb-2"></div>
              <div className="h-4 bg-gray-200 rounded w-5/6"></div>
            </div>
          ))}
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="container mx-auto px-6 py-8">
        <div className="text-center p-8">
          <p className="text-red-500 text-lg">{error}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="container mx-auto px-6 py-8">
      <div className="mb-8 border-b pb-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Eventos</h1>
            <p className="text-slate-600">
              Descubre y participa en los eventos de tu universidad
            </p>
          </div>
          {isRepresentative && (
            <button
              onClick={() => router.push('/events/create')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
            >
              Crear Evento
            </button>
          )}
        </div>
      </div>

      {/* Filtros */}
      <div className="mb-6 flex flex-wrap gap-3">
        <button
          onClick={() => setFilterStatus('all')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${filterStatus === 'all'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
        >
          Todos
        </button>
        <button
          onClick={() => setFilterStatus('confirmed')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${filterStatus === 'confirmed'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
        >
          Activos
        </button>
        <button
          onClick={() => setFilterStatus('finished')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${filterStatus === 'finished'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
        >
          Finalizados
        </button>
        <button
          onClick={() => setFilterStatus('cancelled')}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${filterStatus === 'cancelled'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
        >
          Cancelados
        </button>
      </div>

      {/* Lista de eventos */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <Info size={48} className="mx-auto text-gray-400 mb-4" />
          <p className="text-gray-600 text-lg">No hay eventos disponibles</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <div
              key={event.id}
              onClick={() => router.push(`/events/${event.id}`)}
              className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow cursor-pointer overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900 flex-1 mr-2">
                    {event.name}
                  </h3>
                  {getStatusBadge(event.status)}
                </div>

                <p className="text-gray-600 mb-4 line-clamp-2">{event.description}</p>

                <div className="space-y-2">
                  <div className="flex items-center text-sm text-gray-700">
                    <Users size={16} className="mr-2 text-blue-600" />
                    <span className="font-medium mr-3">{event.group.name}</span>
                    {/* Event/Group Reputation Display */}
                    <div className="flex items-center text-yellow-500">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-star mr-1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
                      <span className="text-xs font-semibold">{event.group.reputation || 'N/A'}</span>
                    </div>
                  </div>

                  <div className="flex items-center text-sm text-gray-700">
                    <Calendar size={16} className="mr-2 text-blue-600" />
                    <span>{formatDate(event.day)}</span>
                  </div>

                  <div className="flex items-center text-sm text-gray-700">
                    <Clock size={16} className="mr-2 text-blue-600" />
                    <span>Módulo {event.module} - {getModuleTime(event.module)}</span>
                  </div>

                  <div className="flex items-center text-sm text-gray-700">
                    <MapPin size={16} className="mr-2 text-blue-600" />
                    <span>
                      {event.public_space.name} - {event.public_space.location}
                    </span>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Capacidad</span>
                    <span className="font-semibold text-gray-900">
                      {event.public_space.capacity} personas
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
