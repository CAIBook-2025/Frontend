// app/book-room/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { Loader2 } from 'lucide-react';

// Importamos los componentes, incluyendo el nuevo DaySelector
import { SearchInput } from '@/components/ui/SearchInput';
import { Room, RoomCard } from '@/components/book-room/RoomCard';
import { ViewToggler } from '@/components/book-room/ViewToggler';
import { DaySelector } from '@/components/book-room/DaySelector';
import { useUser, getAccessToken } from '@auth0/nextjs-auth0';
import { fetchUserProfile, UserProfileResponse } from '@/lib/user/fetchUserProfile';

function normalizeEquipment(equ: any): string[] {
  try {
    // puede venir como objeto, arreglo o string JSON
    if (!equ) return [];
    if (Array.isArray(equ)) return equ.filter(Boolean).map(String);
    if (typeof equ === 'string') {
      const parsed = JSON.parse(equ);
      return normalizeEquipment(parsed);
    }
    if (typeof equ === 'object') {
      // {"1":"Pizarra","2":"Borrador"} -> ["Pizarra","Borrador"]
      return Object.values(equ).filter(Boolean).map(String);
    }
    return [];
  } catch {
    return [];
  }
}

export default function BookRoomPage() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfileResponse | null>(null);

  const { user } = useUser();
  // --- NUEVO ESTADO PARA LA FECHA SELECCIONADA ---
  const [selectedDate, setSelectedDate] = useState<string>(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (!user) return;
    let isMounted = true;

    const loadAccessToken = async () => {
      try {
        const token = await getAccessToken();
        if (isMounted) {
          setAccessToken(token ?? null);
        }
      } catch (error) {
        console.error('Error fetching access token:', error);
      }
    };

    loadAccessToken();
    return () => {
      isMounted = false;
    };
  }, [user]);

  useEffect(() => {
    if (!accessToken) return;
    let isMounted = true;

    const loadUserProfile = async () => {
      try {
        const profile = await fetchUserProfile(accessToken);
        if (isMounted) {
          setUserProfile(profile);
        }
      } catch (error) {
        console.error('Error fetching user profile:', error);
      }
    };

    loadUserProfile();
    return () => {
      isMounted = false;
    };
  }, [accessToken]);

  useEffect(() => {
    const loadRooms = async () => {
      setIsLoading(true);
      // TODO: En el futuro, la API debería recibir la fecha seleccionada: fakeApiFetchRooms(selectedDate)

      const params = new URLSearchParams({
        day: selectedDate, // "YYYY-MM-DD"
        take: '30',
        page: '1',
      });

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/srSchedule?${params.toString()}`, {
        cache: 'no-store',
      });

      if (!res.ok) {
        throw new Error(`Error HTTP ${res.status}`);
      }

      const data = await res.json(); // { page, take, total, items }

      const roomsAdapted = (data.items ?? []).map((s: any) => {
        const r = s.studyRoom ?? {};
        return {
          id: s.id ?? r.id,
          name: r.name ?? `Sala ${s.sr_id}`,
          location: r.location ?? '',
          capacity: r.capacity ?? 0,
          equipment: normalizeEquipment(r.equipment), // 👈 aquí
          status: s.available === 'AVAILABLE' ? 'Disponible' : 'Ocupada',
          nextAvailable: '—',
          day: s.day,
          module: s.module,
        };
      });

      setRooms(roomsAdapted);
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
          <SearchInput id="search" label="Buscar por nombre o edificio" placeholder="Ej: Biblioteca, Sala A1..." />
          <div>
            <label htmlFor="capacity" className="block text-sm font-medium text-slate-700 mb-1">
              Capacidad mínima
            </label>
            <select
              id="capacity"
              className="w-full rounded-md border-slate-300 shadow-sm focus:border-brand-primary focus:ring-brand-primary"
            >
              <option>Cualquier capacidad</option>
              <option>2+ personas</option>
              <option>4+ personas</option>
              <option>6+ personas</option>
              <option>8+ personas</option>
            </select>
          </div>
          {/* --- REEMPLAZAMOS EL INPUT DE FECHA POR NUESTRO COMPONENTE --- */}
          {/* Ocupará una columna completa en pantallas pequeñas y una columna en medianas */}
          <div className="md:col-span-1">{/* No es necesario un div extra, el componente ya tiene su label */}</div>
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
        ) : viewMode === 'list' ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.isArray(rooms) && rooms.length > 0 ? (
              rooms.map((room) => (
                <RoomCard key={room.id} room={room} scheduleId={room.id} userId={userProfile?.user?.id} />
              ))
            ) : (
              <p>No hay salas disponibles.</p>
            )}
          </div>
        ) : (
          <div className="flex h-96 items-center justify-center rounded-xl border-2 border-dashed border-slate-300 bg-white text-slate-500 shadow-sm">
            <p className="text-lg">Aquí irá el componente del mapa interactivo.</p>
          </div>
        )}
      </section>
    </main>
  );
}
