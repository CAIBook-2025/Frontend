'use client';

import { Loader2 } from 'lucide-react';

export const LoadingRooms = () => (
  <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-gray-300 bg-white p-8 text-center text-gray-600">
    <Loader2 className="h-8 w-8 animate-spin text-brand-primary" />
    <div>
      <p className="font-medium text-gray-800">Procesando datos de salas</p>
      <p className="text-sm text-gray-500">Cargando salas, horarios y ocupaci��n...</p>
    </div>
  </div>
);

