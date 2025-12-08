export async function updateGroupRequest(accessToken: string, id: number, body: { status: 'CONFIRMED' | 'CANCELLED' }) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/group-requests/${id}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.error('Error actualizando group request', response.status);
      throw new Error('Failed to update group request');
    }

    return await response.json();
  } catch (error) {
    console.error('Error en updateGroupRequest:', error);
    throw error;
  }
}
