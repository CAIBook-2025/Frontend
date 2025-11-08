// app/StudentDashboard/page.tsx
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUser, getAccessToken } from '@auth0/nextjs-auth0';

// 1. IMPORTAMOS la función y los tipos de datos del perfil
import { fetchUserProfile, UserProfileResponse } from '@/lib/user/fetchUserProfile';

// 2. IMPORTAMOS los componentes de vista
import { PersonalView } from '@/components/dashboard/PersonalView';
import { GroupsView } from '@/components/dashboard/GroupsView';

// --- Componente Skeleton para el Encabezado ---
const DashboardHeaderSkeleton = () => (
  <section className="mb-10 animate-pulse">
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="h-10 w-64 rounded-lg bg-slate-200"></div>
        <div className="mt-3 h-6 w-80 rounded-lg bg-slate-200"></div>
      </div>
      <div className="sm:mt-0 mt-4 h-10 w-40 rounded-full bg-slate-200"></div>
    </div>
  </section>
);

// --- Componente Skeleton para la vista principal ---
const ViewSkeleton = () => (
    <div className="animate-pulse space-y-8">
        <div className="h-40 rounded-lg bg-slate-200"></div>
        <div className="h-64 rounded-lg bg-slate-200"></div>
    </div>
);


type ViewMode = 'personal' | 'groups';

export default function StudentDashboardPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('personal');
  
  // Renombramos 'isLoading' a 'authLoading' para evitar confusiones
  const { user, isLoading: authLoading } = useUser();

  // 3. NUEVOS ESTADOS para manejar los datos del perfil y su carga
  const [profileData, setProfileData] = useState<UserProfileResponse | null>(null);
  const [isProfileLoading, setIsProfileLoading] = useState(true);

  // 4. useEffect para OBTENER los datos del perfil cuando el usuario esté listo
  useEffect(() => {
    // Si Auth0 todavía está cargando, no hacemos nada.
    if (authLoading) return;

    // Si no hay usuario, la carga ha terminado.
    if (!user) {
      setIsProfileLoading(false);
      return;
    }

    const loadProfile = async () => {
      try {
        const accessToken = await getAccessToken();
        const data = await fetchUserProfile(accessToken);
        setProfileData(data); // Guardamos los datos en el estado
      } catch (error) {
        console.error("Dashboard: Failed to load user profile:", error);
        // Opcional: podrías poner un estado de error aquí para mostrar un mensaje
      } finally {
        // Importante: detenemos la carga tanto si tuvo éxito como si falló
        setIsProfileLoading(false);
      }
    };

    loadProfile();
  }, [user, authLoading]); // Se ejecuta cuando cambia el estado de autenticación

  // 5. CALCULAMOS las estadísticas a partir de los datos del perfil
  // Usamos optional chaining (?.) y el operador nullish (??) para evitar errores si los datos aún no llegan.
  const activeReservationsCount = profileData?.schedule?.filter(
  (res) => (res.status === 'PENDING' || res.status === 'PRESENT') && res.isFinished === false
).length ?? 0;

  const strikesCount = profileData?.strikesCount ?? 0;
  
  const userId = profileData?.user?.id ?? 0; // Usamos 0 o null como fallback

  // 6. OBTENEMOS el nombre del usuario desde nuestro backend para mayor consistencia
  const userName = profileData?.user?.first_name || user?.name || "Usuario";


  return (
    <main className="container mx-auto px-4 py-8 md:py-12">
      {/* El encabezado ahora usa el estado de carga del perfil */}
      {isProfileLoading ? (
        <DashboardHeaderSkeleton />
      ) : (
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

      {/* La vista principal también espera a que los datos del perfil carguen */}
      <div>
        {isProfileLoading ? (
          <ViewSkeleton />
        ) : viewMode === 'personal' ? (
          // 7. PASAMOS las estadísticas calculadas al componente PersonalView
          <PersonalView
            stats={{ 
              reservasActivas: activeReservationsCount, 
              strikes: strikesCount, 
              userId: userId 
            }}
          />
        ) : (
          <GroupsView userId={userId} />
        )}
      </div>

      <div className="mt-8">
        <Link
            href="/api/auth/logout" // Ruta correcta para cerrar sesión con Auth0
            className="bg-slate-600 text-white font-bold py-2 px-6 rounded-full hover:bg-slate-800 transition-colors duration-300"
        >
            Cerrar Sesión
        </Link>
      </div>
    </main>
  );
}