import { EventRequest } from "@/types/eventRequest";

export type PublicSpace = {
    id: number;
    name: string;
    capacity: number;
    location: string;
    available: boolean;
};

export async function fetchEventRequests(
    accessToken: string | null,
    filters?: { status?: string; group_id?: number }
): Promise<EventRequest[] | null> {
    if (!accessToken) {
        console.warn('fetchEventRequests called without access token');
        return null;
    }

    try {
        const queryParams = new URLSearchParams();
        if (filters?.status) {
            queryParams.append('status', filters.status);
        }
        if (filters?.group_id) {
            queryParams.append('group_id', filters.group_id.toString());
        }

        const queryString = queryParams.toString();
        const url = `${process.env.NEXT_PUBLIC_API_URL}/api/events${queryString ? `?${queryString}` : ''}`;

        const response = await fetch(url, {
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
        });

        if (!response.ok) {
            console.error('Failed to fetch event requests', response.status, response.statusText);
            return null;
        }

        const data = await response.json();
        return data as EventRequest[];
    } catch (error) {
        console.error('Error fetching event requests:', error);
        return null;
    }
}
