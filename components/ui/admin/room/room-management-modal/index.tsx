'use client';

import { useCallback, useEffect, useState } from 'react';
import { disableScheduleSlot } from '@/lib/schedule/disableSchedule';
import { enableScheduleSlot } from '@/lib/schedule/enableSchedule';
import { cancelScheduleSlot } from '@/lib/schedule/cancelSchedule';
import type { MaintenanceBlock, Room } from '@/types/room';
import { MaintenanceReasonField } from './MaintenanceReasonField';
import { ModalActions } from './ModalActions';
import { ModalHeader } from './ModalHeader';
import { ScheduleGrid } from './ScheduleGrid';
import { StatusSelector } from './StatusSelector';
import type { RoomEditableStatus } from './types';
import {
  useActionMode,
  useAdminSession,
  useMaintenanceSelections,
  useScheduleMatrix,
  useVisibleWeekDays,
} from './hooks';

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
  const [saveLoading, setSaveLoading] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const visibleDays = useVisibleWeekDays(isOpen);
  const actionMode = useActionMode(selectedStatus);
  const { accessToken, adminId, sessionError } = useAdminSession(isOpen);
  const { scheduleStatusMap, scheduleLoading, scheduleError } = useScheduleMatrix(
    room?.id,
    isOpen,
    accessToken,
    visibleDays
  );
  const {
    blockSelectionMap,
    freeSelectionMap,
    toggleMaintenanceSlot,
    normalizedBlockSelection,
    selectedModulesCount,
    clearFreeSelection,
  } = useMaintenanceSelections(room, visibleDays, actionMode, scheduleStatusMap);

  useEffect(() => {
    if (sessionError) {
      setSaveError(sessionError);
    }
  }, [sessionError]);

  useEffect(() => {
    if (!room) return;
    setSelectedStatus(room.status === 'MAINTENANCE' ? 'MAINTENANCE' : 'AVAILABLE');
    setStatusNote(room.statusNote || '');
  }, [room]);

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
        setSaveError('No se encontraron horarios asociados a algunos módulos seleccionados.');
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
            status: scheduleStatusMap[date]?.[module]?.status,
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
            slotsToEnable.map((slot) => {
              const targetStatus = slot.status ?? 'AVAILABLE';
              if (targetStatus === 'UNAVAILABLE') {
                return cancelScheduleSlot(accessToken, {
                  scheduleId: slot.scheduleId!,
                  adminId,
                });
              }

              return enableScheduleSlot(accessToken, {
                scheduleId: slot.scheduleId!,
                adminId,
              });
            })
          );

          if (enableResults.some((result) => !result)) {
            setSaveError('No se pudieron liberar todos los modulos seleccionados. Intenta nuevamente.');
            return;
          }

          clearFreeSelection();

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
    clearFreeSelection,
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
