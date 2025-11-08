// app/services/ReservationApi.ts

// 1. Definimos el "contrato" o la estructura de una reserva.
//    Esto nos ayuda a mantener la consistencia en toda la app.
export type ReservationStatus = 'Confirmada' | 'Pendiente' | 'Cancelada';

export interface Reservation {
  id: number;
  roomName: string;
  location: string;
  date: string;
  time: string;
  status: ReservationStatus;
}

// 2. Mantenemos nuestros datos de prueba aquí.
const mockReservations: Reservation[] = [
  { id: 1, roomName: 'Sala de Estudio A1', location: 'Piso 1, Edificio A', date: 'Hoy, 25 de Octubre', time: '16:00 - 17:00', status: 'Confirmada' },
  { id: 2, roomName: 'Sala Grupal C1', location: 'Piso 3, Edificio C', date: 'Viernes, 27 de Octubre', time: '10:00 - 12:00', status: 'Pendiente' },
  { id: 3, roomName: 'Sala de Reuniones B2', location: 'Piso 2, Edificio B', date: 'Lunes, 30 de Octubre', time: '09:00 - 10:00', status: 'Confirmada' },
  { id: 4, roomName: 'Sala Silenciosa D4', location: 'Piso 4, Edificio D', date: 'Miércoles, 1 de Noviembre', time: '14:00 - 16:00', status: 'Confirmada' },
  { id: 5, roomName: 'Sala de Estudio A2', location: 'Piso 1, Edificio A', date: 'Pasado: 20 de Octubre', time: '11:00 - 12:00', status: 'Cancelada' },
];

// 3. Creamos la función que simula la llamada a la API.
export const getReservations = (): Promise<Reservation[]> => {
  console.log('Simulando llamada a la API para obtener reservas...');
  
  return new Promise((resolve) => {
    // Simulamos un retraso de red de 1.5 segundos (1500 ms)
    setTimeout(() => {
      console.log('Datos de reservas recibidos.');
      resolve(mockReservations);
    }, 1500);
  });
};


// app/services/ReservationApi.ts
// ... (código anterior: tipos Reservation, mockReservations, getReservations)

// --- AÑADIR ESTA NUEVA FUNCIÓN ---
// Simula una petición POST para cancelar una reserva.
// app/services/reservationApi.ts (o donde tengas la función)

// La función ahora necesita tanto el ID de la reserva como el ID del usuario
export const cancelReservation = async (reservationId: number, userId: number): Promise<{ success: boolean; message: string }> => {
  // Verificación para asegurar que tenemos un userId válido
  if (!userId) {
    throw new Error('El ID del usuario es requerido para cancelar la reserva.');
  }
  console.log(`Preparando para cancelar la reserva con ID: ${reservationId} para el usuario con ID: ${userId}`);

  // Construimos la URL dinámicamente usando la variable de entorno y el ID de la reserva
  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/srSchedule/cancel`;

  
  console.log(`Intentando cancelar reserva en: ${apiUrl}`);
  console.log(`Enviando body: { userId: ${userId} }`);

  try {
    const res = await fetch(apiUrl, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scheduleId: reservationId, userId }),
  });

    // Si la respuesta no es exitosa (ej. 400, 404, 500), lanzamos un error
    if (!res.ok) {
      // Intentamos leer el mensaje de error del cuerpo de la respuesta de la API
      const errorData = await res.json();
      throw new Error(errorData.error || `Error del servidor: ${res.status}`);
    }

    // Si la respuesta es exitosa, la procesamos
    const responseData = await res.json();
    console.log('Respuesta de la API:', responseData);

    return {
      success: true,
      message: responseData.message || 'Reserva cancelada con éxito.',
    };

  } catch (error) {
    console.error('Error en la llamada a la API para cancelar la reserva:', error);
    // Re-lanzamos el error para que el componente que llamó a la función pueda manejarlo
    // y mostrar un mensaje al usuario.
    throw error;
  }
};

// ... (El resto de tus funciones de API, como getReservations, etc.)
// app/services/reservationApi.ts

// ... (tus tipos y otras funciones como getReservations y cancelReservation)

// --- AÑADIR ESTA NUEVA FUNCIÓN ---

/**
 * Realiza una llamada a la API para confirmar el check-in de una reserva.
 * @param scheduleId - El ID de la reserva (schedule).
 * @param userId - El ID del usuario que realiza el check-in.
 * @param accessToken - El token de autenticación de Auth0.
 * @returns Una promesa que se resuelve con el resultado de la operación.
 */
export const confirmCheckIn = async (
  scheduleId: number,
  userId: number,
  accessToken: string
): Promise<{ success: boolean; message: string }> => {
  // Verificaciones para asegurar que tenemos todos los datos necesarios
  if (!scheduleId || !userId || !accessToken) {
    throw new Error('Faltan datos requeridos (scheduleId, userId, o accessToken) para realizar el check-in.');
  }

  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/srSchedule/checkin`;
  
  console.log(`Intentando hacer check-in en: ${apiUrl}`);
  console.log(`Enviando body: { userId: ${userId}, scheduleId: ${scheduleId} }`);

  try {
    const res = await fetch(apiUrl, {
      method: 'PATCH', // O 'PUT' si tu API lo requiere, pero POST es común para crear una "asistencia"
      headers: {
        'Content-Type': 'application/json',
        // ¡Este es el paso clave! Añadimos el token de autorización.
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify({ userId, scheduleId }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || `Error del servidor al hacer check-in: ${res.status}`);
    }

    const responseData = await res.json();
    console.log('Respuesta de la API de check-in:', responseData);

    return {
      success: true,
      message: responseData.message || 'Check-in realizado con éxito.',
    };

  } catch (error) {
    console.error('Error en la llamada a la API para confirmar el check-in:', error);
    throw error;
  }
};

// app/services/reservationApi.ts

// ... (tus otras funciones como cancelReservation y confirmCheckIn)

// --- AÑADIR ESTA NUEVA FUNCIÓN ---

/**
 * Realiza una llamada a la API para confirmar el check-out de una reserva.
 * @param scheduleId - El ID de la reserva (schedule).
 * @param userId - El ID del usuario que realiza el check-out.
 * @param accessToken - El token de autenticación de Auth0.
 * @returns Una promesa que se resuelve con el resultado de la operación.
 */
export const confirmCheckOut = async (
  scheduleId: number,
  userId: number,
  accessToken: string
): Promise<{ success: boolean; message: string }> => {
  if (!scheduleId || !userId || !accessToken) {
    throw new Error('Faltan datos requeridos (scheduleId, userId, o accessToken) para realizar el check-out.');
  }

  // Usamos el endpoint que especificaste
  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/srSchedule/checkout`;
  
  console.log(`Intentando hacer check-out en: ${apiUrl}`);
  console.log(`Enviando body: { userId: ${userId}, scheduleId: ${scheduleId} }`);

  try {
    const res = await fetch(apiUrl, {
      method: 'PATCH', // Usamos PATCH como lo especificaste
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`, // Token de autorización
      },
      body: JSON.stringify({ scheduleId, userId }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error || `Error del servidor al hacer check-out: ${res.status}`);
    }

    const responseData = await res.json();
    console.log('Respuesta de la API de check-out:', responseData);

    return {
      success: true,
      message: responseData.message || 'Check-out realizado con éxito.',
    };

  } catch (error) {
    console.error('Error en la llamada a la API para confirmar el check-out:', error);
    throw error;
  }
};