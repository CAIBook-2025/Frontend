import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Input } from '@/components/ui/Input';
import { PageHeader } from '@/components/ui/page-header';
import { SearchBar } from '@/components/ui/search-bar';
import { SearchInput } from '@/components/ui/SearchInput';
import { TabNavigation } from '@/components/ui/tab-navigation';

describe('Input component', () => {
  it('associates label and input correctly', () => {
    render(<Input id="name" label="Nombre" placeholder="Ingresa tu nombre" />);

    const input = screen.getByLabelText('Nombre');
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute('placeholder', 'Ingresa tu nombre');
  });
});

describe('PageHeader', () => {
  it('renders title and subtitle', () => {
    render(<PageHeader title="Dashboard" subtitle="Resumen del día" />);

    expect(screen.getByRole('heading', { name: /Dashboard/i })).toBeInTheDocument();
    expect(screen.getByText(/Resumen del día/i)).toBeInTheDocument();
  });
});

describe('SearchBar', () => {
  it('calls onChange when typing', () => {
    const handleChange = jest.fn();
    render(<SearchBar placeholder="Buscar..." value="" onChange={handleChange} />);

    const input = screen.getByPlaceholderText(/Buscar/i);
    fireEvent.change(input, { target: { value: 'sala' } });
    expect(handleChange).toHaveBeenCalledWith('sala');
  });
});

describe('SearchInput', () => {
  it('renders a labelled input with icon spacing', () => {
    render(<SearchInput id="search" label="Buscar" placeholder="Palabra clave" />);

    const input = screen.getByLabelText('Buscar');
    expect(input).toHaveAttribute('placeholder', 'Palabra clave');
  });
});

describe('TabNavigation', () => {
  it('invokes onTabChange with the clicked index', () => {
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
