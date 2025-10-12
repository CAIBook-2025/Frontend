import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { SearchBar } from '@/components/ui/search-bar';
import { TabNavigation } from '@/components/ui/tab-navigation';

describe('SearchBar', () => {
  // Confirms typing in the search bar notifies the consumer
  it('emite onChange al escribir', () => {
    const handleChange = jest.fn();
    render(<SearchBar placeholder="Buscar..." value="" onChange={handleChange} />);

    const input = screen.getByPlaceholderText(/Buscar/i);
    fireEvent.change(input, { target: { value: 'sala' } });
    expect(handleChange).toHaveBeenCalledWith('sala');
  });
});

describe('TabNavigation', () => {
  // Ensures selecting a tab reports the index back to the parent
  it('invoca onTabChange con el indice clicado', () => {
    const onTabChange = jest.fn();
    const tabs = [
      { label: 'Pendientes', count: 3, active: true },
      { label: 'Aprobados', count: 2, active: false },
    ];
    render(<TabNavigation tabs={tabs} onTabChange={onTabChange} />);

    fireEvent.click(screen.getByRole('button', { name: /Aprobados/i }));
    expect(onTabChange).toHaveBeenCalledWith(1);
  });
});
