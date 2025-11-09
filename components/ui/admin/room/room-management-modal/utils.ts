import type { ScheduleItem } from '@/types/schedule';
import type { MaintenanceBlock, MaintenanceModule } from '@/types/room';
import { MODULES, MODULE_TIME_WINDOWS } from './constants';
import type {
  MaintenanceActionMode,
  MaintenanceSelectionMap,
  RoomEditableStatus,
  SlotInfo,
  SlotStatus,
  WeekDay,
} from './types';

const WEEK_DAYS_TO_SHOW = 5;

export const sortModules = (a: MaintenanceModule, b: MaintenanceModule) => MODULES.indexOf(a) - MODULES.indexOf(b);

export const buildSelectionMap = (blocks?: MaintenanceBlock[] | null): MaintenanceSelectionMap => {
  if (!blocks?.length) return {};
  return blocks.reduce<MaintenanceSelectionMap>((acc, block) => {
    if (!block.date || !block.modules?.length) return acc;
    acc[block.date] = [...new Set(block.modules)].sort(sortModules);
    return acc;
  }, {});
};

export const normalizeMaintenanceBlocks = (map: MaintenanceSelectionMap): MaintenanceBlock[] => {
  return Object.entries(map)
    .map(([date, modules]) => ({
      date,
      modules: [...new Set(modules)].sort(sortModules),
    }))
    .filter((block) => block.modules.length > 0)
    .sort((a, b) => a.date.localeCompare(b.date));
};

export const generateCurrentWeekDays = (): WeekDay[] => {
  const formatter = new Intl.DateTimeFormat('es-ES', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const currentWeekDay = today.getDay(); // 0 (Sun) -> 6 (Sat)
  const diffToMonday = currentWeekDay === 0 ? -6 : 1 - currentWeekDay;
  const monday = new Date(today);
  monday.setDate(today.getDate() + diffToMonday);

  return Array.from({ length: WEEK_DAYS_TO_SHOW }, (_, index) => {
    const date = new Date(monday);
    date.setDate(monday.getDate() + index);
    return {
      key: date.toISOString().split('T')[0],
      label: formatter.format(date),
    };
  });
};

export const filterSelectionToWeek = (
  selection: MaintenanceSelectionMap,
  allowedKeys: string[]
): MaintenanceSelectionMap => {
  const allowed = new Set(allowedKeys);
  const entries = Object.entries(selection).filter(([key]) => allowed.has(key));
  if (entries.length === Object.keys(selection).length) return selection;
  return entries.reduce<MaintenanceSelectionMap>((acc, [key, value]) => {
    acc[key] = value;
    return acc;
  }, {});
};

export const parseModule = (moduleValue: string | number | null | undefined): MaintenanceModule | null => {
  if (moduleValue === null || moduleValue === undefined) return null;
  const raw = String(moduleValue).trim().toUpperCase();
  if (MODULES.includes(raw as MaintenanceModule)) {
    return raw as MaintenanceModule;
  }
  const numeric = Number(raw.replace(/\D/g, ''));
  if (!Number.isFinite(numeric)) return null;
  const moduleId = `M${numeric}` as MaintenanceModule;
  return MODULES.includes(moduleId) ? moduleId : null;
};

export const getModuleTimeLabel = (module: MaintenanceModule): string => MODULE_TIME_WINDOWS[module]?.label ?? '';

export const getModuleStartDate = (dayKey: string, module: MaintenanceModule): Date | null => {
  const window = MODULE_TIME_WINDOWS[module];
  if (!window) return null;
  const [hour, minute] = window.start.split(':').map(Number);
  if (Number.isNaN(hour) || Number.isNaN(minute)) return null;
  const date = new Date(`${dayKey}T00:00:00`);
  date.setHours(hour, minute, 0, 0);
  return date;
};

export const isSlotInPast = (dayKey: string, module: MaintenanceModule): boolean => {
  const slotDate = getModuleStartDate(dayKey, module);
  if (!slotDate) return false;
  return slotDate.getTime() < Date.now();
};

export const buildEmptyDayStatus = (dayKey: string): Record<MaintenanceModule, SlotInfo> =>
  MODULES.reduce<Record<MaintenanceModule, SlotInfo>>(
    (acc, module) => {
      acc[module] = {
        status: 'AVAILABLE',
        timeLabel: getModuleTimeLabel(module),
        isPast: isSlotInPast(dayKey, module),
      };
      return acc;
    },
    {} as Record<MaintenanceModule, SlotInfo>
  );

export const getRoomIdentifier = (item: ScheduleItem): string => {
  const base = item.studyRoom?.id ?? item.sr_id ?? item.id;
  return String(base);
};

export const getSlotStatus = (value?: string | null): SlotStatus => {
  const normalized = (value ?? '').toUpperCase();
  if (normalized === 'UNAVAILABLE') return 'UNAVAILABLE';
  if (normalized === 'MAINTENANCE') return 'MAINTENANCE';
  return 'AVAILABLE';
};

export const getActionMode = (status: RoomEditableStatus): MaintenanceActionMode =>
  status === 'MAINTENANCE' ? 'block' : 'free';

export const isActionAllowed = (mode: MaintenanceActionMode, slotStatus: SlotStatus, isPast?: boolean) => {
  if (isPast) return false;
  if (mode === 'block') return slotStatus === 'AVAILABLE';
  return slotStatus === 'MAINTENANCE' || slotStatus === 'UNAVAILABLE';
};
