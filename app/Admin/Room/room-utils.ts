import type { ScheduleItem } from '@/lib/schedule/fetchSchedule';
import type { StudyRoomRecord } from '@/lib/studyRooms/fetchStudyRooms';
import type { Room } from '@/types/room';
import { API_STATUS_TO_ROOM_STATUS, STATUS_PRIORITY } from './constants';

export const resolveAccessToken = (token: unknown): string | null => {
  if (typeof token === 'string') return token;
  if (token && typeof token === 'object' && 'accessToken' in token) {
    const value = (token as { accessToken?: unknown }).accessToken;
    return typeof value === 'string' ? value : null;
  }
  return null;
};

export function normalizeEquipment(equipment: unknown): string[] {
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

export const mapApiStatus = (status?: string | null): Room['status'] => {
  if (!status) return 'AVAILABLE';
  const normalized = status.toUpperCase();
  return API_STATUS_TO_ROOM_STATUS[normalized] ?? 'UNAVAILABLE';
};

export type ScheduleAggregation = {
  status: Room['status'];
  busySlots: number;
  totalSlots: number;
  statusNote?: string;
  location?: string | null;
  capacity?: number | null;
  equipment?: unknown;
  name?: string | null;
};

export const aggregateSchedulesByRoom = (items: ScheduleItem[]): Map<string, ScheduleAggregation> => {
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
        name: baseRoom?.name ?? null,
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
      name: summary.name ?? baseRoom?.name ?? null,
    });
  });

  return map;
};

export const mergeRoomsWithScheduleData = (baseRooms: Room[], scheduleItems: ScheduleItem[]): Room[] => {
  const roomsById = new Map<string, Room>();

  baseRooms.forEach((room) => {
    roomsById.set(room.id, {
      ...room,
      features: room.features.length ? room.features : ['Sin datos'],
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
    features: room.features.length ? room.features : ['Sin datos'],
  }));
};

export const adaptStudyRoomsToView = (items: StudyRoomRecord[]): Room[] => {
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

