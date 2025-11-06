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
  const apiUrl = `${process.env.NEXT_PUBLIC_API_URL}/api/srSchedule/cancel/${reservationId}`;
  
  console.log(`Intentando cancelar reserva en: ${apiUrl}`);
  console.log(`Enviando body: { userId: ${userId} }`);

  try {
    const res = await fetch(apiUrl, {
      method: 'PUT', // Usamos PUT ya que estamos actualizando el estado de un recurso existente
      headers: {
        'Content-Type': 'application/json',
        // Si tu API requiere autenticación (ej. un token JWT), deberías añadirlo aquí:
        // 'Authorization': `Bearer ${your_auth_token}`,
      },
      body: JSON.stringify({ userId }), // El cuerpo de la petición con el ID del usuario
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