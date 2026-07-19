// cypress/e2e/dashboard.cy.js
//
// Tests for the Budget Dashboard (the home / "/" route).

const SUMMARY = [
  { type: 'income', total_amount: 3000, transaction_count: 1 },
  { type: 'expense', total_amount: 1200, transaction_count: 1 }
];

const RECENT_TRANSACTIONS = [
  {
    _id: 1,
    amount: 50,
    description: 'Grocery shopping',
    category_id: 1,
    category_name: 'Food',
    date: '2024-06-01',
    type: 'expense',
  },
  {
    _id: 2,
    amount: 3000,
    description: 'Monthly salary',
    category_id: 2,
    category_name: 'Salary',
    date: '2024-06-01',
    type: 'income',
  },
];

const BUDGET_SUMMARY = [
  {
    _id: 1,
    category_name: 'Food',
    budget_amount: 400,
    spent_amount: 150,
    remaining: 250,
    period: 'monthly',
  },
];

describe('Budget Dashboard', () => {
  beforeEach(() => {
    cy.fixture('auth').then((auth) => {
      cy.loginByLocalStorage(auth.user, auth.token);
    });

    cy.intercept('GET', '/api/transactions/summary*', { body: SUMMARY }).as('getSummary');
    cy.intercept('GET', '/api/budgets/summary*', { body: BUDGET_SUMMARY }).as('getBudgetSummary');
    cy.intercept('GET', '/api/transactions*', { body: RECENT_TRANSACTIONS }).as('getTransactions');
    cy.intercept('GET', '/api/budgets*', { body: BUDGET_SUMMARY }).as('getBudgets');

    cy.visit('/');
  });

  // -------------------------------------------------------------------------
  // LAYOUT
  // -------------------------------------------------------------------------
  it('loads the dashboard without errors', () => {
    cy.url().should('eq', Cypress.config('baseUrl') + '/');
  });

  it('shows summary cards (Income, Expenses, Net Savings)', () => {
    // The dashboard should display high-level financial summaries
    cy.contains(/income/i).should('be.visible');
    cy.contains(/expense/i).should('be.visible');
  });

  it('displays the net savings / balance figure', () => {
    cy.contains(/saving/i).should('be.visible');
  });

  // -------------------------------------------------------------------------
  // RECENT TRANSACTIONS WIDGET
  // -------------------------------------------------------------------------
  it('shows recent transactions on the dashboard', () => {
    cy.contains('Grocery shopping').should('be.visible');
    cy.contains('Monthly salary').should('be.visible');
  });

  // -------------------------------------------------------------------------
  // BUDGET OVERVIEW WIDGET
  // -------------------------------------------------------------------------
  it('shows budget overview with category names', () => {
    cy.contains('Food').should('be.visible');
  });

  // -------------------------------------------------------------------------
  // EMPTY STATE
  // -------------------------------------------------------------------------
  it('handles an empty summary gracefully (no crash)', () => {
    cy.intercept('GET', '/api/transactions/summary*', {
      body: [],
    }).as('emptySummary');
    cy.intercept('GET', '/api/budgets/summary*', { body: [] }).as('emptyBudgets');

    cy.visit('/');

    // Page should still render key structure
    cy.contains(/income/i).should('be.visible');
  });

  // -------------------------------------------------------------------------
  // NAVIGATION FROM DASHBOARD
  // -------------------------------------------------------------------------
  it('navigates to Transactions page via nav link', () => {
    cy.contains('a', 'Transactions').click();
    cy.url().should('include', '/transactions');
  });

  it('navigates to Budgets page via nav link', () => {
    cy.contains('a', 'Budgets').click();
    cy.url().should('include', '/budgets');
  });
});
