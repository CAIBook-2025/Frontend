export type UserProfile = {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string | null;
  is_representative: boolean;
  is_moderator: boolean;
  createdAt: string;
  updatedAt: string;
  auth0_id: string;
  career: string | null;
  phone: string | null;
  student_number: string | null;
};

type UserProfileResponse = {
  exists: boolean;
  user: UserProfile | null;
};

export async function fetchUserProfile(accessToken: string | null): Promise<UserProfile | null> {
  if (!accessToken) {
    console.warn('fetchUserProfile called without access token');
    return null;
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/check`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch user profile', response.status, response.statusText);
      return null;
    }

    const data = (await response.json()) as UserProfileResponse;

    if (!data.exists || !data.user) {
      console.warn('User profile not found in response');
      return null;
    }

    return data.user;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}
