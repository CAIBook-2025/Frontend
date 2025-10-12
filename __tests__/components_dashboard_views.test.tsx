import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { GroupsView } from '../components/dashboard/GroupsView';
import { PartnerView } from '../components/dashboard/PartnerView';
import { PersonalView } from '../components/dashboard/PersonalView';
import { RepresentativeView } from '../components/dashboard/RepresentativeView';

jest.mock('next/link', () => {
  // compat con ESM/CJS si hace falta:
  return ({ href, children, ...rest }) => {
    const toHref = (h) => {
      if (typeof h === 'string') return h;
      if (!h || typeof h !== 'object') return '';
      const qs = h.query ? `?${new URLSearchParams(h.query).toString()}` : '';
      const base = h.pathname ?? '';
      const hash = h.hash ? `#${h.hash}` : '';
      return `${base}${qs}${hash}`;
    };
    return <a href={toHref(href)} {...rest}>{children}</a>;
  };
});


describe('GroupsView', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('muestra enlace para crear grupo tras cargar datos', async () => {
    const userId = 123;

    render(<GroupsView userId={userId} />);

    await act(async () => {
      jest.runAllTimers();
    });

    const link = await screen.findByRole('link', { name: /Crear Grupo/i });

    expect(link).toHaveAttribute('href', `Student/Groups/Form?userId=${userId}`);

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
  it('mantiene el enlace para reservar sala', () => {
    const stats = { reservasActivas: 2, strikes: 0, userId: 123 };

    render(<PersonalView stats={stats} />);

    const link = screen.getByRole('link', { name: /Reservar una Sala/i });
    expect(link).toHaveAttribute('href', `/Student/StudyRoomBooker?userId=${stats.userId}`);
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
