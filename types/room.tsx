export interface Room {
  id: string;
  name: string;
  features: string[];
  location: string;
  capacity: number;
  status: 'AVAILABLE' | 'MAINTENANCE' | 'UNAVAILABLE';
  statusNote?: string;
  reservationsToday: number;
  utilization: number;
}
