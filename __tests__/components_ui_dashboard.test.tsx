import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DashboardSection } from '@/components/ui/dashboard/DashboardSection';
import { StatCard } from '@/components/ui/dashboard/QuickStatCard';
import { ActivityCard } from '@/components/ui/dashboard/admin/ActivityCard';
import { AdminToolsCard } from '@/components/ui/dashboard/admin/AdminTools';
import { GroupRequestCard } from '@/components/ui/dashboard/admin/GroupRequestCard';

jest.mock('next/link', () => ({
  __esModule: true,
  default: ({ href, children, ...props }: any) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe('StatCard', () => {
  it('renders icon, value and labels', () => {
    render(
      <StatCard icon={<span data-testid="icon">I</span>} value={10} label="Reservas" footer="Hoy" />
    );

    expect(screen.getByText('Reservas')).toBeInTheDocument();
    expect(screen.getByText('10')).toBeInTheDocument();
    expect(screen.getByText('Hoy')).toBeInTheDocument();
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });
});

describe('DashboardSection', () => {
  it('wraps children and renders action link', () => {
    render(
      <DashboardSection title="Actividad" buttonText="Ver más" href="/actividad">
        <p>Contenido</p>
      </DashboardSection>
    );

    expect(screen.getByRole('heading', { name: /Actividad/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Ver más/i })).toHaveAttribute('href', '/actividad');
    expect(screen.getByText(/Contenido/i)).toBeInTheDocument();
  });
});

describe('ActivityCard', () => {
  it('shows status and details', () => {
    render(<ActivityCard status="Reserva completada" details="Sala A" variant="green" />);

    expect(screen.getByText(/Reserva completada/i)).toBeInTheDocument();
    expect(screen.getByText(/Sala A/i)).toBeInTheDocument();
  });
});

describe('AdminToolsCard', () => {
  it('renders navigation buttons', () => {
    render(<AdminToolsCard />);

    expect(screen.getByRole('link', { name: /Gestionar Grupos/i })).toHaveAttribute(
      'href',
      '/Admin/Groups'
    );
    expect(screen.getByRole('link', { name: /Administrar Salas/i })).toHaveAttribute(
      'href',
      '/Admin/Room'
    );
    expect(screen.getByRole('link', { name: /Sistema de Strikes/i })).toHaveAttribute(
      'href',
      '/Admin/Strikes'
    );
  });
});

describe('GroupRequestCard', () => {
  it('links to group details', () => {
    render(
      <GroupRequestCard title="Club" subtitle="Hace 1 día" id="42" />
    );

    expect(screen.getByText(/Club/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Revisar/i })).toHaveAttribute(
      'href',
      '/Admin/Groups?groupId=42'
    );
  });
});
