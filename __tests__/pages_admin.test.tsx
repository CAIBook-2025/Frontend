import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
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

describe('Admin groups page', () => {
  beforeEach(() => {
    getSearchParamMock.mockReturnValue(null);
  });

  // Ensures the details modal opens when navigating with a groupId query
  it('abre el modal de detalles cuando groupId esta en la URL', () => {
    getSearchParamMock.mockReturnValue('2');
    render(<AdminGroupsPage />);

    expect(screen.getByText(/Detalles de la solicitud/i)).toBeInTheDocument();
  });
});

describe('Admin history page', () => {
  // Verifies the history tabs allow switching to the events view
  it('permite alternar entre reservas y eventos', () => {
    render(<HistoryPage />);

    expect(screen.getByText(/Historial de Reservas/i)).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Eventos/i }));
    expect(screen.getByText(/Historial de Eventos/i)).toBeInTheDocument();
  });
});

describe('Admin room page', () => {
  // Confirms the room management modal can be opened from the table
  it('abre el modal de gestion de sala', () => {
    render(<RoomPage />);

    fireEvent.click(screen.getAllByRole('button', { name: /Gestionar/i })[0]);
    expect(screen.getByText(/Gestionar Sala/i)).toBeInTheDocument();
  });
});
