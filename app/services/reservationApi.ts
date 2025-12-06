// app/services/reservationApi.ts

// 1. Definimos el "contrato" o la estructura de una reserva del backend
export interface BackendReservation {
  id: number;
  day: string;
  module: number;
  status: string;
  isFinished: boolean;
  roomName: string;
  location?: string;
}

// 2. Estructura adaptada para el frontend
export type ReservationStatus = 'Confirmada' | 'Pendiente' | 'Cancelada' | 'Ausente';

export interface Reservation {
  id: number;
  roomName: string;
  location: string;
  date: string;
  time: string;
  status: ReservationStatus;
  isFinished: boolean;
  module: number;
}

// 3. Mapeo de módulos a horarios (ajusta según tu sistema)
const MODULE_TIMES: Record<number, string> = {
  1: '08:00 - 09:30',
  2: '09:45 - 11:15',
  3: '11:30 - 13:00',
  4: '14:00 - 15:30',
  5: '15:45 - 17:15',
  6: '17:30 - 19:00',
  7: '19:15 - 20:45',
};

// 4. Mapeo de estados del backend a estados del frontend
const mapStatus = (backendStatus: string, isFinished: boolean): ReservationStatus => {
  if (isFinished && backendStatus === 'ABSENT') return 'Ausente';
  if (backendStatus === 'CANCELLED') return 'Cancelada';
  if (backendStatus === 'PRESENT' || backendStatus === 'CONFIRMED') return 'Confirmada';
  return 'Pendiente';
};

// 5. Formatear fecha para mostrar
const formatDate = (dateString: string): string => {
  try {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Comparar solo las fechas (sin hora)
    const isToday = date.toDateString() === today.toDateString();
    const isTomorrow = date.toDateString() === tomorrow.toDateString();

    if (isToday) return 'Hoy';
    if (isTomorrow) return 'Mañana';

    return date.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
  } catch {
    return dateString;
  }
};

// 6. Transformar reserva del backend al formato del frontend
const transformReservation = (backendRes: BackendReservation): Reservation => ({
  id: backendRes.id,
  roomName: backendRes.roomName || 'Sala sin nombre',
  location: backendRes.location || 'Ubicación no especificada',
  date: formatDate(backendRes.day),
  time: MODULE_TIMES[backendRes.module] || `Módulo ${backendRes.module}`,
  status: mapStatus(backendRes.status, backendRes.isFinished),
  isFinished: backendRes.isFinished,
  module: backendRes.module,
});

// 7. Función principal para obtener las reservas del usuario
export const getReservations = async (accessToken: string | null): Promise<Reservation[]> => {
  if (!accessToken) {
    console.warn('getReservations called without access token');
    return [];
  }

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/users/check`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!response.ok) {
      console.error('Failed to fetch reservations', response.status, response.statusText);
      return [];
    }

    const data = await response.json();
    
    if (!data.exists || !data.user?.schedule) {
      return [];
    }

    // Transformar y devolver las reservas
    const reservations: Reservation[] = data.user.schedule.map(transformReservation);
    
    // Ordenar: primero las no terminadas, luego por fecha
    return reservations.sort((a, b) => {
      if (a.isFinished !== b.isFinished) {
        return a.isFinished ? 1 : -1;
      }
      return 0;
    });

  } catch (error) {
    console.error('Error fetching reservations:', error);
    return [];
  }
};

// 8. Función para cancelar una reserva
export const cancelReservation = async (
  reservationId: number,
  accessToken: string | null
): Promise<{ success: boolean; message: string }> => {
  if (!accessToken) {
    return { success: false, message: 'No hay token de autenticación' };
  }

  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/api/reservations/${reservationId}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return { 
        success: false, 
        message: errorData.message || 'Error al cancelar la reserva' 
      };
    }

    return { success: true, message: 'Reserva cancelada con éxito.' };
  } catch (error) {
    console.error('Error cancelling reservation:', error);
    return { success: false, message: 'Error de conexión al cancelar la reserva' };
  }
};
