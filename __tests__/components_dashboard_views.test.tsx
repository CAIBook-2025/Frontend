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

  // Checks the groups view exposes navigation to the group creation page
  it('muestra enlace para crear grupo tras cargar datos', async () => {
    render(<GroupsView />);

    await act(async () => {
      jest.runAllTimers();
    });

    expect(screen.getByRole('link', { name: /Crear Grupo/i })).toHaveAttribute('href', 'Student/Groups/Form');
  });
});

describe('PartnerView', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // Ensures the partner view opens the leave confirmation modal
  it('abre el modal de salida del grupo', async () => {
    render(<PartnerView groupId="42" />);

    await act(async () => {
      jest.runAllTimers();
    });

    fireEvent.click(screen.getByRole('button', { name: /Abandonar Grupo/i }));
    expect(screen.getByText(/Confirmar Salida/i)).toBeInTheDocument();
  });
});

describe('PersonalView', () => {
  // Verifies the personal view keeps the shortcut to the booking page
  it('mantiene el enlace para reservar sala', () => {
    render(<PersonalView />);

    expect(screen.getByRole('link', { name: /Reservar una Sala/i })).toHaveAttribute(
      'href',
      'Student/StudyRoomBooker'
    );
  });
});

describe('RepresentativeView', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  // Confirms the representative view opens the delete group modal
  it('abre el modal para eliminar grupo', async () => {
    render(<RepresentativeView groupId="99" />);

    await act(async () => {
      jest.runAllTimers();
    });

    fireEvent.click(screen.getByRole('button', { name: /Eliminar Grupo/i }));
    expect(screen.getByText(/Confirmar Eliminaci/i)).toBeInTheDocument();
  });
});
