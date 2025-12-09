// ***********************************************************
// This example support/e2e.ts is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

// Import commands.js using ES2015 syntax:
import './commands';
import { setupApiMocks } from './mockApi';

// Setup API mocks if in mock mode
beforeEach(() => {
  const isMockMode = Cypress.env('apiMode') === 'mock';

  if (isMockMode) {
    cy.log('Running in MOCK mode - API calls will be intercepted');
    setupApiMocks();
    cy.log('API mocks setup complete');
  } else {
    cy.log('Running in LIVE mode - API calls will hit the backend');
  }
});
