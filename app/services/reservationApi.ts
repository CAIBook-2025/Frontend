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
export const cancelReservation = (reservationId: number): Promise<{ success: boolean; message: string }> => {
  console.log(`Simulando llamada a la API para CANCELAR la reserva con ID: ${reservationId}`);

  return new Promise((resolve, reject) => {
    // Simulamos un retraso de red de 1 segundo
    setTimeout(() => {
      // En un caso real, podrías tener una lógica de error aquí
      if (reservationId) {
        console.log(`Reserva ${reservationId} cancelada con éxito.`);
        resolve({ success: true, message: 'Reserva cancelada con éxito.' });
      } else {
        reject({ success: false, message: 'ID de reserva no válido.' });
      }
    }, 1000);
  });
};