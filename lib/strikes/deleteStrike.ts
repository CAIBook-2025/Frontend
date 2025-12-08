export async function deleteStrike(accessToken: string, id: number): Promise<void> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/strikes/${id}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || 'No se pudo eliminar el strike');
  }
}
