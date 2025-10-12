// components/dashboard/AdminToolsCard.tsx
'use client';

import Link from 'next/link';
import { Users, Building2, AlertTriangle } from 'lucide-react';

export const AdminToolsCard = () => {
  return (
    <div className={`w-full rounded-xl border border-gray-200 p-6 shadow-sm`}>
      <h3 className="mb-4 text-lg font-semibold text-gray-800">Herramientas de Administración</h3>

      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/Admin/Groups" className="w-full">
          <button className="flex w-full items-center rounded-lg bg-blue-500 px-4 py-2 text-white transition-colors hover:bg-blue-600">
            <Users className="mr-2 h-4 w-4" />
            Gestionar Grupos
          </button>
        </Link>

        <Link href="/Admin/Room" className="w-full">
          <button className="flex w-full items-center rounded-lg bg-yellow-500 px-4 py-2 text-white transition-colors hover:bg-yellow-600">
            <Building2 className="mr-2 h-4 w-4" />
            Administrar Salas
          </button>
        </Link>

        <Link href="/Admin/Strikes" className="w-full">
          <button className="flex w-full items-center rounded-lg bg-red-500 px-4 py-2 text-white transition-colors hover:bg-red-600">
            <AlertTriangle className="mr-2 h-4 w-4" />
            Sistema de Strikes
          </button>
        </Link>
      </div>
    </div>
  );
};
