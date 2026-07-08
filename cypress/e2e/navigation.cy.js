// cypress/e2e/navigation.cy.js
//
// Tests for the top navigation bar and routing between pages.

describe('Navigation', () => {
  beforeEach(() => {
    // Log in via localStorage so we don't re-test auth here
    cy.fixture('auth').then((auth) => {
      cy.loginByLocalStorage(auth.user, auth.token);
    });

    // Stub every API call the dashboard/nav might make on load
    cy.intercept('GET', '/api/transactions/summary*', { body: [] });
    cy.intercept('GET', '/api/budgets/summary*', { body: [] });
    cy.intercept('GET', '/api/transactions*', { body: [] });
    cy.intercept('GET', '/api/categories*', { body: [] });
    cy.intercept('GET', '/api/budgets*', { body: [] });

    cy.visit('/');
  });

  it('shows the app brand/logo in the navbar', () => {
    cy.contains('Budget Planner').should('be.visible');
  });

  it('navigates to Transactions via the nav link', () => {
    cy.contains('a', 'Transactions').click();
    cy.url().should('include', '/transactions');
  });

  it('navigates to Categories via the nav link', () => {
    cy.contains('a', 'Categories').click();
    cy.url().should('include', '/categories');
  });

  it('navigates to Budgets via the nav link', () => {
    cy.contains('a', 'Budgets').click();
    cy.url().should('include', '/budgets');
  });

  it('navigates to Tax Estimator via the nav link', () => {
    cy.contains('a', 'Tax Estimator').click();
    cy.url().should('include', '/tax-estimator');
  });

  it('navigates back to Dashboard when the logo/brand link is clicked', () => {
    // First navigate away
    cy.contains('a', 'Transactions').click();
    cy.url().should('include', '/transactions');

    // Then click the logo to go back
    cy.contains('a', 'Budget Planner').click();
    cy.url().should('eq', Cypress.config('baseUrl') + '/');
  });

  it('shows the user menu button with the username initial', () => {
    cy.fixture('auth').then((auth) => {
      // The UserMenu shows the first letter of the username
      const initial = auth.user.username[0].toUpperCase();
      cy.contains(initial).should('be.visible');
    });
  });

  it('opens the user dropdown menu when the avatar button is clicked', () => {
    cy.fixture('auth').then((auth) => {
      // Click the user menu button (it shows the username)
      cy.contains(auth.user.username).click();

      // The dropdown should contain Edit Profile and Logout
      cy.contains('button', 'Edit Profile').should('be.visible');
      cy.contains('button', 'Logout').should('be.visible');
    });
  });
});
