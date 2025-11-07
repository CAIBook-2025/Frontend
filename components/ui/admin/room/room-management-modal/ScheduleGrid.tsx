import { Loader2 } from 'lucide-react';
import { MODULES, SLOT_STATUS_STYLES } from './constants';
import type { MaintenanceModule } from '@/types/room';
import type {
  MaintenanceActionMode,
  MaintenanceSelectionMap,
  ScheduleStatusMap,
  WeekDay,
} from './types';
import { isActionAllowed } from './utils';

interface ScheduleGridProps {
  days: WeekDay[];
  selectionMap: MaintenanceSelectionMap;
  statusMap: ScheduleStatusMap;
  selectedModulesCount: number;
  scheduleLoading: boolean;
  scheduleError: string | null;
  saveError: string | null;
  saveLoading: boolean;
  mode: MaintenanceActionMode;
  onToggle: (dayKey: string, module: MaintenanceModule) => void;
}

const getActionLabel = (mode: MaintenanceActionMode) => (mode === 'block' ? 'Bloquear' : 'Liberar');

export const ScheduleGrid = ({
  days,
  selectionMap,
  statusMap,
  selectedModulesCount,
  scheduleLoading,
  scheduleError,
  saveError,
  saveLoading,
  mode,
  onToggle,
}: ScheduleGridProps) => (
  <div className="mt-6">
    <div className="flex items-center justify-between mb-2">
      <div>
        <p className="text-sm font-medium text-gray-900">Semana actual (lunes a viernes)</p>
        <p className="text-xs text-gray-500">
          Accion actual: {mode === 'block' ? 'bloquear modulos disponibles' : 'liberar modulos en mantenimiento'}
        </p>
      </div>
      <span className="text-xs text-gray-500">{selectedModulesCount} modulos seleccionados</span>
    </div>
    <p className="text-xs text-gray-500">
      Selecciona los modulos que aplicaran el cambio segun el estado elegido.
    </p>
    {scheduleLoading ? (
      <div className="mt-3 flex items-center gap-2 text-xs text-blue-600">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span>Cargando disponibilidad de modulos...</span>
      </div>
    ) : (
      <>
        {scheduleError && <p className="text-xs text-red-600 mt-2">{scheduleError}</p>}
        <div className="overflow-x-auto mt-3">
          <table className="w-full text-sm border border-gray-200 rounded-lg">
            <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wide">
              <tr>
                {days.map(({ key, label }) => (
                  <th key={key} className="py-3 px-4 text-center font-semibold">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MODULES.map((module) => (
                <tr key={module} className="border-t border-gray-100">
                  {days.map(({ key, label }) => {
                    const isSelected = selectionMap[key]?.includes(module) ?? false;
                    const slotInfo = statusMap[key]?.[module];
                    const slotStatus = slotInfo?.status ?? 'AVAILABLE';
                    const slotStyles = SLOT_STATUS_STYLES[slotStatus];
                    const allowed = isActionAllowed(mode, slotStatus);
                    const actionLabel = getActionLabel(mode);
                    return (
                      <td key={`${module}-${key}`} className="py-2 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => onToggle(key, module)}
                          disabled={saveLoading || !allowed}
                          className={`w-full min-w-[110px] rounded border px-3 py-3 text-xs font-medium transition flex flex-col gap-1 ${slotStyles.baseClass} ${
                            isSelected ? 'ring-2 ring-orange-400 shadow-md text-orange-800' : 'hover:shadow-sm'
                          } ${
                            saveLoading || !allowed ? 'opacity-60 cursor-not-allowed' : ''
                          }`}
                          title={
                            allowed
                              ? `${module} - ${label}`
                              : mode === 'block'
                              ? 'Solo se pueden bloquear modulos disponibles'
                              : 'Solo se pueden liberar modulos en mantenimiento'
                          }
                        >
                          <span className="text-[11px] font-semibold text-gray-800">{module}</span>
                          <span className="text-[11px] font-semibold uppercase">
                            {isSelected ? actionLabel : ''}
                          </span>
                          <span className={`text-[10px] font-medium ${slotStyles.labelClass}`}>{slotStyles.label}</span>
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {saveError && <p className="mt-3 text-sm text-red-600">{saveError}</p>}
      </>
    )}
  </div>
);
