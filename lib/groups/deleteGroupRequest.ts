// lib/groups/deleteGroupRequest.ts

export type DeleteGroupRequestResponse = {
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
 * Elimina (soft delete) una solicitud de grupo.
 *
 * Si la solicitud está PENDING: Solo elimina la GroupRequest
 * Si la solicitud está CONFIRMED: Elimina en cascada GroupRequest + Group + EventRequests + Feedbacks
 *
 * @param accessToken - Token JWT de autenticación
 * @param groupRequestId - ID de la solicitud de grupo (NO el ID del grupo)
 * @returns Resultado de la operación
 */
export async function deleteGroupRequest(
  accessToken: string | null,
  groupRequestId: number
): Promise<DeleteGroupRequestResponse> {
  if (!accessToken) {
    return { success: false, error: 'No hay token de autenticación' };
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/group-requests/delete/${groupRequestId}`, {
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
        return { success: false, error: 'No tienes permiso para eliminar esta solicitud' };
      }
      if (response.status === 404) {
        return { success: false, error: 'Solicitud no encontrada' };
      }

      const errorMessage = data.error || 'Error al eliminar la solicitud de grupo';
      return { success: false, error: errorMessage };
    }

    const data = await response.json();
    console.log('📋 Delete Group Request Response:', data);
    return {
      success: true,
      data: data.groupRequest,
    };
  } catch (error) {
    console.error('Error deleting group request:', error);
    return { success: false, error: 'Error de conexión al eliminar la solicitud' };
  }
}
