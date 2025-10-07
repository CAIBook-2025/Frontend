// app/StudentDashboard/page.tsx
'use client';

import { useState } from 'react';
import type { Metadata } from 'next';
import { PersonalView } from '@/components/dashboard/PersonalView';
import { GroupsView } from '@/components/dashboard/GroupsView';

// Nota: Para que la metadata funcione en un Client Component, debe exportarse desde la página
// o, idealmente, desde un layout.tsx en la misma carpeta.
// export const metadata: Metadata = {
//   title: "Dashboard - CAIBook",
//   description: "Tu panel de control personal en CAIBook.",
// };

type ViewMode = 'personal' | 'groups';

export default function StudentDashboardPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('personal');
  // TODO: Obtener el nombre del usuario desde la sesión de NextAuth.js
  const userName = "Juan"; // Placeholder

  return (
    <main className="container mx-auto px-4 py-8 md:py-12">
      {/* 1. Encabezado de Bienvenida y Selector */}
      <section className="mb-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-800">
              ¡Bienvenido, <span className="text-blue-600">{userName}</span>!
            </h1>
            <p className="mt-2 text-lg text-slate-600">
              Es genial tenerte de vuelta. ¿Qué te gustaría hacer hoy?
            </p>
          </div>
          {/* Selector de Vista */}
          <div className="mt-4 sm:mt-0 flex items-center rounded-full bg-slate-100 p-1">
            <button
              onClick={() => setViewMode('personal')}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${viewMode === 'personal' ? 'bg-white shadow text-blue-600' : 'text-slate-600'}`}
            >
              Personal
            </button>
            <button
              onClick={() => setViewMode('groups')}
              className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${viewMode === 'groups' ? 'bg-white shadow text-blue-600' : 'text-slate-600'}`}
            >
              Grupos
            </button>
          </div>
        </div>
      </section>

      {/* 2. Renderizado Condicional de la Vista */}
      <div>
        {viewMode === 'personal' ? <PersonalView /> : <GroupsView />}
      </div>
    </main>
  );
}