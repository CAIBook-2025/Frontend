export type StudyRoom = {
  id: number;
  name: string;
  location: string | null;
  capacity: number | null;
  equipment: unknown;
};

export type ScheduleUser = {
  id?: number | string;
  first_name?: string;
  last_name?: string;
  email?: string;
  career?: string | null;
};

export type ScheduleItem = {
  id: number;
  sr_id?: number;
  day: string;
  module: string;
  available: string;
  studyRoom: StudyRoom | null;
  createdAt?: string;
  updatedAt?: string;
  user?: ScheduleUser | null;
};

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
  day: '2025-11-03',
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
      console.error('Failed to fetch schedule', response.status, response.statusText);
      return null;
    }

    const data = (await response.json()) as ScheduleResponse;

    if (!data || !Array.isArray(data.items)) {
      console.warn('Schedule response missing items array');
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching schedule:', error);
    return null;
  }
}
