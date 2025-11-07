'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { getAccessToken } from '@auth0/nextjs-auth0';
import { resolveAccessToken } from '@/app/Admin/Room/room-utils';
import { fetchUserProfile } from '@/lib/user/fetchUserProfile';
import { disableScheduleSlot } from '@/lib/schedule/disableSchedule';
import { enableScheduleSlot } from '@/lib/schedule/enableSchedule';
import { fetchSchedule } from '@/lib/schedule/fetchSchedule';
import type { MaintenanceBlock, MaintenanceModule, Room } from '@/types/room';
import { MaintenanceReasonField } from './MaintenanceReasonField';
import { ModalActions } from './ModalActions';
import { ModalHeader } from './ModalHeader';
import { ScheduleGrid } from './ScheduleGrid';
import { StatusSelector } from './StatusSelector';
import {
  MaintenanceActionMode,
  MaintenanceSelectionMap,
  RoomEditableStatus,
  ScheduleStatusMap,
} from './types';
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

export type { RoomEditableStatus } from './types';

interface RoomManagementModalProps {
  room: Room | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    id: string,
    status: RoomEditableStatus,
    statusNote?: string,
    maintenanceBlocks?: MaintenanceBlock[]
  ) => void;
}

export function RoomManagementModal({ room, isOpen, onClose, onSave }: RoomManagementModalProps) {
  const [selectedStatus, setSelectedStatus] = useState<RoomEditableStatus>(
    room?.status === 'MAINTENANCE' ? 'MAINTENANCE' : 'AVAILABLE'
  );
  const [statusNote, setStatusNote] = useState<string>(room?.statusNote || '');
  const [blockSelectionMap, setBlockSelectionMap] = useState<MaintenanceSelectionMap>(() =>
    buildSelectionMap(room?.maintenanceBlocks)
  );
  const [freeSelectionMap, setFreeSelectionMap] = useState<MaintenanceSelectionMap>({});
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [adminId, setAdminId] = useState<number | null>(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [scheduleStatusMap, setScheduleStatusMap] = useState<ScheduleStatusMap>({});
  const [scheduleLoading, setScheduleLoading] = useState(false);
  const [scheduleError, setScheduleError] = useState<string | null>(null);

  const visibleDays = useMemo(() => generateCurrentWeekDays(), [isOpen]);
  const actionMode: MaintenanceActionMode = getActionMode(selectedStatus);
  const normalizedBlockSelection = useMemo(
    () => normalizeMaintenanceBlocks(blockSelectionMap),
    [blockSelectionMap]
  );
  const selectedModulesCount = useMemo(() => {
    const sourceMap = actionMode === 'block' ? blockSelectionMap : freeSelectionMap;
    return Object.values(sourceMap).reduce((acc, modules) => acc + modules.length, 0);
  }, [actionMode, blockSelectionMap, freeSelectionMap]);

  useEffect(() => {
    if (!isOpen) {
      setAccessToken(null);
      setAdminId(null);
      setSaveError(null);
      return;
    }

    let isCancelled = false;

    const resolveSession = async () => {
      try {
        const tokenResponse = await getAccessToken();
        if (isCancelled) return;
        const resolvedToken = resolveAccessToken(tokenResponse);
        if (!resolvedToken) {
          throw new Error('Access token not available');
        }
        setAccessToken(resolvedToken);

        const profile = await fetchUserProfile(resolvedToken);
        if (!isCancelled) {
          if (!profile) {
            setSaveError('No se pudo identificar al administrador.');
            setAdminId(null);
          } else {
            setAdminId(profile.id);
          }
        }
      } catch (error) {
        console.error('Error resolving admin session', error);
        if (!isCancelled) {
          setAccessToken(null);
          setAdminId(null);
          setSaveError('No se pudieron obtener las credenciales necesarias.');
        }
      }
    };

    void resolveSession();

    return () => {
      isCancelled = true;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!room) return;
    setSelectedStatus(room.status === 'MAINTENANCE' ? 'MAINTENANCE' : 'AVAILABLE');
    setStatusNote(room.statusNote || '');
    setBlockSelectionMap(buildSelectionMap(room.maintenanceBlocks));
    setFreeSelectionMap({});
  }, [room]);

  useEffect(() => {
    const allowedKeys = visibleDays.map((day) => day.key);
    setBlockSelectionMap((prev) => filterSelectionToWeek(prev, allowedKeys));
    setFreeSelectionMap((prev) => filterSelectionToWeek(prev, allowedKeys));
  }, [visibleDays]);

  useEffect(() => {
    const roomId = room?.id;
    if (!roomId || !isOpen || !accessToken) return;

    let isCancelled = false;
    const dayKeys = visibleDays.map(({ key }) => key);

    const loadSchedule = async () => {
      setScheduleLoading(true);
      setScheduleError(null);
      try {
        const results = await Promise.allSettled(
          dayKeys.map((day) => fetchSchedule(accessToken, { day, take: 200 }))
        );
        if (isCancelled) return;

        const nextMap: ScheduleStatusMap = {};
        let foundAny = false;
        let hadErrors = false;

        results.forEach((result, index) => {
          const dayKey = dayKeys[index];
          const dayStatus = buildEmptyDayStatus();

          if (result.status === 'fulfilled') {
            const items = result.value?.items ?? [];
            const roomItems = items.filter((item) => getRoomIdentifier(item) === roomId);
            if (roomItems.length > 0) {
              foundAny = true;
              roomItems.forEach((item) => {
                const module = parseModule(item.module);
                if (!module) return;
                dayStatus[module] = {
                  status: getSlotStatus(item.available),
                  scheduleId: Number(item.id),
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
        if (!isCancelled) {
          setScheduleError('No se pudo cargar la disponibilidad del horario.');
        }
      } finally {
        if (!isCancelled) {
          setScheduleLoading(false);
        }
      }
    };

    void loadSchedule();

    return () => {
      isCancelled = true;
    };
  }, [room?.id, isOpen, visibleDays, accessToken]);

  const toggleMaintenanceSlot = useCallback(
    (dayKey: string, module: MaintenanceModule) => {
      const setMap = actionMode === 'block' ? setBlockSelectionMap : setFreeSelectionMap;
      setMap((prev) => {
        const slotInfo = scheduleStatusMap[dayKey]?.[module];
        const slotStatus = slotInfo?.status ?? 'AVAILABLE';
        if (!isActionAllowed(actionMode, slotStatus)) {
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

  const handleSave = useCallback(async () => {
    if (!room) return;
    setSaveError(null);

    const maintenancePayload =
      selectedStatus === 'MAINTENANCE' ? normalizedBlockSelection : undefined;

    if (selectedStatus === 'MAINTENANCE' && maintenancePayload && maintenancePayload.length > 0) {
      if (!accessToken) {
        setSaveError('No se pudo autenticar la sesión.');
        return;
      }
      if (!adminId) {
        setSaveError('No se pudo identificar al administrador.');
        return;
      }

      const slotsToDisable = maintenancePayload.flatMap((block) =>
        block.modules.map((module) => ({
          scheduleId: scheduleStatusMap[block.date]?.[module]?.scheduleId,
        }))
      );

      const missingSchedule = slotsToDisable.find((slot) => !slot.scheduleId);
      if (missingSchedule) {
        setSaveError('No se encontraron horarios asociados a algunos modulos seleccionados.');
        return;
      }

      setSaveLoading(true);
      try {
        const disableResults = await Promise.all(
          slotsToDisable.map((slot) =>
            disableScheduleSlot(accessToken, {
              scheduleId: slot.scheduleId!,
              adminId,
            })
          )
        );

        if (disableResults.some((result) => !result)) {
          setSaveError('No se pudieron bloquear todos los modulos seleccionados. Intenta nuevamente.');
          return;
        }
      } catch (error) {
        console.error('Error disabling schedules', error);
        setSaveError('Ocurrio un error al bloquear los modulos seleccionados.');
        return;
      } finally {
        setSaveLoading(false);
      }
    }

    if (selectedStatus === 'AVAILABLE') {
      const freeSelection = freeSelectionMap;
      const hasSelections = Object.keys(freeSelection).some((day) => freeSelection[day]?.length);
      if (hasSelections) {
        if (!accessToken) {
          setSaveError('No se pudo autenticar la sesión.');
          return;
        }
        if (!adminId) {
          setSaveError('No se pudo identificar al administrador.');
          return;
        }

        const slotsToEnable = Object.entries(freeSelection).flatMap(([date, modules]) =>
          modules.map((module) => ({
            scheduleId: scheduleStatusMap[date]?.[module]?.scheduleId,
          }))
        );

        const missingSchedule = slotsToEnable.find((slot) => !slot.scheduleId);
        if (missingSchedule) {
          setSaveError('No se encontraron horarios asociados a algunos modulos seleccionados.');
          return;
        }

        setSaveLoading(true);
        try {
          const enableResults = await Promise.all(
            slotsToEnable.map((slot) =>
              enableScheduleSlot(accessToken, {
                scheduleId: slot.scheduleId!,
                adminId,
              })
            )
          );

          if (enableResults.some((result) => !result)) {
            setSaveError('No se pudieron liberar todos los modulos seleccionados. Intenta nuevamente.');
            return;
          }
          setFreeSelectionMap({});
        } catch (error) {
          console.error('Error enabling schedules', error);
          setSaveError('Ocurrio un error al liberar los modulos seleccionados.');
          return;
        } finally {
          setSaveLoading(false);
        }
      }
    }

    onSave(
      room.id,
      selectedStatus,
      selectedStatus === 'MAINTENANCE' ? statusNote : undefined,
      maintenancePayload
    );
    onClose();
  }, [
    room,
    selectedStatus,
    normalizedBlockSelection,
    freeSelectionMap,
    accessToken,
    adminId,
    scheduleStatusMap,
    statusNote,
    onSave,
    onClose,
  ]);

  if (!isOpen || !room) return null;

  const showMaintenanceFields = selectedStatus === 'MAINTENANCE';

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[95vh] flex flex-col">
        <ModalHeader roomName={room.name} onClose={onClose} />

        <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(95vh - 140px)' }}>
          <h3 className="text-sm font-medium text-gray-900 mb-4">Estado de la Sala</h3>
          <StatusSelector value={selectedStatus} onChange={setSelectedStatus} />
          {showMaintenanceFields && <MaintenanceReasonField value={statusNote} onChange={setStatusNote} />}
          <ScheduleGrid
            days={visibleDays}
            selectionMap={actionMode === 'block' ? blockSelectionMap : freeSelectionMap}
            statusMap={scheduleStatusMap}
            selectedModulesCount={selectedModulesCount}
            scheduleLoading={scheduleLoading}
            scheduleError={scheduleError}
            saveError={saveError}
            saveLoading={saveLoading}
            mode={actionMode}
            onToggle={toggleMaintenanceSlot}
          />
        </div>

        <ModalActions onCancel={onClose} onSave={() => void handleSave()} loading={saveLoading} />
      </div>
    </div>
  );
}
