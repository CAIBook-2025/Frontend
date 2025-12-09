import { ActionResponse } from '@/types/actionResponse';

export async function restoreUser(token: string, userId: number): Promise<ActionResponse> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/admin/restore/${userId}`, {
      method: 'PATCH',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      return {
        success: false,
        error: errorData.error || 'Error al restaurar el usuario',
      };
    }

    return {
      success: true,
      message: 'Usuario restaurado correctamente',
    };
  } catch (error) {
    console.error('Error restoring user:', error);
    return {
      success: false,
      error: 'Error de conexión al restaurar el usuario',
    };
  }
}
