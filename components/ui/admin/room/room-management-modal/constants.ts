import type { MaintenanceModule } from '@/types/room';
import type { SlotStatus } from './types';

export const MODULES: MaintenanceModule[] = ['M1', 'M2', 'M3', 'M4'];

export const MODULE_TIME_WINDOWS: Record<MaintenanceModule, { start: string; end: string; label: string }> = {
  M1: { start: '08:20', end: '09:30', label: '08:20 - 09:30' },
  M2: { start: '09:40', end: '10:50', label: '09:40 - 10:50' },
  M3: { start: '11:00', end: '12:10', label: '11:00 - 12:10' },
  M4: { start: '12:20', end: '13:30', label: '12:20 - 13:30' },
};

export const SLOT_STATUS_STYLES: Record<
  SlotStatus,
  { label: string; baseClass: string; labelClass: string; badgeClass: string }
> = {
  AVAILABLE: {
    label: 'Disponible',
    baseClass: 'bg-green-50 border-green-200 text-green-700',
    labelClass: 'text-green-700',
    badgeClass: 'bg-green-600',
  },
  UNAVAILABLE: {
    label: 'No disponible',
    baseClass: 'bg-red-50 border-red-200 text-red-700',
    labelClass: 'text-red-700',
    badgeClass: 'bg-red-600',
  },
  MAINTENANCE: {
    label: 'Mantenimiento',
    baseClass: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    labelClass: 'text-yellow-700',
    badgeClass: 'bg-yellow-500',
  },
};
