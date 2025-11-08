import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    baseUrl: process.env.APP_BASE_URL || 'http://localhost:3000', // <-- usa tu env
    specPattern: 'cypress/e2e/**/*.cy.{js,ts,jsx,tsx}',
  },
});