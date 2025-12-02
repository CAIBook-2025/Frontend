'use client';

import { useState } from 'react';
import { EventRequest } from '@/types/eventRequest';
import { getAccessToken } from '@auth0/nextjs-auth0/client';
import { resolveAccessToken } from '@/app/Admin/Room/room-utils';
import { EventsFilterSearch } from './events-filter-search';

interface EventHistoryTableProps {
  events: EventRequest[];
  onUpdate?: () => void;
}

export const EventHistoryTable = ({ events, onUpdate }: EventHistoryTableProps) => {
  const [loadingId, setLoadingId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  const getStatusBadge = (status: string) => {
    const statusStyles: Record<string, string> = {
      CONFIRMED: 'bg-green-500 text-white',
      CANCELLED: 'bg-red-500 text-white',
      PENDING: 'bg-yellow-500 text-white',
    };

    const statusLabels: Record<string, string> = {
      CONFIRMED: 'Confirmado',
      CANCELLED: 'Cancelado',
      PENDING: 'Pendiente',
    };

    const style = statusStyles[status] || 'bg-gray-500 text-white';
    const label = statusLabels[status] || status;

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${style}`}>
        {label}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toISOString().split('T')[0];
  };

  const updateStatus = async (id: number, status: 'CONFIRMED' | 'CANCELLED') => {
    try {
      setLoadingId(id);

      const tokenResponse = await getAccessToken();
      const accessToken = resolveAccessToken(tokenResponse);
      if (!accessToken) return console.warn('Token no disponible');

      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({ status }),
      });

      onUpdate?.();
    } catch (error) {
      console.error('Error actualizando solicitud:', error);
    } finally {
      setLoadingId(null);
    }
  };

  const filteredEvents = events.filter((event) => {
    // Filter by status
    if (statusFilter !== 'all' && event.status !== statusFilter) {
      return false;
    }

    // Filter by date
    if (dateFilter !== 'all') {
      const eventDate = new Date(event.day);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (dateFilter === 'today') {
        const eventDateString = eventDate.toISOString().split('T')[0];
        const todayString = today.toISOString().split('T')[0];
        if (eventDateString !== todayString) return false;
      } else if (dateFilter === 'week') {
        const startOfWeek = new Date(today);
        startOfWeek.setDate(today.getDate() - today.getDay());
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 6);
        if (eventDate < startOfWeek || eventDate > endOfWeek) return false;
      } else if (dateFilter === 'month') {
        if (
          eventDate.getMonth() !== today.getMonth() ||
          eventDate.getFullYear() !== today.getFullYear()
        ) {
          return false;
        }
      }
    }

    // Filter by search term
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchesName = event.name.toLowerCase().includes(term);
      const matchesGroup = event.group.name.toLowerCase().includes(term);
      const matchesSpace = event.public_space?.name?.toLowerCase().includes(term);

      if (!matchesName && !matchesGroup && !matchesSpace) {
        return false;
      }
    }

    return true;
  });

  return (
    <div className="space-y-4">
      <EventsFilterSearch
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusChange={setStatusFilter}
        dateFilter={dateFilter}
        onDateChange={setDateFilter}
      />

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Historial de Eventos</h2>
          <p className="text-sm text-gray-600 mt-1">Registro completo de todos los eventos realizados</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Evento</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Sala</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Fecha</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm">Estado</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700 text-sm"></th>
              </tr>
            </thead>

            <tbody>
              {filteredEvents.length > 0 ? (
                filteredEvents.map((event) => (
                  <tr key={event.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-medium text-gray-900 text-sm">{event.name}</p>
                        <p className="text-gray-600 text-xs mt-1">{event.group.name}</p>
                      </div>
                    </td>

                    <td className="py-4 px-4 text-sm text-gray-700">
                      {event.public_space?.name || 'N/A'}
                    </td>

                    <td className="py-4 px-4">
                      <div>
                        <p className="text-sm text-gray-900">{formatDate(event.day)}</p>
                        <p className="text-xs text-gray-500 mt-1">Modulo {event.module}</p>
                      </div>
                    </td>

                    <td className="py-4 px-4">{getStatusBadge(event.status)}</td>

                    <td className="py-4 px-4">
                      {event.status === 'PENDING' && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => updateStatus(event.id, 'CONFIRMED')}
                            disabled={loadingId === event.id}
                            className="px-3 py-1 text-xs rounded bg-green-600 text-white hover:bg-green-700 disabled:opacity-50"
                          >
                            {loadingId === event.id ? '...' : 'Aceptar'}
                          </button>

                          <button
                            onClick={() => updateStatus(event.id, 'CANCELLED')}
                            disabled={loadingId === event.id}
                            className="px-3 py-1 text-xs rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                          >
                            {loadingId === event.id ? '...' : 'Rechazar'}
                          </button>
                        </div>
                      )}
                      {event.status === 'CONFIRMED' && (
                        <button
                          onClick={() => updateStatus(event.id, 'CANCELLED')}
                          disabled={loadingId === event.id}
                          className="px-3 py-1 text-xs rounded bg-red-600 text-white hover:bg-red-700 disabled:opacity-50"
                        >
                          {loadingId === event.id ? '...' : 'Cancelar'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-gray-500">
                    No se encontraron eventos que coincidan con los filtros.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
