import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FilterComponent } from '@/components/ui/admin/history/filter-search';
import { EventHistoryTable, Event } from '@/components/ui/admin/history/events-history-table';
import { EventSection } from '@/components/ui/admin/history/events-section';
import {
  ReservationHistoryTable,
  Reservation,
} from '@/components/ui/admin/history/reservation-history-table';
import { ReservationSection } from '@/components/ui/admin/history/reservation-section';

describe('FilterComponent', () => {
  it('updates internal filters', () => {
    render(<FilterComponent />);

    const searchInput = screen.getByPlaceholderText(/Buscar/i);
    fireEvent.change(searchInput, { target: { value: 'Sala' } });
    expect(screen.getByDisplayValue('Sala')).toBeInTheDocument();

    const statusSelect = screen.getByDisplayValue(/Todos los estados/i);
    fireEvent.change(statusSelect, { target: { value: 'completed' } });
    expect(screen.getByDisplayValue(/Completado/i)).toBeInTheDocument();
  });
});

describe('EventHistoryTable', () => {
  it('renders events list with computed assistance', () => {
    const events: Event[] = [
      {
        id: 'evt-1',
        eventName: 'Charla React',
        group: 'Club Dev',
        room: 'Sala A',
        date: '2025-10-01',
        timeRange: '10:00 - 12:00',
        registered: 20,
        attendees: 15,
        status: 'Completada',
      },
    ];

    render(<EventHistoryTable events={events} />);

    expect(screen.getByText(/Charla React/i)).toBeInTheDocument();
    expect(screen.getByText(/Club Dev/i)).toBeInTheDocument();
    expect(screen.getByText(/15 \/ 20/)).toBeInTheDocument();
    expect(screen.getByText(/75% de asistencia/i)).toBeInTheDocument();
  });
});

describe('EventSection', () => {
  it('shows stats and table data', () => {
    render(<EventSection />);

    expect(screen.getByText(/Eventos Totales/i)).toBeInTheDocument();
    expect(screen.getByText(/Historial de Eventos/i)).toBeInTheDocument();
    expect(screen.getByText(/Workshop React/i)).toBeInTheDocument();
  });
});

describe('ReservationHistoryTable', () => {
  it('renders reservation rows', () => {
    const reservations: Reservation[] = [
      {
        id: 'res-1',
        userName: 'Juan Pérez',
        userEmail: 'juan@example.com',
        room: 'Sala B',
        date: '2025-10-01',
        timeRange: '09:00 - 10:00',
        checkInTime: '08:55',
        status: 'Completada',
      },
      {
        id: 'res-2',
        userName: 'Ana Díaz',
        userEmail: 'ana@example.com',
        room: 'Sala C',
        date: '2025-10-02',
        timeRange: '10:00 - 11:00',
        status: 'No Show',
      },
    ];

    render(<ReservationHistoryTable reservations={reservations} />);

    expect(screen.getByText(/Juan/i)).toBeInTheDocument();
    expect(screen.getByText(/No Show/i)).toBeInTheDocument();
    expect(screen.getByText(/08:55/i)).toBeInTheDocument();
    expect(screen.getByText(/No realizado/i)).toBeInTheDocument();
  });
});

describe('ReservationSection', () => {
  it('displays section header and table content', () => {
    render(<ReservationSection />);

    expect(screen.getByText(/Historial de Reservas/i)).toBeInTheDocument();
    expect(screen.getByText(/Aplicar Strike/i)).not.toBeInTheDocument();
  });
});
