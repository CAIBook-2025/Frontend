/// <reference types="cypress" />

Cypress.Commands.add('mockAuth', () => {
  // Mock the Auth0 session
  cy.window().then((win) => {
    // Set mock user data in session storage
    win.sessionStorage.setItem(
      'mockUser',
      JSON.stringify({
        email: 'cris.dmaass@gmail.com',
        name: 'Admin User',
        sub: 'auth0|mock-admin-id',
        role: 'admin',
      })
    );

    // Stub Auth0 client-side methods
    // @ts-expect-error - Stubbing Auth0 methods for testing
    win['@auth0/nextjs-auth0'] = {
      useUser: () => ({
        user: {
          email: 'cris.dmaass@gmail.com',
          name: 'Admin User',
          sub: 'auth0|mock-admin-id',
        },
        error: null,
        isLoading: false,
      }),
      getAccessToken: () => Promise.resolve({ accessToken: 'mock-access-token' }),
    };
  });

  // Intercept Auth0 API endpoints
  cy.intercept('GET', '**/api/auth/me', {
    statusCode: 200,
    body: {
      email: 'cris.dmaass@gmail.com',
      name: 'Admin User',
      sub: 'auth0|mock-admin-id',
    },
  }).as('getAuthMe');

  cy.log('Mock authentication setup complete');
});

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      /**
       * Mock authentication for testing without Auth0
       * @example cy.mockAuth()
       */
      mockAuth(): Chainable<void>;
    }
  }
}

export {};
