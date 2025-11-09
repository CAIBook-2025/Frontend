import { loginAsAdmin, visitAdminDashboard } from '../support/adminFlows';

describe('Admin Strike Uses', () => {
  beforeEach(() => {
    cy.session('admin-session', loginAsAdmin);
    visitAdminDashboard();
  });

  it('View Admin Strike Section', () => {
    cy.contains('Sistema de Strikes').should('exist');
  });

  it('Navigate to Admin Strike Section', () => {
    cy.contains('Sistema de Strikes').click();
    cy.url().should('include', '/Admin/Strikes');
  });

  it('View Strike Modal', () => {
    cy.contains('Sistema de Strikes').click();
    cy.url().should('include', '/Admin/Strikes');
    cy.get('tr:nth-child(1) button.flex').click();
    cy.contains('Historial de Strikes').should('exist');
  });

  it('Add Strike Modal', () => {
    cy.contains('Sistema de Strikes').click();
    cy.url().should('include', '/Admin/Strikes');
    cy.get('button.fixed').scrollIntoView().should('be.visible').click();
    cy.contains('Aplica una sanción a un usuario por incumplimiento de reglas').should('exist');
  });
});
