import { ScheduleItem } from '@/types/schedule';

export type EnableSchedulePayload = {
  scheduleId: number;
  adminId: number;
};

export async function enableScheduleSlot(
  accessToken: string | null,
  payload: EnableSchedulePayload
): Promise<ScheduleItem | null> {
  if (!accessToken) {
    console.warn('enableScheduleSlot called without access token');
    return null;
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/srSchedule/enable`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error('Failed to enable schedule slot', {
        status: response.status,
        statusText: response.statusText,
        payload,
      });
      return null;
    }

    const data = (await response.json()) as ScheduleItem;
    return data;
  } catch (error) {
    console.error('Error enabling schedule slot:', {
      error,
      payload,
    });
    return null;
  }
}
