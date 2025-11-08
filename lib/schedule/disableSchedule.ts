import { ScheduleItem } from '@/types/schedule';

export type DisableSchedulePayload = {
  scheduleId: number;
  adminId: number;
};

export async function disableScheduleSlot(
  accessToken: string | null,
  payload: DisableSchedulePayload
): Promise<ScheduleItem | null> {
  if (!accessToken) {
    console.warn('disableScheduleSlot called without access token');
    return null;
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/srSchedule/disable`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error('Failed to disable schedule slot', {
        status: response.status,
        statusText: response.statusText,
        payload,
      });
      return null;
    }

    const data = (await response.json()) as ScheduleItem;
    return data;
  } catch (error) {
    console.error('Error disabling schedule slot:', {
      error,
      payload,
    });
    return null;
  }
}