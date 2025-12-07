// lib/events/deleteEventRequest.ts

export type DeleteEventResponse = {
  success: boolean;
  error?: string;
};

export async function deleteEventRequest(accessToken: string | null, eventId: number): Promise<DeleteEventResponse> {
  if (!accessToken) {
    return { success: false, error: 'No hay token de autenticación' };
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events/${eventId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));
      const errorMessage = data.error || 'Error al eliminar el evento';
      return { success: false, error: errorMessage };
    }

    return { success: true };
  } catch (error) {
    console.error('Error deleting event request:', error);
    return { success: false, error: 'Error de conexión al eliminar el evento' };
  }
}
