type GroupStatus = 'pending' | 'approved' | 'denied';
type HistoryCategory = 'rooms' | 'events';

const ADMIN_CREDENTIALS = {
  email: 'cris.dmaass@gmail.com',
  password: 'Abcd1234_',
};

const GROUP_STATUS_TEXT: Record<GroupStatus, { tab?: string; header: string }> = {
  pending: {
    header: 'Administrar Grupos - Pendientes',
  },
  approved: {
    tab: 'Aprobados',
    header: 'Administrar Grupos - Aprobados',
  },
  denied: {
    tab: 'Rechazados',
    header: 'Administrar Grupos - Rechazados',
  },
};

const HISTORY_DESCRIPTIONS: Record<HistoryCategory, string> = {
  rooms: 'Registro completo de todas las reservas de salas',
  events: 'Registro completo de todos los eventos realizados',
};


export const loginAsAdmin = () => {
  cy.visit('/');
  cy.contains('Iniciar Sesión').click();

  cy.origin(
    'https://dev-cbra4z7pzibox6lj.us.auth0.com',
    { args: ADMIN_CREDENTIALS },
    ({ email, password }) => {
      cy.get('input[name="username"], input[type="email"]').type(email);
      cy.get('input[name="password"]').type(password);
      cy.get('button[type="submit"], [data-action-button-primary]').filter(':visible').first().click();
    },
  );

  cy.url().should('include', Cypress.config('baseUrl'));
};


export const visitAdminDashboard = () => {
  cy.visit('/Admin');
};


export const openGroupRequests = (status: GroupStatus = 'pending') => {
  const statusConfig = GROUP_STATUS_TEXT[status];

  cy.contains('Ver Todas').click();

  if (statusConfig.tab) {
    cy.contains(statusConfig.tab).click();
  }

  cy.contains(statusConfig.header);
};


export const viewFirstGroupRequestDetails = () => {
  cy.get('button[title="Ver detalles"]').first().click();
  cy.contains('Detalles de la solicitud');
};

export const viewRecentActivitySection = () => {
  cy.contains('Actividad Reciente').scrollIntoView();
};

const openHistoryModal = () => {
  cy.contains('Ver Historial').scrollIntoView().click();
};

const assertHistoryDescription = (category: HistoryCategory) => {
  cy.contains(HISTORY_DESCRIPTIONS[category]).scrollIntoView();
};

const closeHistoryModal = () => {
  cy.get('button.text-gray-500').click();
};

export const viewRoomHistory = () => {
  openHistoryModal();
  assertHistoryDescription('rooms');
};

export const viewEventHistory = () => {
  openHistoryModal();
  closeHistoryModal();
  assertHistoryDescription('events');
};
