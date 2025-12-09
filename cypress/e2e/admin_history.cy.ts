import {
  loginAsAdmin,
  visitAdminDashboard,
  viewRecentActivitySection,
  viewRoomHistory,
  viewEventHistory,
} from '../support/adminFlows';

describe('Admin History Uses', () => {
  beforeEach(() => {
    cy.session('admin-session', loginAsAdmin);
    visitAdminDashboard();
  });

  it('View Admin History Section', () => {
    viewRecentActivitySection();
  });

  it('View Room History', () => {
    viewRoomHistory();
  });

  it('View Event History', () => {
    viewEventHistory();
  });
});
