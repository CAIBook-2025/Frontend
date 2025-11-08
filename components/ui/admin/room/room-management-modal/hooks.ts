import { useCallback, useEffect, useMemo, useState } from 'react';
import { getAccessToken } from '@auth0/nextjs-auth0';
import { resolveAccessToken } from '@/app/Admin/Room/room-utils';
import { fetchUserProfile } from '@/lib/user/fetchUserProfile';
import { fetchSchedule } from '@/lib/schedule/fetchSchedule';
import type { MaintenanceModule } from '@/types/room';
import type { Room } from '@/types/room';
import {
  buildEmptyDayStatus,
  buildSelectionMap,
  filterSelectionToWeek,
  generateCurrentWeekDays,
  getActionMode,
  getRoomIdentifier,
  getSlotStatus,
  isActionAllowed,
  normalizeMaintenanceBlocks,
  parseModule,
  sortModules,
} from './utils';
import type {
  MaintenanceActionMode,
  MaintenanceSelectionMap,
  ScheduleStatusMap,
  WeekDay,
} from './types';

export const useAdminSession = (isOpen: boolean) => {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [adminId, setAdminId] = useState<number | null>(null);
  const [sessionError, setSessionError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setAccessToken(null);
      setAdminId(null);
      setSessionError(null);
      return;
    }

    let cancelled = false;

    const resolveSession = async () => {
      try {
        const tokenResponse = await getAccessToken();
        if (cancelled) return;
        const resolvedToken = resolveAccessToken(tokenResponse);
        if (!resolvedToken) {
          throw new Error('Access token not available');
        }
        setAccessToken(resolvedToken);

        const profile = await fetchUserProfile(resolvedToken);
        if (cancelled) return;

        if (!profile?.user) {
          setAdminId(null);
          setSessionError('No se pudo identificar al administrador.');
        } else {
          setAdminId(profile.user.id);
          setSessionError(null);
        }
      } catch (error) {
        console.error('Error resolving admin session', error);
        if (!cancelled) {
          setAccessToken(null);
          setAdminId(null);
          setSessionError('No se pudieron obtener las credenciales necesarias.');
        }
      }
    };

    void resolveSession();

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  return { accessToken, adminId, sessionError };
};

export const useScheduleMatrix = (
  roomId: string | undefined,
  isOpen: boolean,
  accessToken: string | null,
  visibleDays: WeekDay[]
) => {
  const [scheduleStatusMap, setScheduleStatusMap] = useState<ScheduleStatusMap>({});
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [scheduleError, setScheduleError] = useState<string | null>(null);

  useEffect(() => {
    if (!roomId || !isOpen || !accessToken) return;

    let cancelled = false;
    const dayKeys = visibleDays.map(({ key }) => key);

    const loadSchedule = async () => {
      setScheduleLoading(true);
      setScheduleError(null);
      try {
        const results = await Promise.allSettled(
          dayKeys.map((day) => fetchSchedule(accessToken, { day, take: 200 }))
        );
        if (cancelled) return;

        const nextMap: ScheduleStatusMap = {};
        let foundAny = false;
        let hadErrors = false;

        results.forEach((result, index) => {
          const dayKey = dayKeys[index];
          const dayStatus = buildEmptyDayStatus(dayKey);

          if (result.status === 'fulfilled') {
            const items = result.value?.items ?? [];
            const roomItems = items.filter((item) => getRoomIdentifier(item) === roomId);
            if (roomItems.length > 0) {
              foundAny = true;
              roomItems.forEach((item) => {
                const module = parseModule(item.module);
                if (!module) return;
                dayStatus[module] = {
                  ...dayStatus[module],
                  status: getSlotStatus(item.available),
                  scheduleId: Number(item.id),
                  attendanceStatus: item.status ?? item.attendanceStatus ?? null,
                };
              });
            }
          } else {
            console.error('Error fetching schedule', result.reason);
            setScheduleError('No se pudo cargar la disponibilidad del horario.');
            hadErrors = true;
          }

          nextMap[dayKey] = dayStatus;
        });

        setScheduleStatusMap(nextMap);
        if (!hadErrors) {
          setScheduleError(foundAny ? null : 'No se encontraron datos de horarios.');
        }
      } catch (error) {
        console.error('Unexpected error loading schedule', error);
        if (!cancelled) {
          setScheduleError('No se pudo cargar la disponibilidad del horario.');
        }
      } finally {
        if (!cancelled) {
          setScheduleLoading(false);
        }
      }
    };

    void loadSchedule();

    return () => {
      cancelled = true;
    };
  }, [roomId, isOpen, accessToken, visibleDays]);

  return { scheduleStatusMap, scheduleLoading, scheduleError };
};

export const useMaintenanceSelections = (
  room: Room | null,
  visibleDays: WeekDay[],
  actionMode: MaintenanceActionMode,
  scheduleStatusMap: ScheduleStatusMap
) => {
  const [blockSelectionMap, setBlockSelectionMap] = useState<MaintenanceSelectionMap>(() =>
    buildSelectionMap(room?.maintenanceBlocks)
  );
  const [freeSelectionMap, setFreeSelectionMap] = useState<MaintenanceSelectionMap>({});

  useEffect(() => {
    if (!room) return;
    setBlockSelectionMap(buildSelectionMap(room.maintenanceBlocks));
    setFreeSelectionMap({});
  }, [room]);

  useEffect(() => {
    const allowedKeys = visibleDays.map((day) => day.key);
    setBlockSelectionMap((prev) => filterSelectionToWeek(prev, allowedKeys));
    setFreeSelectionMap((prev) => filterSelectionToWeek(prev, allowedKeys));
  }, [visibleDays]);

  const normalizedBlockSelection = useMemo(
    () => normalizeMaintenanceBlocks(blockSelectionMap),
    [blockSelectionMap]
  );

  const selectedModulesCount = useMemo(() => {
    const sourceMap = actionMode === 'block' ? blockSelectionMap : freeSelectionMap;
    return Object.values(sourceMap).reduce((acc, modules) => acc + modules.length, 0);
  }, [actionMode, blockSelectionMap, freeSelectionMap]);

  const toggleMaintenanceSlot = useCallback(
    (dayKey: string, module: MaintenanceModule) => {
      const mapper = actionMode === 'block' ? setBlockSelectionMap : setFreeSelectionMap;
      mapper((prev) => {
        const slotInfo = scheduleStatusMap[dayKey]?.[module];
        const slotStatus = slotInfo?.status ?? 'AVAILABLE';
        if (!isActionAllowed(actionMode, slotStatus, slotInfo?.isPast)) {
          return prev;
        }

        const next = { ...prev };
        const current = next[dayKey] ?? [];
        const exists = current.includes(module);
        const updated = exists ? current.filter((value) => value !== module) : [...current, module];

        if (updated.length) {
          next[dayKey] = [...new Set(updated)].sort(sortModules);
        } else {
          delete next[dayKey];
        }

        return next;
      });
    },
    [actionMode, scheduleStatusMap]
  );

  const clearFreeSelection = useCallback(() => {
    setFreeSelectionMap({});
  }, []);

  return {
    blockSelectionMap,
    freeSelectionMap,
    toggleMaintenanceSlot,
    normalizedBlockSelection,
    selectedModulesCount,
    clearFreeSelection,
  };
};

export const useVisibleWeekDays = (isOpen: boolean) => {
  return useMemo(() => generateCurrentWeekDays(), [isOpen]);
};

export const useActionMode = (selectedStatus: Room['status']) => {
  return useMemo(() => {
    const editableStatus =
      selectedStatus === 'MAINTENANCE' || selectedStatus === 'AVAILABLE'
        ? selectedStatus
        : 'AVAILABLE';

    return getActionMode(editableStatus);
  }, [selectedStatus]);
};
