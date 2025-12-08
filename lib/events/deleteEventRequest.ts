// lib/events/deleteEventRequest.ts

export type DeleteEventResponse = {
  success: boolean;
  data?: {
    id: number;
    name: string;
    is_deleted: boolean;
    deletedAt: string;
  };
  error?: string;
};

/**
 * Elimina (soft delete) una solicitud de evento.
 *
 * Elimina el EventRequest y sus Feedbacks asociados.
 * Si el evento estaba CONFIRMED, también recalcula la reputación del grupo.
 *
 * @param accessToken - Token JWT de autenticación
 * @param eventId - ID de la solicitud de evento
 * @returns Resultado de la operación
 */
export async function deleteEventRequest(accessToken: string | null, eventId: number): Promise<DeleteEventResponse> {
  if (!accessToken) {
    return { success: false, error: 'No hay token de autenticación' };
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events/delete/${eventId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      const data = await response.json().catch(() => ({}));

      // Manejar errores específicos
      if (response.status === 401) {
        return { success: false, error: 'Token inválido' };
      }
      if (response.status === 403) {
        return { success: false, error: 'No tienes permiso para eliminar este evento' };
      }
      if (response.status === 404) {
        return { success: false, error: 'Evento no encontrado' };
      }

      const errorMessage = data.error || 'Error al eliminar el evento';
      return { success: false, error: errorMessage };
    }

    const data = await response.json();
    return {
      success: true,
      data: data.eventRequest,
    };
  } catch (error) {
    console.error('Error deleting event request:', error);
    return { success: false, error: 'Error de conexión al eliminar el evento' };
  }
}
