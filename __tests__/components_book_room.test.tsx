import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DaySelector } from '@/components/book-room/DaySelector';
import { RoomCard, Room } from '@/components/book-room/RoomCard';
import { ViewToggler } from '@/components/book-room/ViewToggler';

const originalDate = Date;

describe('DaySelector', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2025-03-17T12:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders seven weekday buttons with today selected', () => {
    const onDateChange = jest.fn();
    render(<DaySelector selectedDate="2025-03-17" onDateChange={onDateChange} />);

    const buttons = screen.getAllByRole('button');
    expect(buttons).toHaveLength(7);
    expect(screen.getByText(/Hoy/i)).toBeInTheDocument();
    expect(screen.getByText(/Lunes/i)).toBeInTheDocument();

    const expectedNextDay = new Date('2025-03-17T12:00:00Z');
    expectedNextDay.setDate(expectedNextDay.getDate() + 1);
    fireEvent.click(buttons[1]);
    expect(onDateChange).toHaveBeenCalledWith(expectedNextDay.toISOString().split('T')[0]);
  });
});

describe('RoomCard', () => {
  const baseRoom: Room = {
    id: 1,
    name: 'Sala A1',
    location: 'Biblioteca',
    capacity: 6,
    nextAvailable: '15:00',
    status: 'Disponible',
    equipment: ['Pizarra', 'WiFi'],
  };

  it('shows reservation button when room is available', () => {
    render(<RoomCard room={baseRoom} />);

    expect(screen.getByRole('heading', { name: /Sala A1/i })).toBeInTheDocument();
    const button = screen.getByRole('button', { name: /Reservar/i });
    expect(button).toBeEnabled();
  });

  it('disables button when room is not available', () => {
    render(<RoomCard room={{ ...baseRoom, status: 'Ocupada' }} />);

    const button = screen.getByRole('button', { name: /No Disponible/i });
    expect(button).toBeDisabled();
  });
});

describe('ViewToggler', () => {
  it('toggles between list and map views', () => {
    const setViewMode = jest.fn();
    render(<ViewToggler viewMode="list" setViewMode={setViewMode} />);

    const listButton = screen.getByRole('button', { name: /Lista/i });
    const mapButton = screen.getByRole('button', { name: /Visualizador/i });

    expect(listButton).toHaveAttribute('aria-pressed', 'true');
    expect(mapButton).toHaveAttribute('aria-pressed', 'false');

    fireEvent.click(mapButton);
    expect(setViewMode).toHaveBeenCalledWith('map');
  });
});
