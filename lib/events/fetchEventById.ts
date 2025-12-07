// lib/events/fetchEventById.ts

import { EventRequestDetail } from "@/types/eventRequest";

export async function fetchEventById(
  accessToken: string | null,
  eventId: number
): Promise<EventRequestDetail | null> {
  if (!accessToken) {
    console.warn("fetchEventById called without access token");
    return null;
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/events/${eventId}`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      console.error("Failed to fetch event", response.status, response.statusText);
      return null;
    }

    const data = await response.json();
    return data as EventRequestDetail;
  } catch (error) {
    console.error("Error fetching event:", error);
    return null;
  }
}

