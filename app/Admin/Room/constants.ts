import type { Room } from '@/types/room';

export const DEFAULT_DAY = new Date().toISOString().split('T')[0];

export const STATUS_PRIORITY: Record<Room['status'], number> = {
  AVAILABLE: 1,
  MAINTENANCE: 2,
  UNAVAILABLE: 3,
};

export const API_STATUS_TO_ROOM_STATUS: Record<string, Room['status']> = {
  AVAILABLE: 'AVAILABLE',
  MAINTENANCE: 'MAINTENANCE',
  UNAVAILABLE: 'UNAVAILABLE',
};
