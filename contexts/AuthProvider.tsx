'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { useUser } from '@auth0/nextjs-auth0';
import { getAccessToken } from '@auth0/nextjs-auth0';

export interface DbUser {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
}

export interface UserProfile {
  user: DbUser | null;
  schedule: any[];
  scheduleCount: number;
  strikes: any[];
  strikesCount: number;
  upcomingEvents: any[];
  upcomingEventsCount: number;
  attendances: any[];
  attendancesCount: number;
}

interface Ctx {
  user: DbUser | null;
  profile: UserProfile | null;
  loading: boolean;
  accessToken: string | null;
  refreshProfile: (force?: boolean) => Promise<void>;
}

const UserContext = createContext<Ctx>({
  user: null,
  profile: null,
  loading: true,
  accessToken: null,
  refreshProfile: async () => {},
});

export function UserProvider({
  isAuthenticated,
  initialProfile = null,
  children,
}: {
  isAuthenticated: boolean;
  initialProfile?: UserProfile | null;
  children: React.ReactNode;
}) {
  const { user: auth0User, isLoading: auth0Loading } = useUser();

  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(initialProfile);
  const [loading, setLoading] = useState<boolean>(isAuthenticated && !initialProfile);

  useEffect(() => {
    const fetchToken = async () => {
      if (auth0Loading) return;
      if (!auth0User) {
        setAccessToken(null);
        setLoading(false);
        setProfile(null);
        return;
      }
      try {
        const token = await getAccessToken(); // 👈 tu método existente
        setAccessToken(token as unknown as string); // tipos del lib pueden venir laxos
      } catch (err) {
        console.error('Error obteniendo access token:', err);
        setAccessToken(null);
      }
    };
    fetchToken();
  }, [auth0User, auth0Loading]);

  const fetchProfile = useCallback(
    async (token?: string) => {
      const t = token ?? accessToken;
      if (!t) {
        setProfile(null);
        return;
      }
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/profile`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${t}`,
          },
        });
        if (res.ok) {
          const data: UserProfile = await res.json();
          setProfile(data);
        } else if (res.status === 401) {
          // token inválido/expirado → limpiar y forzar nuevo token en el próximo ciclo
          console.warn('401 desde /users/profile, limpiando token.');
          setAccessToken(null);
          setProfile(null);
        } else {
          console.error('Error de backend:', res.status, res.statusText);
          setProfile(null);
        }
      } catch (e) {
        console.error('Error fetch /users/profile:', e);
        setProfile(null);
      }
    },
    [accessToken]
  );

  useEffect(() => {
    const go = async () => {
      if (auth0Loading) return;
      setLoading(true);
      if (!auth0User || !accessToken) {
        setProfile(null);
        setLoading(false);
        return;
      }
      await fetchProfile(accessToken);
      setLoading(false);
    };
    go();
  }, [accessToken, auth0Loading, auth0User, fetchProfile]);

  const refreshProfile = useCallback(
    async (force = false) => {
      if (force) {
        // intenta renovar token si esta nulo
        if (!accessToken && auth0User) {
          try {
            const token = await getAccessToken();
            setAccessToken(token as unknown as string);
            await fetchProfile(token as unknown as string);
            return;
          } catch (e) {
            console.error('No se pudo refrescar token:', e);
          }
        }
      }
      await fetchProfile();
    },
    [accessToken, auth0User, fetchProfile]
  );

  const value = useMemo(
    () => ({
      user: profile?.user ?? null,
      profile,
      loading,
      accessToken,
      refreshProfile,
    }),
    [profile, loading, accessToken, refreshProfile]
  );

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export const useDbUser = () => useContext(UserContext);
