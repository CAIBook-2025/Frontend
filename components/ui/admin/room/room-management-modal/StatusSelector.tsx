import type { ChangeEvent } from 'react';
import { CheckCircleIcon, SettingsIcon } from 'lucide-react';
import type { RoomEditableStatus } from './types';

interface StatusSelectorProps {
  value: RoomEditableStatus;
  onChange: (next: RoomEditableStatus) => void;
}

export const StatusSelector = ({ value, onChange }: StatusSelectorProps) => {
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.value as RoomEditableStatus);
  };

  return (
    <div className="space-y-3">
      <label className="flex items-start gap-3 cursor-pointer group">
        <input
          type="radio"
          name="roomStatus"
          value="AVAILABLE"
          checked={value === 'AVAILABLE'}
          onChange={handleChange}
          className="mt-0.5 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
        />
        <div className="flex items-start gap-2 flex-1">
          <div className="text-green-600 mt-0.5">
            <CheckCircleIcon />
          </div>
          <span className="text-sm text-gray-900">
            Disponible <span className="text-gray-600">(apta para reservas)</span>
          </span>
        </div>
      </label>

      <label className="flex items-start gap-3 cursor-pointer group">
        <input
          type="radio"
          name="roomStatus"
          value="MAINTENANCE"
          checked={value === 'MAINTENANCE'}
          onChange={handleChange}
          className="mt-0.5 w-4 h-4 text-blue-600 border-gray-300 focus:ring-blue-500"
        />
        <div className="flex items-start gap-2 flex-1">
          <div className="text-orange-600 mt-0.5">
            <SettingsIcon />
          </div>
          <span className="text-sm text-gray-900">
            En mantenimiento <span className="text-gray-600">(temporalmente cerrada)</span>
          </span>
        </div>
      </label>
    </div>
  );
};
