export type ReservationStatus = "Completada" | "No Show" | "Cancelada"

export interface Reservation {
  id: string
  userName: string
  userEmail: string
  room: string
  date: string
  timeRange: string
  checkInTime?: string
  status: ReservationStatus
}

export type EventStatus = "Completada" | "Activo" | "Cancelada"

export interface Event {
  id: string
  eventName: string
  group: string
  room: string
  date: string
  timeRange: string
  registered: number
  attendees: number
  checkInTime?: string
  status: EventStatus
}
