import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { DashboardSection } from '@/components/ui/dashboard/DashboardSection';
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

describe('DashboardSection', () => {
  // Verifies action links keep pointing to the provided href
  it('renderiza el enlace de accion con el href esperado', () => {
    render(
      <DashboardSection title="Actividad" buttonText="Ver mas" href="/actividad">
        <p>Contenido</p>
      </DashboardSection>
    );

    expect(screen.getByRole('link', { name: /Ver mas/i })).toHaveAttribute('href', '/actividad');
  });
});

describe('AdminToolsCard', () => {
  // Ensures each admin tool navigates to the right management page
  it('expone enlaces de navegacion hacia las herramientas clave', () => {
    render(<AdminToolsCard />);

    expect(screen.getByRole('link', { name: /Gestionar Grupos/i })).toHaveAttribute('href', '/Admin/Groups');
    expect(screen.getByRole('link', { name: /Administrar Salas/i })).toHaveAttribute('href', '/Admin/Room');
    expect(screen.getByRole('link', { name: /Sistema de Strikes/i })).toHaveAttribute('href', '/Admin/Strikes');
  });
});

describe('GroupRequestCard', () => {
  // Confirms the review button navigates to the selected group
  it('dirige a la revision del grupo correcto', () => {
    render(<GroupRequestCard title="Club" subtitle="Hace 1 dia" id="42" />);

    expect(screen.getByRole('link', { name: /Revisar/i })).toHaveAttribute('href', '/Admin/Groups?groupId=42');
  });
});
