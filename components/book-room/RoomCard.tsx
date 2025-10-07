// components/book-room/RoomCard.tsx
'use client';

import { MapPin, Users, Clock } from 'lucide-react';

// Reutilizamos los tipos que definimos en la página
type RoomStatus = 'Disponible' | 'Ocupada';
type Equipment = 'Pizarra' | 'Proyector' | 'WiFi' | 'Enchufes' | 'Mesa grande';

export interface Room {
  id: number;
  name: string;
  location: string;
  capacity: number;
  nextAvailable: string;
  status: RoomStatus;
  equipment: Equipment[];
}

export const RoomCard = ({ room }: { room: Room }) => {
  const isAvailable = room.status === 'Disponible';
  
  return (
    <div className="flex flex-col justify-between rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-shadow duration-300 hover:shadow-md">
      <div>
        <div className="flex items-start justify-between">
          <h3 className="text-xl font-bold text-gray-800">{room.name}</h3>
          <span className={`rounded-full px-3 py-1 text-xs font-semibold ${isAvailable ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'}`}>
            {room.status}
          </span>
        </div>
        <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
          <MapPin size={14} /> {room.location}
        </p>

        <div className="my-4 flex items-center gap-6 border-y border-slate-100 py-3 text-sm text-slate-600">
          <div className="flex items-center gap-2">
            <Users size={16} /> {room.capacity} personas
          </div>
          <div className="flex items-center gap-2">
            <Clock size={16} /> Próximo: {room.nextAvailable}
          </div>
        </div>

        <div>
          <h4 className="mb-2 text-sm font-medium text-slate-600">Equipamiento:</h4>
          <div className="flex flex-wrap gap-2">
            {room.equipment.length > 0 ? room.equipment.map(item => (
              <span key={item} className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-700">{item}</span>
            )) : <span className="text-xs text-slate-500">No especificado</span>}
          </div>
        </div>
      </div>

      {/* --- BOTÓN CORREGIDO CON COLORES ESTÁNDAR Y CURSOR --- */}
      <button
        disabled={!isAvailable}
        className={`
          mt-6 w-full rounded-lg px-4 py-2.5 font-semibold text-white transition-colors duration-300
          ${isAvailable 
            ? 'bg-blue-600 hover:bg-blue-700 cursor-pointer' // Estilo para el estado HABILITADO
            : 'bg-slate-400 cursor-not-allowed' // Estilo para el estado DESHABILITADO
          }
        `}
      >
        {isAvailable ? 'Reservar' : 'No Disponible'}
      </button>
    </div>
  );
};