// components/dashboard/UserView.tsx
'use client';

import { useState, useEffect } from 'react';
import { getAccessToken, useUser } from '@auth0/nextjs-auth0';
import {
  Users,
  Crown,
  Shield,
  Star,
  Loader2,
  Calendar,
  Target,
} from 'lucide-react';

// --- Tipos basados en la API ---
interface GroupRequest {
  id: number;
  name: string;
  description: string;
  goal: string;
  logo: string | null;
  status: string;
}

interface Representative {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

interface Moderator {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

interface GroupDetails {
  id: number;
  reputation: string;
  repre_id: number;
  group_request_id: number;
  moderators_ids: number[];
  createdAt: string;
  updatedAt: string;
  groupRequest: GroupRequest;
  representative: Representative;
  moderators: Moderator[];
  eventRequests?: any[];
}

interface UserViewProps {
  groupId: string;
}

// --- Componente para Estadísticas ---
const StatCard = ({ icon, value, label }: { icon: React.ReactNode; value: string | number; label: string }) => (
  <div className="rounded-lg bg-white p-4 shadow-sm border border-slate-200">
    <div className="flex items-center gap-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600">{icon}</div>
      <div>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
        <p className="text-sm text-slate-500">{label}</p>
      </div>
    </div>
  </div>
);

// --- Componente Principal ---
export const UserView = ({ groupId }: UserViewProps) => {
  const { user, isLoading: isUserLoading } = useUser();
  const [groupDetails, setGroupDetails] = useState<GroupDetails | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Obtener access token
  useEffect(() => {
    async function fetchAccessToken() {
      if (user) {
        try {
          const token = await getAccessToken();
          setAccessToken(token);
        } catch (error) {
          console.error('Error fetching access token:', error);
          setError('Error al autenticar');
        }
      }
    }

    fetchAccessToken();
  }, [user]);

  // Cargar detalles del grupo
  useEffect(() => {
    const loadGroupDetails = async () => {
      if (!accessToken) return;

      setIsLoading(true);
      try {
        console.log('Fetching group details for groupId:', groupId);
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/groups/${groupId}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });

        if (!response.ok) {
          throw new Error('Error al cargar los detalles del grupo');
        }

        const data = await response.json();
        setGroupDetails(data);
      } catch (error) {
        console.error('Error loading group details:', error);
        setError('Error al cargar los detalles del grupo');
      } finally {
        setIsLoading(false);
      }
    };

    if (accessToken) loadGroupDetails();
  }, [accessToken, groupId]);

  const getMemberCount = (): number => {
    if (!groupDetails) return 0;
    return 1 + groupDetails.moderators.length; // 1 representante + N moderadores
  };

  if (isLoading || isUserLoading) {
    return (
      <div className="flex justify-center items-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  if (error || !groupDetails) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-red-800 font-semibold">{error || 'Error al cargar el grupo'}</p>
      </div>
    );
  }

  return (
    <>
      {/* 1. Header con información del grupo */}
      <section className="mb-8">
        <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-blue-50 to-white p-8 shadow-sm">
          <div className="max-w-4xl">
            <div className="flex items-start gap-4 mb-4">
              {groupDetails.groupRequest.logo ? (
                <img
                  src={groupDetails.groupRequest.logo}
                  alt={groupDetails.groupRequest.name}
                  className="h-20 w-20 rounded-xl object-cover border-2 border-blue-200"
                />
              ) : (
                <div className="h-20 w-20 rounded-xl bg-blue-200 flex items-center justify-center">
                  <Users className="h-10 w-10 text-blue-600" />
                </div>
              )}
              <div className="flex-1">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">{groupDetails.groupRequest.name}</h1>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                    <span className="font-medium text-slate-700">{groupDetails.reputation}/5.0</span>
                  </div>
                  <span className="text-slate-400">•</span>
                  <div className="flex items-center gap-1 text-slate-600">
                    <Calendar className="h-4 w-4" />
                    <span>Creado el {new Date(groupDetails.createdAt).toLocaleDateString('es-CL')}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Descripción */}
            <div className="mt-6 space-y-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Descripción
                </h3>
                <p className="text-slate-600 leading-relaxed">{groupDetails.groupRequest.description}</p>
              </div>

              {/* Objetivo */}
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                  <Target className="h-4 w-4" />
                  Objetivo
                </h3>
                <p className="text-slate-600 leading-relaxed">{groupDetails.groupRequest.goal}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Estadísticas del Grupo */}
      <section className="mb-12 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard icon={<Users size={20} />} value={getMemberCount()} label="Miembros del Equipo" />
        <StatCard icon={<Shield size={20} />} value={groupDetails.moderators.length} label="Moderadores" />
        <StatCard icon={<Star size={20} />} value={groupDetails.reputation} label="Reputación" />
      </section>

      {/* 3. Información del Equipo de Gestión */}
      <section>
        <h2 className="text-2xl font-bold text-gray-800 mb-6">Equipo de Gestión</h2>

        <div className="space-y-4">
          {/* Representante */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="p-4 bg-gradient-to-r from-amber-50 to-white border-b border-slate-200">
              <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                <Crown className="h-5 w-5 text-amber-500" />
                Representante
              </h3>
            </div>
            <div className="p-4">
              <div className="flex items-center gap-3">
                <div className="h-14 w-14 rounded-full bg-gradient-to-br from-amber-100 to-amber-200 flex items-center justify-center border-2 border-amber-300">
                  <span className="text-amber-700 font-bold text-lg">
                    {groupDetails.representative.first_name[0]}
                    {groupDetails.representative.last_name[0]}
                  </span>
                </div>
                <div>
                  <p className="font-semibold text-gray-800 text-lg">
                    {groupDetails.representative.first_name} {groupDetails.representative.last_name}
                  </p>
                  <p className="text-sm text-slate-500">{groupDetails.representative.email}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Moderadores */}
          {groupDetails.moderators.length > 0 && (
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
              <div className="p-4 bg-gradient-to-r from-blue-50 to-white border-b border-slate-200">
                <h3 className="text-base font-bold text-gray-800 flex items-center gap-2">
                  <Shield className="h-5 w-5 text-blue-500" />
                  Moderadores ({groupDetails.moderators.length})
                </h3>
              </div>
              <ul className="divide-y divide-slate-200">
                {groupDetails.moderators.map((moderator) => (
                  <li key={moderator.id} className="p-4 hover:bg-slate-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center border-2 border-blue-300">
                        <span className="text-blue-700 font-bold">
                          {moderator.first_name[0]}
                          {moderator.last_name[0]}
                        </span>
                      </div>
                      <div>
                        <p className="font-semibold text-gray-800">
                          {moderator.first_name} {moderator.last_name}
                        </p>
                        <p className="text-sm text-slate-500">{moderator.email}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* 4. Información Adicional */}
      {/* <section className="mt-8">
        <div className="rounded-xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Información del Grupo</h3>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-slate-600 font-medium mb-1">Estado</p>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-800 rounded-full font-semibold">
                <span className="h-2 w-2 bg-green-500 rounded-full"></span>
                {groupDetails.groupRequest.status === 'CONFIRMED' ? 'Confirmado' : groupDetails.groupRequest.status}
              </span>
            </div>
            <div>
              <p className="text-slate-600 font-medium mb-1">Última actualización</p>
              <p className="text-gray-800">{new Date(groupDetails.updatedAt).toLocaleDateString('es-CL')}</p>
            </div>
          </div>
        </div>
      </section> */}

      {/* 5. Mensaje informativo */}
      <section className="mt-8">
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-6 text-center">
          <Users className="h-10 w-10 text-blue-600 mx-auto mb-3" />
          <p className="text-slate-700 font-medium mb-2">
            ¿Te interesa este grupo?
          </p>
          <p className="text-sm text-slate-600">
            Contacta al representante o a los moderadores para obtener más información sobre cómo participar.
          </p>
        </div>
      </section>
    </>
  );
};