"use client"

import { useMemo, useState, useCallback } from "react";
import { PageHeader } from "@/components/ui/page-header";
import { FilterRoom, type RoomFilters } from "@/components/ui/admin/room/filter-search";
import { StatCard } from "@/components/ui/dashboard/QuickStatCard";
import { Building2, Wrench, Ban, CalendarCheck2 } from "lucide-react";
import { RoomsTable } from "@/components/ui/admin/room/rooms-table";
import { RoomManagementModal } from "@/components/ui/admin/room/room-management-modal";
import type { Room } from "@/types/room";

const mockRooms: Room[] = [
  {
    id: "1",
    name: "Sala de Estudio A1",
    features: ["Pizarra", "Proyector", "WiFi"],
    location: "Biblioteca Central",
    floor: "Piso 2",
    capacity: 4,
    status: "Activa",
    reservationsToday: 8,
    utilization: 85,
  },
  {
    id: "2",
    name: "Sala de Estudio B2",
    features: ["Pizarra", "WiFi", "Enchufes"],
    location: "Biblioteca Central",
    floor: "Piso 3",
    capacity: 6,
    status: "Mantenimiento",
    statusNote: "Reparación de aire acondicionado",
    reservationsToday: 0,
    utilization: 0,
  },
  {
    id: "3",
    name: "Sala Grupal C1",
    features: ["Pizarra", "Proyector", "WiFi", "Mesa grande"],
    location: "Centro de Estudiantes",
    floor: "Piso 1",
    capacity: 8,
    status: "Activa",
    reservationsToday: 12,
    utilization: 95,
  },
  {
    id: "4",
    name: "Sala Silenciosa D1",
    features: ["WiFi", "Enchufes"],
    location: "Biblioteca Central",
    floor: "Piso 4",
    capacity: 2,
    status: "Deshabilitada",
    statusNote: "Temporalmente fuera de servicio por renovación",
    reservationsToday: 0,
    utilization: 0,
  },
];

const pageHeader = {
  title: "Gestión de Salas",
  subtitle: "Habilita, deshabilita o programa mantenimiento de salas",
};

export default function RoomPage() {
  const [rooms, setRooms] = useState<Room[]>(mockRooms);      // ⬅️ ahora en estado
  const [selectedRoom, setSelectedRoom] = useState<Room | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [filters, setFilters] = useState<RoomFilters>({
    query: "",
    location: "all",
    floor: "all",
    capacityMin: "",
    features: [],
    status: "all",
    utilizationMin: "",
    reservationsTodayMin: "",
  });

  const handleFiltersChange = useCallback((next: RoomFilters) => {
    setFilters(next);
  }, []);

  const filteredRooms = useMemo(() => {
    const q = filters.query.trim().toLowerCase();
    return rooms.filter((r) => {
      const matchesQuery = !q || r.name.toLowerCase().includes(q) || r.location.toLowerCase().includes(q);
      const matchesLocation = filters.location === "all" || r.location === filters.location;
      const matchesFloor = filters.floor === "all" || r.floor === filters.floor;
      const matchesCapacity = filters.capacityMin === "" || r.capacity >= Number(filters.capacityMin);
      const matchesStatus = filters.status === "all" || r.status === filters.status;
      const matchesUtilization = filters.utilizationMin === "" || r.utilization >= Number(filters.utilizationMin);
      const matchesReservationsToday = filters.reservationsTodayMin === "" || r.reservationsToday >= Number(filters.reservationsTodayMin);
      const matchesFeatures = filters.features.length === 0 || filters.features.every((f) => r.features.includes(f));
      return (
        matchesQuery &&
        matchesLocation &&
        matchesFloor &&
        matchesCapacity &&
        matchesStatus &&
        matchesUtilization &&
        matchesReservationsToday &&
        matchesFeatures
      );
    });
  }, [rooms, filters]);

  const handleManageRoom = useCallback((room: Room) => {
    setSelectedRoom(room);
    setIsModalOpen(true);
  }, []);

  // ⬅️ Firma compatible con el modal: (id, status)
  const handleSaveRoom = useCallback((id: string, status: Room["status"]) => {
    setRooms(prev =>
      prev.map(r => (r.id === id ? { ...r, status } : r))
    );
    setIsModalOpen(false);
    setSelectedRoom(null);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedRoom(null);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <PageHeader title="Gestión de Salas" subtitle="Habilita, deshabilita o programa mantenimiento de salas" />

        <section>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={<Building2 className="h-4 w-4" />} value={rooms.filter(r => r.status === "Activa").length} label="Salas Activas" footer="Disponibles para reserva" variant="blue" />
            <StatCard icon={<Wrench className="h-4 w-4" />} value={rooms.filter(r => r.status === "Mantenimiento").length} label="En mantenimiento" footer="Temporalmente no disponibles" variant="yellow" />
            <StatCard icon={<Ban className="h-4 w-4" />} value={rooms.filter(r => r.status === "Deshabilitada").length} label="Deshabilitadas" footer="Fuera de servicio" variant="red" />
            <StatCard icon={<CalendarCheck2 className="h-4 w-4" />} value={rooms.reduce((acc, r) => acc + r.reservationsToday, 0)} label="Reservas Hoy" footer="Total del día" variant="blue" />
          </div>
        </section>

        <FilterRoom rooms={rooms} onFiltersChange={handleFiltersChange} />
        <RoomsTable rooms={filteredRooms} onManage={handleManageRoom} />

        <RoomManagementModal
          room={selectedRoom}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          onSave={handleSaveRoom}     // ✅ firma correcta
        />
      </div>
    </div>
  );
}