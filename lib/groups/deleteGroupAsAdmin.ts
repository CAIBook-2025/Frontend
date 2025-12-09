import { ActionResponse } from '@/types/actionResponse';

export async function softDeleteGroupAsAdmin(token: string, groupId: number): Promise<ActionResponse> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/groups/admin/delete/${groupId}`, {
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
        error: errorData.error || 'Error al eliminar el grupo',
      };
    }

    return {
      success: true,
      message: 'Grupo eliminado correctamente',
    };
  } catch (error) {
    console.error('Error deleting group as admin:', error);
    return {
      success: false,
      error: 'Error de conexión al eliminar el grupo',
    };
  }
}
