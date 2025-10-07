// components/dashboard/AdminToolsCard.tsx
"use client";

import Link from "next/link";
import { Users, Building2, AlertTriangle } from "lucide-react";


export const AdminToolsCard = () => {
  return (
    <div className="w-full rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="mb-4 text-lg font-semibold text-gray-800">
        Herramientas de Administración
      </h3>

      <div className="grid gap-4 md:grid-cols-3">
        <Link
          href="/Admin/Groups"
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow transition-colors hover:bg-blue-700"
        >
          <Users className="mr-2 h-4 w-4" />
          Gestionar Grupos
        </Link>

        <Link
          href="/Admin/Room"
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow transition-colors hover:bg-amber-600"
        >
          <Building2 className="mr-2 h-4 w-4" />
          Administrar Salas
        </Link>

        <Link
          href="/Admin/Strikes"
          className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow transition-colors hover:bg-red-700"
        >
          <AlertTriangle className="mr-2 h-4 w-4" />
          Sistema de Strikes
        </Link>
      </div>
    </div>
  );
};
