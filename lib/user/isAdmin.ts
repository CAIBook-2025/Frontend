import { fetchUserProfile } from './fetchUserProfile';

export async function isAdmin(accessToken: string | null): Promise<boolean> {
  const profile = await fetchUserProfile(accessToken);
  return profile?.role === 'ADMIN';
}
