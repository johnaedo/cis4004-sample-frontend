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

// Disable CSS transitions/animations during test runs to avoid timing issues
Cypress.on('window:before:load', (win) => {
  const style = win.document.createElement('style');
  style.id = 'cypress-disable-animations';
  style.innerHTML = `
    *, *::before, *::after {
      transition: none !important;
      animation: none !important;
    }
  `;
  win.document.head.appendChild(style);
});

// Mock third-party Exchange Rate API calls globally to enable offline-ready CI execution
beforeEach(() => {
  cy.intercept('GET', 'https://v6.exchangerate-api.com/**', {
    body: {
      result: 'success',
      base_code: 'USD',
      conversion_rates: {
        USD: 1.0,
        EUR: 0.92,
        GBP: 0.79,
        JPY: 155.5,
        CAD: 1.36,
        AUD: 1.51,
        CNY: 7.24,
      },
    },
  }).as('exchangeRateApi');
});

// Overwrite cy.intercept globally to act as pass-through spies instead of stubs in E2E mode (NO_MOCK)
Cypress.Commands.overwrite('intercept', (originalFn, ...args) => {
  const noMock = Cypress.env('NO_MOCK');
  
  if (noMock) {
    let url = '';
    let handlerIndex = -1;
    
    if (args.length === 3) {
      url = args[1];
      handlerIndex = 2;
    } else if (args.length === 2) {
      if (typeof args[0] === 'string' && typeof args[1] === 'object') {
        url = args[0];
        handlerIndex = 1;
      }
    }
    
    const isLocalApi = typeof url === 'string' && (url.includes('/api') || url.startsWith('/api'));
    
    if (isLocalApi && handlerIndex !== -1) {
      // Remove the mock response payload so it acts as a spy instead of a stub.
      // This routes the request to the real backend while still allowing cy.wait() to work.
      const spyArgs = [...args];
      spyArgs.splice(handlerIndex, 1);
      return originalFn(...spyArgs);
    }
  }
  
  return originalFn(...args);
});
