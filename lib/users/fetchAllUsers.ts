import { UserProfile } from '@/types/userProfile';

export type UsersResponse = {
  items: UserProfile[];
  page: number;
  take: number;
  total: number;
};

export async function fetchAllUsers(token: string, page: number = 1, take: number = 10): Promise<UsersResponse | null> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users?page=${page}&take=${take}`, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      console.error('Error fetching users:', response.statusText);
      return null;
    }

    const data = await response.json();
    console.log('fetchAllUsers response:', data);
    return data;
  } catch (error) {
    console.error('Error in fetchAllUsers:', error);
    return null;
  }
}
