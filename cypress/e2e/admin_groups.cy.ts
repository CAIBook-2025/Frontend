import {
  loginAsAdmin,
  visitAdminDashboard,
  openGroupRequests,
  viewFirstGroupRequestDetails,
} from '../support/adminFlows';

describe('Admin Group Uses', () => {
  beforeEach(() => {
    cy.session('admin-session', loginAsAdmin);
    visitAdminDashboard();
  });

  it('View Admin Dashboard', () => {
    cy.contains('Herramientas de Administración');
  });

  it('View Pending Group Requests', () => {
    openGroupRequests('pending');
    viewFirstGroupRequestDetails();
  });

  it('View Approved Group Requests', () => {
    openGroupRequests('approved');
  });

  it('View Denied Group Requests', () => {
    openGroupRequests('denied');
  });
});
