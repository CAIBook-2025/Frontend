'use client';

import { useMemo, useState, useCallback, useEffect } from 'react';
import { useUser, getAccessToken } from '@auth0/nextjs-auth0';
import { PageHeader } from '@/components/ui/page-header';
import { FilterRoom, type RoomFilters } from '@/components/ui/admin/room/filter-search';
import { StatCard } from '@/components/ui/dashboard/QuickStatCard';
import { Building2, Wrench, Percent, CalendarCheck2, Loader2, UserRound } from 'lucide-react';
import { RoomsTable } from '@/components/ui/admin/room/rooms-table';
import { RoomManagementModal, RoomEditableStatus } from '@/components/ui/admin/room/room-management-modal';
import { fetchSchedule, type ScheduleItem } from '@/lib/schedule/fetchSchedule';
import { fetchStudyRooms, type StudyRoomRecord } from '@/lib/studyRooms/fetchStudyRooms';
import type { Room } from '@/types/room';

const DEFAULT_DAY = new Date().toISOString().split('T')[0];

const STATUS_PRIORITY: Record<Room['status'], number> = {
  AVAILABLE: 1,
  MAINTENANCE: 2,
  UNAVAILABLE: 3,
};

const API_STATUS_TO_ROOM_STATUS: Record<string, Room['status']> = {
  AVAILABLE: 'AVAILABLE',
  MAINTENANCE: 'MAINTENANCE',
  UNAVAILABLE: 'UNAVAILABLE'
};

const resolveAccessToken = (token: unknown): string | null => {
  if (typeof token === 'string') return token;
  if (token && typeof token === 'object' && 'accessToken' in token) {
    const value = (token as { accessToken?: unknown }).accessToken;
    return typeof value === 'string' ? value : null;
  }
  return null;
};

function normalizeEquipment(equipment: unknown): string[] {
  if (!equipment) return [];
  if (Array.isArray(equipment)) {
    return equipment.filter(Boolean).map(String);
  }
  if (typeof equipment === 'string') {
    try {
      const parsed = JSON.parse(equipment);
      return normalizeEquipment(parsed);
    } catch {
      return [equipment].filter(Boolean);
    }
  }
  if (typeof equipment === 'object') {
    return Object.values(equipment as Record<string, unknown>)
      .filter(Boolean)
      .map(String);
  }
  return [];
}

const mapApiStatus = (status?: string | null): Room['status'] => {
  if (!status) return 'AVAILABLE';
  const normalized = status.toUpperCase();
  return API_STATUS_TO_ROOM_STATUS[normalized] ?? 'UNAVAILABLE';
};

type ScheduleAggregation = {
  status: Room['status'];
  busySlots: number;
  totalSlots: number;
  statusNote?: string;
  location?: string | null;
  capacity?: number | null;
  equipment?: unknown;
  name?: string | null;
};

type LatestUserInfo = {
  fullName: string;
  email: string;
  day: string;
  module: string;
  updatedAt?: string;
};

const aggregateSchedulesByRoom = (items: ScheduleItem[]): Map<string, ScheduleAggregation> => {
  const map = new Map<string, ScheduleAggregation>();

  items.forEach((item) => {
    const baseRoom = item.studyRoom;
    const roomId = String(baseRoom?.id ?? item.sr_id ?? item.id);
    const slotStatus = mapApiStatus(item.available);
    const busyIncrement = slotStatus === 'AVAILABLE' ? 0 : 1;
    const moduleNote = slotStatus === 'AVAILABLE' ? undefined : `Modulo ${item.module ?? 'N/D'} ocupado`;

    const summary = map.get(roomId);

    if (!summary) {
      map.set(roomId, {
        status: slotStatus,
        busySlots: busyIncrement,
        totalSlots: 1,
        statusNote: moduleNote,
        location: baseRoom?.location ?? null,
        capacity:
          typeof baseRoom?.capacity === 'number' ? baseRoom.capacity : Number(baseRoom?.capacity ?? 0),
        equipment: baseRoom?.equipment,
        name: baseRoom?.name ?? null
      });
      return;
    }

    const totalSlots = summary.totalSlots + 1;
    const busySlots = summary.busySlots + busyIncrement;
    const hasHigherPriority = STATUS_PRIORITY[slotStatus] > STATUS_PRIORITY[summary.status];
    const finalStatus = hasHigherPriority ? slotStatus : summary.status;
    const statusNote =
      finalStatus === 'AVAILABLE'
        ? undefined
        : hasHigherPriority
        ? moduleNote ?? summary.statusNote
        : summary.statusNote ?? moduleNote;

    map.set(roomId, {
      status: finalStatus,
      busySlots,
      totalSlots,
      statusNote,
      location: summary.location ?? baseRoom?.location ?? null,
      capacity:
        summary.capacity ??
        (typeof baseRoom?.capacity === 'number' ? baseRoom.capacity : Number(baseRoom?.capacity ?? 0)),
      equipment: summary.equipment ?? baseRoom?.equipment,
      name: summary.name ?? baseRoom?.name ?? null
    });
  });

  return map;
};

const mergeRoomsWithScheduleData = (baseRooms: Room[], scheduleItems: ScheduleItem[]): Room[] => {
  const roomsById = new Map<string, Room>();

  baseRooms.forEach((room) => {
    roomsById.set(room.id, {
      ...room,
      features: room.features.length ? room.features : ['Sin datos']
    });
  });

  const scheduleMap = aggregateSchedulesByRoom(scheduleItems);

  scheduleMap.forEach((stats, roomId) => {
    const base = roomsById.get(roomId);
    const scheduleFeatures = normalizeEquipment(stats.equipment);
    const features =
      base?.features && base.features.length
        ? base.features
        : scheduleFeatures.length
        ? scheduleFeatures
        : ['Sin datos'];

    const room: Room = {
      id: roomId,
      name: base?.name ?? stats.name ?? `Sala ${roomId}`,
      features,
      location: base?.location ?? stats.location ?? 'Sin ubicacion',
      capacity: base?.capacity ?? Number(stats.capacity ?? 0),
      status: stats.status,
      statusNote: stats.status === 'AVAILABLE' ? undefined : stats.statusNote ?? base?.statusNote,
      reservationsToday: stats.busySlots,
      utilization: stats.totalSlots ? Math.round((stats.busySlots / stats.totalSlots) * 100) : 0,
    };

    roomsById.set(roomId, room);
  });

  return Array.from(roomsById.values()).map((room) => ({
    ...room,
    features: room.features.length ? room.features : ['Sin datos']
  }));
};

const adaptStudyRoomsToView = (items: StudyRoomRecord[]): Room[] => {
  return items.map((item) => ({
    id: String(item.id),
    name: item.name,
    features: normalizeEquipment(item.equipment),
    location: item.location ?? 'Sin ubicacion',
    capacity: Number(item.capacity ?? 0),
    status: 'AVAILABLE',
    reservationsToday: 0,
    utilization: 0,
  }));
};

const getScheduleTimestamp = (item: ScheduleItem): number => {
  const candidate = item.updatedAt ?? item.createdAt ?? item.day;
  if (candidate) {
    const parsed = Date.parse(candidate);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }
  return item.id;
};

const buildLatestUserInfo = (items: ScheduleItem[]): LatestUserInfo | null => {
  if (!items.length) return null;
  const sorted = [...items].sort((a, b) => getScheduleTimestamp(b) - getScheduleTimestamp(a));
  const latest = sorted[0];

  if (!latest || !latest.user) return null;

  const fullName = [latest.user.first_name, latest.user.last_name].filter(Boolean).join(' ').trim();

  return {
    fullName: fullName || latest.user.email || 'Usuario sin nombre',
    email: latest.user.email ?? 'Sin email',
    day: latest.day ?? DEFAULT_DAY,
    module: latest.module ?? 'N/D',
    updatedAt: latest.updatedAt ?? latest.createdAt,
  };
};

export default function RoomPage() {
  const { user, isLoading: isUserLoading } = useUser();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [recentUser, setRecentUser] = useState<LatestUserInfo | null>(null);

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

  const handleSaveRoom = useCallback((id: string, status: RoomEditableStatus, statusNote?: string) => {
    setRooms((prev) =>
      prev.map((r) =>
        r.id === id
          ? {
              ...r,
              status,
              statusNote: status === 'AVAILABLE' ? undefined : statusNote,
            }
          : r
      )
    );
    setIsModalOpen(false);
    setSelectedRoom(null);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedRoom(null);
  }, []);

  const loadRooms = useCallback(async () => {
    if (!user) return;
    setIsLoadingRooms(true);
    setLoadError(null);
    try {
      const tokenResponse = await getAccessToken();
      const accessToken = resolveAccessToken(tokenResponse);
      if (!accessToken) {
        throw new Error('Access token not available');
      }
      const [studyRooms, schedule] = await Promise.all([
        fetchStudyRooms(accessToken),
        fetchSchedule(accessToken, { day: DEFAULT_DAY, take: 200 }),
      ]);

      if (!studyRooms) {
        throw new Error('Study rooms response empty');
      }

      const baseRooms = adaptStudyRoomsToView(studyRooms);
      const scheduleItems = schedule?.items ?? [];
      const mergedRooms =
        scheduleItems.length > 0 ? mergeRoomsWithScheduleData(baseRooms, scheduleItems) : baseRooms;

      if (scheduleItems.length === 0) {
        console.warn('fetchSchedule returned no items; occupancy metrics may not be accurate');
      }

      setRooms(mergedRooms);
      setRecentUser(scheduleItems.length ? buildLatestUserInfo(scheduleItems) : null);
    } catch (error) {
      console.error('Error fetching data for admin room page', error);
      setRooms([]);
      setLoadError('No se pudieron cargar las salas y sus horarios.');
      setRecentUser(null);
    } finally {
      setIsLoadingRooms(false);
    }
  }, [user]);

  useEffect(() => {
    if (isUserLoading) {
      return;
    }
    if (!user) {
      setRooms([]);
      setLoadError('Debes iniciar sesion para ver las salas.');
      setIsLoadingRooms(false);
      setRecentUser(null);
      return;
    }
    void loadRooms();
  }, [isUserLoading, user, loadRooms]);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {isLoadingRooms ? (
          <LoadingRooms />
        ) : (
          <>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <PageHeader title="Gestion de Salas" subtitle="Habilita, deshabilita o programa mantenimiento de salas" />
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
                    rooms.length
                      ? Math.round(rooms.reduce((acc, room) => acc + room.utilization, 0) / rooms.length)
                      : 0
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
const LoadingRooms = () => (
  <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center text-gray-600">
    <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
    <div>
      <p className="font-medium text-gray-800">Procesando datos de salas</p>
      <p className="text-sm text-gray-500">Cargando salas, horarios y ocupación...</p>
    </div>
  </div>
);

const formatTooltipTimestamp = (value?: string): string | null => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.toLocaleString();
};

const RecentUserTooltip = ({ user }: { user: LatestUserInfo }) => {
  const updatedAt = formatTooltipTimestamp(user.updatedAt);

  return (
    <div className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="text-sm font-semibold text-slate-700">Último usuario</div>
      <div className="group relative inline-flex">
        <UserRound className="h-8 w-8 text-brand-primary" aria-label="Último usuario con horario" />
        <div className="pointer-events-none absolute left-1/2 top-full z-20 hidden w-64 -translate-x-1/2 rounded-lg border border-slate-200 bg-white p-4 text-left text-sm text-slate-700 shadow-xl group-hover:block">
          <p className="text-base font-semibold text-slate-900">{user.fullName}</p>
          <p className="text-xs text-slate-500">{user.email}</p>
          <div className="mt-3 space-y-1 text-xs text-slate-600">
            <p>
              <span className="font-semibold text-slate-700">Día:</span> {user.day}
            </p>
            <p>
              <span className="font-semibold text-slate-700">Módulo:</span> {user.module}
            </p>
            {updatedAt && (
              <p>
                <span className="font-semibold text-slate-700">Actualizado:</span> {updatedAt}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
