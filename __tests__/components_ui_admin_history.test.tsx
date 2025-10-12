import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { FilterComponent } from '@/components/ui/admin/history/filter-search';

describe('FilterComponent', () => {
  // Ensures updating filters reflects the new values in the UI
  it('actualiza los filtros internos cuando cambia el usuario', () => {
    render(<FilterComponent />);

    const searchInput = screen.getByPlaceholderText(/Buscar/i);
    fireEvent.change(searchInput, { target: { value: 'Sala' } });
    expect(screen.getByDisplayValue('Sala')).toBeInTheDocument();

    const statusSelect = screen.getByDisplayValue(/Todos los estados/i);
    fireEvent.change(statusSelect, { target: { value: 'completed' } });
    expect(screen.getByDisplayValue(/Completado/i)).toBeInTheDocument();
  });
});
