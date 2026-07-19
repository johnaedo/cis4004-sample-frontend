// cypress/support/commands.js
//
// This file defines reusable "custom commands" that you can call in any test
// with cy.<commandName>(). Think of them like helper functions.

// ---------------------------------------------------------------------------
// cy.loginByUI(identifier, password)
//
// Logs in through the actual Login page (UI-based login).
// Use this when you want to test the login flow itself.
// ---------------------------------------------------------------------------
Cypress.Commands.add('loginByUI', (identifier, password) => {
  cy.visit('/login');
  cy.get('input[autocomplete="username"]').type(identifier);
  cy.get('input[autocomplete="current-password"]').type(password);
  cy.contains('button', 'Login').click();
  // Wait until we land back on the dashboard
  cy.url().should('eq', Cypress.config('baseUrl') + '/');
});

// ---------------------------------------------------------------------------
// cy.loginByLocalStorage(user, token)
//
// Bypasses the UI by injecting auth data directly into localStorage.
// Use this at the start of tests that are NOT testing login itself –
// it makes those tests faster and independent of the auth API.
//
// Usage:
//   cy.loginByLocalStorage(
//     { id: 1, username: 'testuser', email: 'test@example.com' },
//     'fake-jwt-token'
//   );
// ---------------------------------------------------------------------------
Cypress.Commands.add('loginByLocalStorage', (user, token) => {
  if (Cypress.env('NO_MOCK')) {
    cy.fixture('auth').then((auth) => {
      const credentials = auth.credentials;
      const backendUrl = 'http://localhost:4001/api';
      
      cy.request({
        method: 'POST',
        url: `${backendUrl}/users/register`,
        body: {
          username: auth.user.username,
          email: credentials.identifier,
          password: credentials.password
        },
        failOnStatusCode: false
      }).then(() => {
        cy.request({
          method: 'POST',
          url: `${backendUrl}/users/login`,
          body: {
            identifier: credentials.identifier,
            password: credentials.password
          }
        }).then((response) => {
          const realUser = response.body.user;
          const realToken = response.body.token;
          
          localStorage.setItem('user', JSON.stringify({
            _id: realUser.id,
            username: realUser.username,
            email: realUser.email
          }));
          localStorage.setItem('token', realToken);
        });
      });
    });
  } else {
    localStorage.setItem('user', JSON.stringify(user));
    localStorage.setItem('token', token);
  }
});

// ---------------------------------------------------------------------------
// cy.logout()
//
// Clears auth data from localStorage so the next test starts unauthenticated.
// ---------------------------------------------------------------------------
Cypress.Commands.add('logout', () => {
  localStorage.removeItem('user');
  localStorage.removeItem('token');
});
