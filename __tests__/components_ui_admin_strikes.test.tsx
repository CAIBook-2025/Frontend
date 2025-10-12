import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ApplyStrikeModal } from '@/components/ui/admin/strikes/apply-strikes-modal';
import { UserStrikesTable } from '@/components/ui/admin/strikes/strikes-table';

describe('ApplyStrikeModal', () => {
  // Ensures applying a strike submits the collected form data
  it('envia los datos del strike al confirmar', () => {
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
      target: { value: 'No asistio a la reserva' },
    });

    fireEvent.click(screen.getByRole('button', { name: /Aplicar/i }));
    expect(onApply).toHaveBeenCalledWith('user@example.com', 'No Show', 'No asistio a la reserva');
  });
});

describe('UserStrikesTable', () => {
  // Verifies the table allows opening the history modal for a user
  it('invoca el handler de historial cuando se solicita', () => {
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
