import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import AdminDashboard from '@/app/Admin/page';
import AdminGroupsPage from '@/app/Admin/Groups/page';
import HistoryPage from '@/app/Admin/History/page';
import RoomPage from '@/app/Admin/Room/page';
import StrikesPage from '@/app/Admin/Strikes/page';

const getSearchParamMock = jest.fn<null | string, [string]>(() => null);

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

jest.mock('next/navigation', () => ({
  useSearchParams: () => ({
    get: getSearchParamMock,
  }),
}));

describe('Admin dashboard page', () => {
  beforeEach(() => {
    getSearchParamMock.mockReturnValue(null);
  });

  it('renders stats and admin tools', () => {
    render(<AdminDashboard />);

    expect(screen.getByText(/Reservas Totales/i)).toBeInTheDocument();
    expect(screen.getByText(/Herramientas de Administración/i)).toBeInTheDocument();
  });
});

describe('Admin groups page', () => {
  beforeEach(() => {
    getSearchParamMock.mockReturnValue(null);
  });

  it('shows pending requests by default', () => {
    render(<AdminGroupsPage />);

    expect(screen.getByRole('heading', { name: /Administrar Grupos - Pendientes/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Buscar por nombre/i)).toBeInTheDocument();
  });

  it('opens details modal when groupId query is present', () => {
    getSearchParamMock.mockReturnValue('2');
    render(<AdminGroupsPage />);

    expect(screen.getByText(/Detalles de la solicitud/i)).toBeInTheDocument();
  });
});

describe('Admin history page', () => {
  it('toggles between reservations and events', () => {
    render(<HistoryPage />);

    expect(screen.getByText(/Historial de Reservas/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Eventos/i }));
    expect(screen.getByText(/Historial de Eventos/i)).toBeInTheDocument();
  });
});

describe('Admin room page', () => {
  it('allows opening the room management modal', () => {
    render(<RoomPage />);

    fireEvent.click(screen.getAllByRole('button', { name: /Gestionar/i })[0]);
    expect(screen.getByText(/Gestionar Sala/i)).toBeInTheDocument();
  });
});

describe('Admin strikes page', () => {
  it('opens modals for history and applying strikes', () => {
    render(<StrikesPage />);

    fireEvent.click(screen.getByRole('button', { name: /Historial/i }));
    expect(screen.getByText(/Historial de Strikes/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /\+/i }));
    expect(screen.getByText(/Aplicar Strike/i)).toBeInTheDocument();
  });
});
