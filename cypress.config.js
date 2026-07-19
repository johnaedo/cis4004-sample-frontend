import { defineConfig } from 'cypress';

export default defineConfig({
  e2e: {
    // The base URL of your running dev server.
    // Cypress will prepend this to every cy.visit() call.
    baseUrl: 'http://localhost:8888',

    // Where Cypress looks for test files
    specPattern: 'cypress/e2e/**/*.cy.{js,jsx}',

    // Where support files live
    supportFile: 'cypress/support/e2e.js',

    // Viewport size for tests (desktop)
    viewportWidth: 1280,
    viewportHeight: 800,

    // How long (ms) Cypress waits for commands and assertions before failing
    defaultCommandTimeout: 8000,

    // Slow down video recording – set to false to disable
    video: false,

    // Keep screenshots on failure
    screenshotOnRunFailure: false,
  },
});
