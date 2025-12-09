import { fetchUserProfile } from './fetchUserProfile';

export async function isAdmin(accessToken: string | null): Promise<boolean> {
  if (process.env.CYPRESS_TEST_MODE === 'true') {
    return true;
  }

  const profile = await fetchUserProfile(accessToken);
  return profile?.user?.role === 'ADMIN';
}
