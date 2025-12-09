import { ActionResponse } from '@/types/actionResponse';

export async function promoteUser(token: string, userId: number): Promise<ActionResponse> {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/admin/promote/${userId}`, {
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
        error: errorData.error || 'Error al promover el usuario',
      };
    }

    return {
      success: true,
      message: 'Usuario promovido a administrador correctamente',
    };
  } catch (error) {
    console.error('Error promoting user:', error);
    return {
      success: false,
      error: 'Error de conexión al promover el usuario',
    };
  }
}
