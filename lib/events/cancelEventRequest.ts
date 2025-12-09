// lib/events/cancelEventRequest.ts

export type CancelEventResponse = {
  success: boolean;
  error?: string;
};

export async function cancelEventRequest(accessToken: string | null, eventId: number): Promise<CancelEventResponse> {
  if (!accessToken) {
    return { success: false, error: 'No hay token de autenticación' };
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events/cancel/${eventId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));

      // Manejar errores específicos
      if (response.status === 400) {
        return { success: false, error: 'ID de evento inválido' };
      }
      if (response.status === 401) {
        return { success: false, error: 'Token inválido' };
      }
      if (response.status === 403) {
        return { success: false, error: 'No tienes permiso para cancelar este evento' };
      }
      if (response.status === 404) {
        return { success: false, error: 'Evento no encontrado o ya fue cancelado' };
      }

      const errorMessage = data.error || 'Error al cancelar el evento';
      return { success: false, error: errorMessage };
    }

    // El endpoint retorna 204 No Content en caso de éxito
    return { success: true };
  } catch (error) {
    console.error('Error cancelling event request:', error);
    return { success: false, error: 'Error de conexión al cancelar el evento' };
  }
}

