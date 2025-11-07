interface MaintenanceReasonFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export const MaintenanceReasonField = ({ value, onChange }: MaintenanceReasonFieldProps) => (
  <div className="mt-4">
    <label htmlFor="statusNote" className="block text-sm font-medium text-gray-900 mb-2">
      Motivo
    </label>
    <textarea
      id="statusNote"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Ingrese el motivo del cambio de estado..."
      rows={3}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
    />
  </div>
);
