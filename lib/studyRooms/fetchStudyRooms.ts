export type StudyRoomRecord = {
  id: number;
  name: string;
  capacity: number;
  equipment: string | string[] | Record<string, unknown> | null;
  location: string;
  createdAt: string;
  updatedAt: string;
};

export async function fetchStudyRooms(accessToken: string | null): Promise<StudyRoomRecord[] | null> {
  if (!accessToken) {
    console.warn('fetchStudyRooms called without access token');
    return null;
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/sRooms`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch study rooms', response.status, response.statusText);
      return null;
    }

    const data = (await response.json()) as StudyRoomRecord[] | { items?: StudyRoomRecord[] };

    if (Array.isArray(data)) {
      return data;
    }

    if (data && Array.isArray(data.items)) {
      return data.items;
    }

    console.warn('Study rooms response is empty or malformed');
    return null;
  } catch (error) {
    console.error('Error fetching study rooms:', error);
    return null;
  }
}
