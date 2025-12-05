import { loginAsAdmin } from '../support/adminFlows';

describe('Admin Auth', () => {
  beforeEach(() => {
    cy.session('admin-session', loginAsAdmin);
  });

  it('Log In as Admin', () => {
    cy.visit('/');
    cy.contains('Admin');
  });
});
