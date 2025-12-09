export async function refreshSchedules(accessToken: string | null): Promise<boolean> {
  if (!accessToken) {
    console.warn('refreshSchedules called without access token');
    return false;
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/srSchedule/refresh`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      console.error('Failed to refresh schedules', {
        status: response.status,
        statusText: response.statusText,
      });
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error refreshing schedules:', error);
    return false;
  }
}
