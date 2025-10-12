// app/StudentDashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import type { Metadata } from 'next';
import { PersonalView } from '@/components/dashboard/PersonalView';
import { GroupsView } from '@/components/dashboard/GroupsView';
import { useUser } from '@auth0/nextjs-auth0';
import { getAccessToken } from '@auth0/nextjs-auth0';
import Link from 'next/link';

// Nota: Para que la metadata funcione en un Client Component, debe exportarse desde la página
// o, idealmente, desde un layout.tsx en la misma carpeta.
// export const metadata: Metadata = {
//   title: "Dashboard - CAIBook",
//   description: "Tu panel de control personal en CAIBook.",
// };

type ScheduleItem = {
  id: number;
  status?: 'CONFIRMED' | 'PENDING' | 'CANCELLED';
  startsAt?: string; // ISO
  endsAt?: string;   // ISO
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
}

type ProfileData = {
  user: { id: number; first_name: string; last_name: string; email: string };
  schedule: ScheduleItem[];
  scheduleCount: number;
  // events?: EventItem[];   // si tu backend aún no los manda, puede ser opcional
  strikes?: StrikeItem[];       // idem
  strikesCount: number
};


type ViewMode = 'personal' | 'groups';

export default function StudentDashboardPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('personal');
  // TODO: Obtener el nombre del usuario desde la sesión de NextAuth.js
  // const userName = "Juan"; // Placeholder
  const { user } = useUser();

  const [profile, setProfile] = useState<ProfileData | null>(null);

  console.log(process.env.NEXT_PUBLIC_API_URL);

  const [userData, setUserData] = useState(null);
  const [accessToken, setAccessToken] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAccessToken() {
      if (user) {
        try {
          const accessToken = await getAccessToken();
          setAccessToken(accessToken);
        } catch (error) {
          console.error('Error fetching access token:', error);
        }
      }
    }

    fetchAccessToken();
  }, [user]);

  useEffect(() => {
    async function fetchUserData() {
      if (accessToken) {
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/profile`, {
            headers: {
              Authorization: `Bearer ${accessToken}`
            }
          });

          if (res.ok) {
            const data: ProfileData = await res.json();
            setProfile(data);
          } else {
            console.error('Backend error:', res.status, res.statusText);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        } finally {
          setLoading(false);
        }
      }
    }

    if (user) fetchUserData();
  }, [accessToken]);

  if (loading) return (
    <div>
      Loading...
      <div>
        <a href="/auth/logout">Logout</a>
      </div>
    </div>);
  if (!profile) return <div>No pudimos cargar tu perfil.</div>;

  const reservasActivas = (profile.schedule || [])
  // .filter(s => s.status === 'CONFIRMED').length;
  const reservasActivasCount = (profile.scheduleCount || 0);
  // const eventosProximos = (profile.events || []).length;
  const strikes = profile.strikes;
  const strikesNumber = (profile.strikesCount ?? 1000);

  return (
    <main className="container mx-auto px-4 py-8 md:py-12">
      {/* 1. Encabezado de Bienvenida y Selector */}
      <section className="mb-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-4xl font-extrabold text-gray-800">
              ¡Bienvenido, <span className="text-blue-600">{profile.user.first_name}</span>!
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
        {viewMode === 'personal' ? (
          <PersonalView
            stats={{ reservasActivas: reservasActivasCount, strikes: strikesNumber, userId: profile.user.id }}
          />) : <GroupsView userId={profile.user.id} />}
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