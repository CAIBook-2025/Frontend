'use client';

import { useMemo, useState } from 'react';
import { Search, MapPin, Users, CheckCircle2, Gauge, CalendarDays } from 'lucide-react';
import type { Room } from '@/types/room';

export type RoomFilters = {
  query: string; // nombre o ubicación
  location: string; // ubicación exacta o "all"
  capacityMin: number | ''; // capacidad mínima
  features: string[]; // debe incluir todas las seleccionadas
  status: 'all' | 'AVAILABLE' | 'MAINTENANCE' | 'UNAVAILABLE';
  utilizationMin: number | ''; // % mínimo de utilización (0–100)
  reservationsTodayMin: number | ''; // mínimo de reservas hoy
};

type Props = {
  rooms?: Room[]; // opcional: si se pasa, se usan para autocompletar opciones
  onFiltersChange?: (filters: RoomFilters) => void;
  className?: string;
};

export const FilterRoom = ({ rooms = [], onFiltersChange, className }: Props) => {
  const [filters, setFilters] = useState<RoomFilters>({
    query: '',
    location: 'all',
    capacityMin: '',
    features: [],
    status: 'all',
    utilizationMin: '',
    reservationsTodayMin: '',
  });

  // Opciones derivadas desde la data (si viene)
  const options = useMemo(() => {
    const locations = Array.from(new Set(rooms.map((r) => r.location))).sort();
    const features = Array.from(new Set(rooms.flatMap((r) => r.features))).sort();
    return { locations, features };
  }, [rooms]);

  const update = <K extends keyof RoomFilters>(key: K, value: RoomFilters[K]) => {
    const next = { ...filters, [key]: value };
    setFilters(next);
    onFiltersChange?.(next);
  };

  const toggleFeature = (item: string) => {
    const set = new Set(filters.features);
    if (set.has(item)) {
      set.delete(item);
    } else {
      set.add(item);
    }
    update('features', Array.from(set));
  };

  return (
    <div className={`bg-white p-4 sm:p-5 rounded-lg shadow-md ${className ?? ''}`}>
      <h2 className="text-lg font-semibold mb-4">Filtros de salas</h2>

      <div className="grid gap-4 md:grid-cols-3">
        {/* Búsqueda por nombre/ubicación */}
        <div className="flex items-center gap-2">
          <Search className="h-4 w-4 text-gray-500" />
          <input
            type="text"
            className="border border-blue-400 rounded-lg p-2 text-sm w-full"
            placeholder="Buscar por sala o ubicación…"
            value={filters.query}
            onChange={(e) => update('query', e.target.value)}
          />
        </div>

        {/* Ubicación */}
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-gray-500 shrink-0" />
          <select
            value={filters.location}
            onChange={(e) => update('location', e.target.value)}
            className="border border-blue-400 rounded-lg p-2 text-sm w-full"
          >
            <option value="all">Todas las ubicaciones</option>
            {options.locations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>

        {/* Capacidad mínima */}
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-gray-500 shrink-0" />
          <input
            type="number"
            min={0}
            inputMode="numeric"
            className="border border-blue-400 rounded-lg p-2 text-sm w-full"
            placeholder="Capacidad mínima"
            value={filters.capacityMin}
            onChange={(e) => update('capacityMin', e.target.value === '' ? '' : Number(e.target.value))}
          />
        </div>

        {/* Estado (status) */}
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-gray-500 shrink-0" />
          <select
            value={filters.status}
            onChange={(e) => update('status', e.target.value as RoomFilters['status'])}
            className="border border-blue-400 rounded-lg p-2 text-sm w-full"
          >
            <option value="all">Todos los estados</option>
            <option value="AVAILABLE">Disponibles</option>
            <option value="MAINTENANCE">En mantenimiento</option>
            <option value="UNAVAILABLE">No disponibles</option>
          </select>
        </div>

        {/* Utilización mínima (%) */}
        <div className="flex items-center gap-2">
          <Gauge className="h-4 w-4 text-gray-500 shrink-0" />
          <input
            type="number"
            min={0}
            max={100}
            inputMode="numeric"
            className="border border-blue-400 rounded-lg p-2 text-sm w-full"
            placeholder="Utilización mínima (%)"
            value={filters.utilizationMin}
            onChange={(e) => update('utilizationMin', e.target.value === '' ? '' : Number(e.target.value))}
          />
        </div>

        {/* Reservas de hoy (mínimo) */}
        <div className="flex items-center gap-2">
          <CalendarDays className="h-4 w-4 text-gray-500 shrink-0" />
          <input
            type="number"
            min={0}
            inputMode="numeric"
            className="border border-blue-400 rounded-lg p-2 text-sm w-full"
            placeholder="Mín. reservas hoy"
            value={filters.reservationsTodayMin}
            onChange={(e) => update('reservationsTodayMin', e.target.value === '' ? '' : Number(e.target.value))}
          />
        </div>

        {/* Features (multi-selección con chips) */}
        <div className="md:col-span-3">
          <label className="block text-sm font-medium text-gray-700 mb-2">Características</label>
          <div className="flex flex-wrap gap-2">
            {options.features.map((feat) => {
              const checked = filters.features.includes(feat);
              return (
                <label
                  key={feat}
                  className={`cursor-pointer select-none border rounded-full px-3 py-1 text-xs
                    ${checked ? 'bg-blue-50 border-blue-400 text-blue-700' : 'bg-white border-gray-300 text-gray-700'}`}
                >
                  <input type="checkbox" className="sr-only" checked={checked} onChange={() => toggleFeature(feat)} />
                  {feat}
                </label>
              );
            })}
            {options.features.length === 0 && (
              <span className="text-xs text-gray-500">Sin datos de características</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
