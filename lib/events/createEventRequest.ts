// lib/events/createEventRequest.ts

import { CreateEventRequest, EventRequest } from '@/types/eventRequest';

export type CreateEventResponse = {
  success: boolean;
  data?: EventRequest;
  error?: string;
};

export async function createEventRequest(
  accessToken: string | null,
  eventData: CreateEventRequest
): Promise<CreateEventResponse> {
  if (!accessToken) {
    return { success: false, error: 'No hay token de autenticación' };
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(eventData),
    });

    const data = await response.json();

    if (!response.ok) {
      // Manejar errores específicos de la API
      const errorMessage = data.error || 'Error al crear la solicitud de evento';
      return { success: false, error: errorMessage };
    }

    return { success: true, data: data as EventRequest };
  } catch (error) {
    console.error('Error creating event request:', error);
    return { success: false, error: 'Error de conexión al crear el evento' };
  }
}
