import type { Room, MaintenanceModule } from '@/types/room';

export type MaintenanceSelectionMap = Record<string, MaintenanceModule[]>;

export type SlotStatus = 'AVAILABLE' | 'UNAVAILABLE' | 'MAINTENANCE';

export type SlotInfo = {
  status: SlotStatus;
  scheduleId?: number;
  attendanceStatus?: string | null;
  timeLabel?: string;
  isPast?: boolean;
};

export type ScheduleStatusMap = Record<string, Record<MaintenanceModule, SlotInfo>>;

export type WeekDay = {
  key: string;
  label: string;
};

export type RoomEditableStatus = Extract<Room['status'], 'AVAILABLE' | 'MAINTENANCE'>;

export type MaintenanceActionMode = 'block' | 'free';
