export type MaintenanceModule = 'M1' | 'M2' | 'M3' | 'M4';

export type MaintenanceBlock = {
  date: string;
  modules: MaintenanceModule[];
};

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
  maintenanceBlocks?: MaintenanceBlock[];
}
