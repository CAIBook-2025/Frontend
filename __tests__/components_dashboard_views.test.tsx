import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { GroupsView } from '@/components/dashboard/GroupsView';
import { PartnerView } from '@/components/dashboard/PartnerView';
import { PersonalView } from '@/components/dashboard/PersonalView';
import { RepresentativeView } from '@/components/dashboard/RepresentativeView';

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe('GroupsView', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('loads groups from the fake API and lists them', async () => {
    render(<GroupsView />);

    await act(async () => {
      jest.runAllTimers();
    });

    expect(screen.getByRole('heading', { name: /Mis Grupos/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Crear Grupo/i })).toHaveAttribute('href', 'Student/Groups/Form');
    expect(screen.getByText(/Club de Programaci/i)).toBeInTheDocument();
  });
});

describe('PartnerView', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders group details after loading and opens leave confirmation', async () => {
    render(<PartnerView groupId="42" />);

    await act(async () => {
      jest.runAllTimers();
    });

    expect(
      screen.getByRole('heading', { name: /Club de Programaci/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/Miembros Totales/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /Abandonar Grupo/i }));
    expect(screen.getByText(/Confirmar Salida/i)).toBeInTheDocument();
  });
});

describe('PersonalView', () => {
  it('shows quick stats and action cards', () => {
    render(<PersonalView />);

    expect(screen.getByText(/Reservas Activas/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Reservar una Sala/i })).toHaveAttribute(
      'href',
      'Student/StudyRoomBooker'
    );
    expect(screen.getByRole('heading', { name: /Pr/i, level: 2 })).toBeInTheDocument();
  });
});

describe('RepresentativeView', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('loads representative data and allows opening delete modal', async () => {
    render(<RepresentativeView groupId="99" />);

    await act(async () => {
      jest.runAllTimers();
    });

    expect(
      screen.getByRole('heading', { name: /Miembros del Grupo/i })
    ).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /Eliminar Grupo/i }));
    expect(screen.getByText(/Confirmar Eliminaci/i)).toBeInTheDocument();
  });
});
