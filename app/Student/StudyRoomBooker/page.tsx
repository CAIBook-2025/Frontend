// app/book-room/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

// Importamos los componentes, incluyendo el nuevo DaySelector
import { SearchInput } from '@/components/ui/SearchInput';
import { Room, RoomCard } from '@/components/book-room/RoomCard';
import { ViewToggler } from '@/components/book-room/ViewToggler';
import { DaySelector } from '@/components/book-room/DaySelector';

// --- SIMULACIÓN DE API (sin cambios) ---
const fakeApiFetchRooms = (): Promise<Room[]> => {
  return new Promise(resolve => {
    setTimeout(() => {
      const allEquipment: Room['equipment'] = ['Pizarra', 'Proyector', 'WiFi', 'Enchufes', 'Mesa grande'];
      const sampleRooms: Room[] = Array.from({ length: 15 }, (_, i) => ({
        id: i + 1,
        name: `Sala ${i % 3 === 0 ? 'Grupal' : 'de Estudio'} ${String.fromCharCode(65 + i)}`,
        location: i % 2 === 0 ? `Biblioteca Central - Piso ${i % 4 + 1}` : `Centro de Estudiantes - Piso ${i % 2 + 1}`,
        capacity: 2 + Math.floor(Math.random() * 8),
        nextAvailable: `${(new Date().getHours() + 1 + Math.floor(Math.random() * 5)) % 24}:00`.padStart(5, '0'),
        status: Math.random() > 0.3 ? 'Disponible' : 'Ocupada',
        equipment: allEquipment.filter(() => Math.random() > 0.5).slice(0, 4),
      }));
      resolve(sampleRooms);
    }, 1500);
  });
};

export default function BookRoomPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  // --- NUEVO ESTADO PARA LA FECHA SELECCIONADA ---
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    const loadRooms = async () => {
      setIsLoading(true);
      // TODO: En el futuro, la API debería recibir la fecha seleccionada: fakeApiFetchRooms(selectedDate)
      const fetchedRooms = await fakeApiFetchRooms();
      setRooms(fetchedRooms);
      setIsLoading(false);
    };
    loadRooms();
  }, [selectedDate]); // Se vuelve a ejecutar si selectedDate cambia

  return (
    <main className="container mx-auto px-4 py-8 md:py-12">
      {/* 1. Filtros de Búsqueda */}
      <section className="mb-8 rounded-xl border border-slate-200 bg-white p-6 shadow">
        <h2 className="text-2xl font-bold text-brand-dark mb-4">Buscar Salas</h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <SearchInput 
            id="search" 
            label="Buscar por nombre o edificio"
            placeholder="Ej: Biblioteca, Sala A1..."
          />
          <div>
            <label htmlFor="capacity" className="block text-sm font-medium text-slate-700 mb-1">Capacidad mínima</label>
            <select id="capacity" className="w-full rounded-md border-slate-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary">
              <option>Cualquier capacidad</option>
              <option>2+ personas</option>
              <option>4+ personas</option>
              <option>6+ personas</option>
              <option>8+ personas</option>
            </select>
          </div>
          {/* --- REEMPLAZAMOS EL INPUT DE FECHA POR NUESTRO COMPONENTE --- */}
          {/* Ocupará una columna completa en pantallas pequeñas y una columna en medianas */}
          <div className="md:col-span-1">
             {/* No es necesario un div extra, el componente ya tiene su label */}
          </div>
        </div>
        <div className="mt-4">
            <DaySelector selectedDate={selectedDate} onDateChange={setSelectedDate} />
        </div>
      </section>

      {/* 2. Selector de Vista */}
      <section className="mb-6 flex justify-end">
        <ViewToggler viewMode={viewMode} setViewMode={setViewMode} />
      </section>

      {/* 3. Contenido Principal (Lista o Mapa) */}
      <section>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Loader2 className="h-12 w-12 animate-spin text-brand-primary" />
            <p className="mt-4 text-lg text-slate-600">Buscando salas para el {selectedDate}...</p>
          </div>
        ) : (
          viewMode === 'list' ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {rooms.map(room => (
                <RoomCard key={room.id} room={room} />
              ))}
            </div>
          ) : (
            <div className="flex h-96 items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-white text-slate-500 shadow-sm">
              <p className="text-lg">Aquí irá el componente del mapa interactivo.</p>
            </div>
          )
        )}
      </section>
    </main>
  );
}