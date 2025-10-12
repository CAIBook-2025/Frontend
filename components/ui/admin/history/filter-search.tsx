import { useState } from 'react';
import { Search } from 'lucide-react';

export const FilterComponent = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

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
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filtro por estado */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-blue-400 rounded-lg p-2 text-sm w-full"
          >
            <option value="all">Todos los estados</option>
            <option value="completed">Completado</option>
            <option value="active">Activo</option>
            <option value="cancelled">Cancelado</option>
            <option value="no_show">No Show</option>
          </select>
        </div>

        {/* Filtro por período */}
        <div>
          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
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
