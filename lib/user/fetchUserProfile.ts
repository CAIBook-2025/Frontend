import { mockUserProfileResponse } from '@/lib/mocks/mockUserProfile';

const shouldUseMockApi = process.env.NEXT_PUBLIC_API_MODE === 'mock';

export type UserProfile = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string | null;
  is_representative: boolean;
  is_moderator: boolean;
  is_deleted?: boolean;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  auth0_id: string;
  career: string | null;
  phone: string | null;
  student_number: string | null;
};

export type UserScheduleItem = {
  id: number;
  roomName: string;
  location: string;
  day: string;
  module: number;
  status: string;
  available: string;
  isFinished: boolean;
};

export type UserProfileResponse = {
  user: UserProfile | null;
  schedule: UserScheduleItem[];
  scheduleCount: number;
  strikes: unknown[];
  strikesCount: number;
  upcomingEvents: unknown[];
  upcomingEventsCount: number;
  attendances: unknown[];
  attendancesCount: number;
};

export async function fetchUserProfile(accessToken: string | null): Promise<UserProfileResponse | null> {
  if (shouldUseMockApi) {
    return mockUserProfileResponse;
  }

  if (!accessToken) {
    console.warn('fetchUserProfile called without access token');
    return null;
  }

  try {
    const profile_response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/check`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const profile = await profile_response.json();

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/${profile.user.id}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch user profile', response.status, response.statusText);
      return null;
    }

    const data = (await response.json()) as UserProfileResponse;

    if (!data.user) {
      console.warn('User profile not found in response');
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}
