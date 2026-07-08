// cypress/support/e2e.js
//
// This file is loaded automatically before every test file.
// It is the right place to set up global configuration and
// import custom commands.

// Import our custom commands so cy.loginByUI(), etc. are available everywhere
import './commands';

// Silently ignore uncaught exceptions that come from the app (not our tests).
// Without this, a JS error inside the React app would fail every test that
// encounters it.  Remove this if you want stricter error checking.
Cypress.on('uncaught:exception', (err) => {
  // Return false to prevent the test from failing
  console.warn('Uncaught exception (ignored):', err.message);
  return false;
});
