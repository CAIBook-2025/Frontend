
import { Search } from 'lucide-react';

interface EventsFilterSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  statusFilter: string;
  onStatusChange: (value: string) => void;
  dateFilter: string;
  onDateChange: (value: string) => void;
}

export const EventsFilterSearch = ({
  searchTerm,
  onSearchChange,
  statusFilter,
  onStatusChange,
  dateFilter,
  onDateChange,
}: EventsFilterSearchProps) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      <h2 className="text-lg font-semibold mb-4">Filtros</h2>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Campo de búsqueda */}
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-gray-500" />
          <input
            type="text"
            className="border border-blue-400 rounded-lg p-2 text-sm w-full"
            placeholder="Buscar..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>

        {/* Filtro por estado */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => onStatusChange(e.target.value)}
            className="border border-blue-400 rounded-lg p-2 text-sm w-full"
          >
            <option value="all">Todos los estados</option>
            <option value="CONFIRMED">Confirmado</option>
            <option value="PENDING">Pendiente</option>
            <option value="CANCELLED">Cancelado</option>
          </select>
        </div>

        {/* Filtro por período */}
        <div>
          <select
            value={dateFilter}
            onChange={(e) => onDateChange(e.target.value)}
            className="border border-blue-400 rounded-lg p-2 text-sm w-full"
          >
            <option value="all">Todo el tiempo</option>
            <option value="today">Hoy</option>
            <option value="week">Esta semana</option>
            <option value="month">Este mes</option>
          </select>
        </div>
      </div>
    </div>
  );
};
