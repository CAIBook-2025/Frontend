// app/StudentDashboard/page.tsx
'use client';

import { useState } from 'react';
import { PersonalView } from '@/components/dashboard/PersonalView';
import { GroupsView } from '@/components/dashboard/GroupsView';
import { useUser } from '@auth0/nextjs-auth0';
import { getAccessToken } from '@auth0/nextjs-auth0';
import Link from 'next/link';

// --- Componente Skeleton para el Encabezado ---
// Muestra una UI de carga mientras se obtienen los datos del usuario.
const DashboardHeaderSkeleton = () => (
  <section className="mb-10 animate-pulse">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="h-10 w-64 bg-slate-200 rounded-lg"></div>
        <div className="h-6 w-80 bg-slate-200 rounded-lg mt-3"></div>
      </div>
      <div className="mt-4 sm:mt-0 h-10 w-40 bg-slate-200 rounded-full"></div>
    </div>
  </section>
);

type ScheduleItem = {
  id: number;
  status?: 'CONFIRMED' | 'PENDING' | 'CANCELLED';
  startsAt?: string; // ISO
  endsAt?: string; // ISO
  roomName?: string;
};

type EventItem = {
  id: number;
  title: string;
  when: string; // ISO
  status?: 'REGISTERED' | 'OPEN';
};

type StrikeItem = {
  id: number;
  student_id: number;
  type: string;
  date: string;
  admin_id: number;
};

type ProfileData = {
  user: { id: number; first_name: string; last_name: string; email: string };
  schedule: ScheduleItem[];
  scheduleCount: number;
  // events?: EventItem[];   // si tu backend aún no los manda, puede ser opcional
  strikes?: StrikeItem[]; // idem
  strikesCount: number;
};

type ViewMode = 'personal' | 'groups';

export default function StudentDashboardPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('personal');
  
  // 2. USAMOS el hook para obtener el usuario y el estado de carga
  const { user, isLoading } = useUser();

  // 3. OBTENEMOS el nombre del usuario de forma segura
  // Si el usuario existe, usamos su nombre; si no, usamos un texto genérico.
  const userName = user?.name || "Usuario";

  return (
    <main className="container mx-auto px-4 py-8 md:py-12">
      {/* 4. RENDERIZADO CONDICIONAL del encabezado */}
      {isLoading ? (
        // Si está cargando, muestra el skeleton
        <DashboardHeaderSkeleton />
      ) : (
        // Si ya cargó, muestra el encabezado real con el nombre del usuario
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
      )}

      {/* El resto de la página no necesita esperar por el nombre de usuario */}
      <div>
        {viewMode === 'personal' ? (
          <PersonalView
            stats={{ reservasActivas: 1, strikes: 1, userId: 123 }}
          />
        ) : (
          <GroupsView userId={123} />
        )}
      </div>

      <Link
        href="/auth/logout"
        className="bg-slate-600 text-white font-bold py-2 px-6 rounded-full hover:bg-slate-800 transition-colors duration-300"
      >
        Cerrar Sesión
      </Link>
    </main>
  );
}
