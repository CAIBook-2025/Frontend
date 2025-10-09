import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ApplyStrikeModal } from '@/components/ui/admin/strikes/apply-strikes-modal';
import { StrikeHistoryTable } from '@/components/ui/admin/strikes/strikes-history-table';
import { UserStrikesHistoryModal } from '@/components/ui/admin/strikes/strikes-modal';
import { UserStrikesTable } from '@/components/ui/admin/strikes/strikes-table';

describe('ApplyStrikeModal', () => {
  it('submits strike data', () => {
    const onApply = jest.fn();
    const onClose = jest.fn();
    render(
      <ApplyStrikeModal isOpen onApply={onApply} onClose={onClose} />
    );

    fireEvent.change(screen.getByLabelText(/Email del Usuario/i), {
      target: { value: 'user@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Tipo de Infr/i), {
      target: { value: 'No Show' },
    });
    fireEvent.change(screen.getByLabelText(/Descripci/i), {
      target: { value: 'No asistió a la reserva' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Aplicar Strike/i }));
    expect(onApply).toHaveBeenCalledWith('user@example.com', 'No Show', 'No asistió a la reserva');
  });
});

describe('StrikeHistoryTable', () => {
  it('renders strike entries with type badges', () => {
    const strikes = [
      {
        id: '1',
        userId: '1',
        userName: 'Juan',
        userEmail: 'juan@example.com',
        type: 'No-show' as const,
        reason: 'No asistió',
        appliedBy: 'Admin',
        date: '01/10/2024',
      },
    ];

    render(<StrikeHistoryTable strikes={strikes} />);

    expect(screen.getByText(/Juan/i)).toBeInTheDocument();
    expect(screen.getByText(/No Show/i)).toBeInTheDocument();
  });
});

describe('UserStrikesHistoryModal', () => {
  it('shows user summary and strike list', () => {
    const strikes = [
      {
        id: 'st-1',
        userId: 'u1',
        userName: 'María',
        userEmail: 'maria@example.com',
        type: 'Misuse' as const,
        reason: 'Uso indebido',
        appliedBy: 'Admin',
        date: '02/10/2024',
      },
    ];

    render(
      <UserStrikesHistoryModal
        isOpen
        onClose={jest.fn()}
        userName="María"
        userEmail="maria@example.com"
        currentStrikes={2}
        maxStrikes={3}
        status="Advertencia"
        strikes={strikes as any}
      />
    );

    expect(screen.getByText(/Maria/i)).toBeInTheDocument();
    expect(screen.getByText(/Strikes actuales/i)).toBeInTheDocument();
    expect(screen.getByText(/Uso indebido/i)).toBeInTheDocument();
  });
});

describe('UserStrikesTable', () => {
  it('invokes view history handler', () => {
    const users = [
      {
        id: '1',
        name: 'Ana',
        email: 'ana@example.com',
        strikes: 1,
        maxStrikes: 3,
        lastStrike: '10/10/2024',
        status: 'Activo' as const,
      },
    ];
    const onViewHistory = jest.fn();

    render(<UserStrikesTable users={users as any} onViewHistory={onViewHistory} />);

    fireEvent.click(screen.getByRole('button', { name: /Historial/i }));
    expect(onViewHistory).toHaveBeenCalledWith(expect.objectContaining({ id: '1' }));
  });
});
