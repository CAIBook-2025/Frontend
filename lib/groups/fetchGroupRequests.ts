import { GroupRequest } from '@/types/groupRequest';

export async function fetchGroupRequests(
  accessToken: string | null,
  filters?: { status?: string; user_id?: number }
): Promise<GroupRequest[] | null> {
  if (!accessToken) {
    console.warn('fetchGroupRequests called without access token');
    return null;
  }

  try {
    const queryParams = new URLSearchParams();
    if (filters?.status) {
      queryParams.append('status', filters.status);
    }
    if (filters?.user_id) {
      queryParams.append('user_id', filters.user_id.toString());
    }

    const queryString = queryParams.toString();
    const url = `${process.env.NEXT_PUBLIC_API_URL}/api/group-requests${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch group requests', response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    return data as GroupRequest[];
  } catch (error) {
    console.error('Error fetching group requests:', error);
    return null;
  }
}
