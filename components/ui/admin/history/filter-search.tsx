import { useState } from "react";
import { SearchInput } from "@/components/ui/shared/search-input";

export const FilterComponent = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-lg font-semibold text-gray-800">Filtros</h2>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Campo de búsqueda */}
        <div>
          <SearchInput
            placeholder="Buscar..."
            value={searchTerm}
            onChange={setSearchTerm}
            wrapperClassName="w-full"
            inputClassName="py-2 text-sm"
            iconClassName="text-slate-400"
          />
        </div>

        {/* Filtro por estado */}
        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full rounded-lg border border-slate-200 p-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
            className="w-full rounded-lg border border-slate-200 p-2 text-sm text-gray-700 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
}
