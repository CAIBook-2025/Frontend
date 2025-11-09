import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FilterRoom, RoomFilters } from '@/components/ui/admin/room/filter-search';
import { RoomManagementModal } from '@/components/ui/admin/room/room-management-modal';
import { RoomsTable } from '@/components/ui/admin/room/rooms-table';
import type { Room } from '@/types/room';

const mockRooms: Room[] = [
  {
    id: '1',
    name: 'Sala A1',
    features: ['Pizarra', 'Proyector'],
    location: 'Biblioteca',
    floor: 'Piso 2',
    capacity: 6,
    status: 'AVAILABLE',
    reservationsToday: 2,
    utilization: 80,
  },
  {
    id: '2',
    name: 'Sala B1',
    features: ['WiFi'],
    location: 'Centro',
    floor: 'Piso 1',
    capacity: 4,
    status: 'MAINTENANCE',
    statusNote: 'Reparación',
    reservationsToday: 0,
    utilization: 10,
  },
];

describe('FilterRoom', () => {
  // Checks that filter updates propagate to the handler
  it('emits updates when filters change', () => {
    const handleFiltersChange = jest.fn();
    render(<FilterRoom rooms={mockRooms} onFiltersChange={handleFiltersChange} />);

    fireEvent.change(screen.getByPlaceholderText(/Buscar por sala/i), { target: { value: 'Sala' } });
    expect(handleFiltersChange).toHaveBeenCalled();

    fireEvent.change(screen.getByDisplayValue(/Todas las ubicaciones/i), {
      target: { value: 'Biblioteca' },
    });
    expect(handleFiltersChange).toHaveBeenCalled();

    fireEvent.click(screen.getByText('Proyector'));
    const lastCall = handleFiltersChange.mock.calls.at(-1)[0] as RoomFilters;
    expect(lastCall.features).toContain('Proyector');
  });
});

describe('RoomManagementModal', () => {
  const room = mockRooms[0];

  // Ensures the modal saves changes and closes after submission
  it('allows changing status and saving', () => {
    const onSave = jest.fn();
    const onClose = jest.fn();

    render(<RoomManagementModal room={room} isOpen onClose={onClose} onSave={onSave} />);

    fireEvent.click(screen.getByLabelText(/En mantenimiento/i));
    const textarea = screen.getByLabelText(/Motivo/i);
    fireEvent.change(textarea, { target: { value: 'Revisión técnica' } });

    fireEvent.click(screen.getByRole('button', { name: /Guardar Cambios/i }));
    expect(onSave).toHaveBeenCalledWith(room.id, 'MAINTENANCE', 'Revisión técnica');
    expect(onClose).toHaveBeenCalled();
  });
});

describe('RoomsTable', () => {
  // Confirms the manage action notifies the parent about the selected room
  it('renders rooms and triggers manage callback', () => {
    const onManage = jest.fn();
    render(<RoomsTable rooms={mockRooms} onManage={onManage} />);

    fireEvent.click(screen.getAllByRole('button', { name: /Gestionar/i })[0]);
    expect(onManage).toHaveBeenCalledWith(mockRooms[0]);
  });
});
