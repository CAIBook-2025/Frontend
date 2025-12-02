import { EventRequest } from "@/types/eventRequest";

export async function updateEventRequest(
    accessToken: string | null,
    id: number,
    updates: Partial<EventRequest>
): Promise<EventRequest | null> {
    if (!accessToken) {
        console.warn("updateEventRequest called without access token");
        return null;
    }

    try {
        const response = await fetch(
            `${process.env.NEXT_PUBLIC_API_URL}/api/events/${id}`,
            {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${accessToken}`,
                },
                body: JSON.stringify(updates),
            }
        );

        if (!response.ok) {
            const errorData = await response.json().catch(() => null);
            console.error(
                "Failed to update event request:",
                response.status,
                response.statusText,
                errorData
            );
            return null;
        }

        const data = await response.json();
        return data as EventRequest;
    } catch (error) {
        console.error("Error updating event request:", error);
        return null;
    }
}
