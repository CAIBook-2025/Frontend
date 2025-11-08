import { ScheduleItem } from '@/types/schedule';

export type CancelSchedulePayload = {
  scheduleId: number;
  adminId: number;
};

export async function cancelScheduleSlot(
  accessToken: string | null,
  payload: CancelSchedulePayload
): Promise<ScheduleItem | null> {
  if (!accessToken) {
    console.warn('cancelScheduleSlot called without access token');
    return null;
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/srSchedule/cancel/admin`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error('Failed to cancel schedule slot', {
        status: response.status,
        statusText: response.statusText,
        payload,
      });
      return null;
    }

    const data = (await response.json()) as ScheduleItem;
    return data;
  } catch (error) {
    console.error('Error canceling schedule slot:', {
      error,
      payload,
    });
    return null;
  }
}
