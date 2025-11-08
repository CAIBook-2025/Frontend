import { ScheduleItem } from '@/types/schedule';

export type ScheduleResponse = {
  page: number;
  take: number;
  total: number;
  items: ScheduleItem[];
};

type ScheduleQuery = {
  day?: string;
  page?: number;
  take?: number;
};

const DEFAULT_QUERY: Required<ScheduleQuery> = {
  day: new Date().toISOString().split('T')[0],
  page: 1,
  take: 20,
};

export async function fetchSchedule(
  accessToken: string | null,
  query: ScheduleQuery = {}
): Promise<ScheduleResponse | null> {
  if (!accessToken) {
    console.warn('fetchSchedule called without access token');
    return null;
  }

  const params = new URLSearchParams({
    day: query.day ?? DEFAULT_QUERY.day,
    page: String(query.page ?? DEFAULT_QUERY.page),
    take: String(query.take ?? DEFAULT_QUERY.take),
  });

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/srSchedule?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch schedule', {
        status: response.status,
        statusText: response.statusText,
        params: Object.fromEntries(params.entries()),
      });
      return null;
    }

    const data = (await response.json()) as ScheduleResponse;

    if (!data || !Array.isArray(data.items)) {
      console.warn('Schedule response missing items array');
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching schedule:', {
      error,
      params: Object.fromEntries(params.entries()),
    });
    return null;
  }
}
