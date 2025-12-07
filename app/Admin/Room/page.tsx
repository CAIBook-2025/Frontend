'use client';

import { useMemo, useState, useCallback } from 'react';
import { PageHeader } from '@/components/ui/page-header';
import { FilterRoom, type RoomFilters } from '@/components/ui/admin/room/filter-search';
import { StatCard } from '@/components/ui/dashboard/QuickStatCard';
import { Building2, Wrench, Percent, CalendarCheck2 } from 'lucide-react';
import { RoomsTable } from '@/components/ui/admin/room/rooms-table';
import { RoomManagementModal, RoomEditableStatus } from '@/components/ui/admin/room/room-management-modal';
import type { MaintenanceBlock, Room } from '@/types/room';
import { LoadingRooms } from './loading-state';
import { useRoomsData } from './useRoomsData';

export default function RoomPage() {
  const { rooms, setRooms, isLoadingRooms, loadError } = useRoomsData();
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [filters, setFilters] = useState<RoomFilters>({
    query: '',
    location: 'all',
    capacityMin: '',
    features: [],
    status: 'all',
    utilizationMin: '',
    reservationsTodayMin: '',
  });

  const handleFiltersChange = useCallback((next: RoomFilters) => {
    setFilters(next);
  }, []);

  const filteredRooms = useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    return rooms.filter((r) => {
      const matchesQuery = !q || r.name.toLowerCase().includes(q) || r.location.toLowerCase().includes(q);
      const matchesLocation = filters.location === 'all' || r.location === filters.location;
      const matchesCapacity = filters.capacityMin === '' || r.capacity >= Number(filters.capacityMin);
      const matchesStatus = filters.status === 'all' || r.status === filters.status;
      const matchesUtilization = filters.utilizationMin === '' || r.utilization >= Number(filters.utilizationMin);
      const matchesReservationsToday =
        filters.reservationsTodayMin === '' || r.reservationsToday >= Number(filters.reservationsTodayMin);
      const matchesFeatures = filters.features.length === 0 || filters.features.every((f) => r.features.includes(f));
      return (
        matchesQuery &&
        matchesLocation &&
        matchesCapacity &&
        matchesStatus &&
        matchesUtilization &&
        matchesReservationsToday &&
        matchesFeatures
      );
    });
  }, [rooms, filters]);

  const handleManageRoom = useCallback((room: Room) => {
    setSelectedRoom(room);
    setIsModalOpen(true);
  }, []);

  const handleSaveRoom = useCallback(
    (id: string, status: RoomEditableStatus, statusNote?: string, maintenanceBlocks?: MaintenanceBlock[]) => {
      setRooms((prev) =>
        prev.map((r) =>
          r.id === id
            ? {
                ...r,
                status,
                statusNote: status === 'AVAILABLE' ? undefined : statusNote,
                maintenanceBlocks:
                  status === 'MAINTENANCE' && maintenanceBlocks?.length ? maintenanceBlocks : undefined,
              }
            : r
        )
      );
      setIsModalOpen(false);
      setSelectedRoom(null);
    },
    [setRooms]
  );

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedRoom(null);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {isLoadingRooms ? (
          <LoadingRooms />
        ) : (
          <>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <PageHeader title="Gestión de Salas" subtitle="Habilita, deshabilita o programa mantenimiento de salas" />
            </div>

            <section>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  icon={<Building2 className="h-4 w-4" />}
                  value={rooms.filter((r) => r.status === 'AVAILABLE').length}
                  label="Salas disponibles"
                  footer="Disponibles para reserva"
                  variant="blue"
                />
                <StatCard
                  icon={<Wrench className="h-4 w-4" />}
                  value={rooms.filter((r) => r.status === 'MAINTENANCE').length}
                  label="En mantenimiento"
                  footer="Temporalmente no disponibles"
                  variant="yellow"
                />
                <StatCard
                  icon={<Percent className="h-4 w-4" />}
                  value={
                    rooms.length ? Math.round(rooms.reduce((acc, room) => acc + room.utilization, 0) / rooms.length) : 0
                  }
                  label="Utilización promedio"
                  footer="Porcentaje de ocupación"
                  variant="red"
                />
                <StatCard
                  icon={<CalendarCheck2 className="h-4 w-4" />}
                  value={rooms.reduce((acc, r) => acc + r.reservationsToday, 0)}
                  label="Reservas Hoy"
                  footer="Total del dia"
                  variant="blue"
                />
              </div>
            </section>

            <FilterRoom rooms={rooms} onFiltersChange={handleFiltersChange} />

            {loadError && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{loadError}</div>
            )}

            <RoomsTable rooms={filteredRooms} onManage={handleManageRoom} />

            <RoomManagementModal
              room={selectedRoom}
              isOpen={isModalOpen}
              onClose={handleCloseModal}
              onSave={handleSaveRoom}
            />
          </>
        )}
      </div>
    </div>
  );
}
