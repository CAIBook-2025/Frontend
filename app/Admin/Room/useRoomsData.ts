'use client';

import { useCallback, useEffect, useState } from 'react';
import { useUser, getAccessToken } from '@auth0/nextjs-auth0';
import { fetchSchedule } from '@/lib/schedule/fetchSchedule';
import { fetchStudyRooms } from '@/lib/studyRooms/fetchStudyRooms';
import type { Room } from '@/types/room';
import { DEFAULT_DAY } from './constants';
import { adaptStudyRoomsToView, mergeRoomsWithScheduleData, resolveAccessToken } from './room-utils';

export const useRoomsData = () => {
  const { user, isLoading: isUserLoading } = useUser();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadRooms = useCallback(async () => {
    if (!user) return;
    setIsLoadingRooms(true);
    setLoadError(null);

    try {
      const tokenResponse = await getAccessToken();
      const accessToken = resolveAccessToken(tokenResponse);

      if (!accessToken) {
        throw new Error('Access token not available');
      }

      const [studyRooms, schedule] = await Promise.all([
        fetchStudyRooms(accessToken),
        fetchSchedule(accessToken, { day: DEFAULT_DAY, take: 200 }),
      ]);

      if (!studyRooms) {
        throw new Error('Study rooms response empty');
      }

      const baseRooms = adaptStudyRoomsToView(studyRooms);
      const scheduleItems = schedule?.items ?? [];
      const mergedRooms =
        scheduleItems.length > 0 ? mergeRoomsWithScheduleData(baseRooms, scheduleItems) : baseRooms;

      if (scheduleItems.length === 0) {
        console.warn('fetchSchedule returned no items; occupancy metrics may not be accurate');
      }

      setRooms(mergedRooms);
    } catch (error) {
      console.error('Error fetching data for admin room page', error);
      setRooms([]);
      setLoadError('No se pudieron cargar las salas y sus horarios.');
    } finally {
      setIsLoadingRooms(false);
    }
  }, [user]);

  useEffect(() => {
    if (isUserLoading) return;

    if (!user) {
      setRooms([]);
      setLoadError('Debes iniciar sesion para ver las salas.');
      setIsLoadingRooms(false);
      return;
    }

    void loadRooms();
  }, [isUserLoading, user, loadRooms]);

  return {
    rooms,
    setRooms,
    isLoadingRooms,
    loadError,
    refresh: loadRooms,
  };
};

