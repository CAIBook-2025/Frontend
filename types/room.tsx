export interface Room {
  id: string
  name: string
  features: string[]
  location: string
  floor: string
  capacity: number
  status: "Activa" | "Mantenimiento" | "Deshabilitada"
  statusNote?: string
  reservationsToday: number
  utilization: number
}