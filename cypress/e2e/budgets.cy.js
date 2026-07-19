// cypress/e2e/budgets.cy.js
//
// Tests for the Budget Manager page (CRUD + summary display).

const CATEGORIES = [
  { _id: 1, name: 'Food', type: 'expense', color: '#FF5733' },
  { _id: 2, name: 'Utilities', type: 'expense', color: '#3498DB' },
];

const BUDGETS = [
  {
    _id: 1,
    category_id: 1,
    category_name: 'Food',
    amount: 400,
    period: 'monthly',
    spent: 150,
    remaining: 250,
  },
  {
    _id: 2,
    category_id: 2,
    category_name: 'Utilities',
    amount: 200,
    period: 'monthly',
    spent: 80,
    remaining: 120,
  },
];

describe('Budget Manager', () => {
  beforeEach(() => {
    cy.fixture('auth').then((auth) => {
      cy.loginByLocalStorage(auth.user, auth.token);
    });

    cy.intercept('GET', '/api/budgets*', { body: BUDGETS }).as('getBudgets');
    cy.intercept('GET', '/api/categories*', { body: CATEGORIES }).as('getCategories');

    cy.visit('/budgets');
    cy.wait('@getBudgets');
    cy.wait('@getCategories');
  });

  // -------------------------------------------------------------------------
  // READ
  // -------------------------------------------------------------------------
  it('displays existing budgets', () => {
    cy.contains('Food').should('be.visible');
    cy.contains('Utilities').should('be.visible');
  });

  it('shows the budget amount for each budget', () => {
    // Budget amounts should appear somewhere on the page
    cy.contains('400').should('be.visible');
    cy.contains('200').should('be.visible');
  });

  it('shows an "Add Budget" button', () => {
    cy.contains('button', 'Add Budget').should('be.visible');
  });

  // -------------------------------------------------------------------------
  // CREATE
  // -------------------------------------------------------------------------
  it('opens the Add Budget modal', () => {
    cy.contains('button', 'Add Budget').click();
    // A form should appear (look for amount input)
    cy.get('input[type="number"]').should('be.visible');
  });

  it('creates a new budget', () => {
    const newBudget = {
      _id: 3,
      category_id: 1,
      category_name: 'Food',
      amount: 300,
      period: 'monthly',
      spent: 0,
      remaining: 300,
    };

    cy.intercept('POST', '/api/budgets', {
      statusCode: 201,
      body: newBudget,
    }).as('createBudget');
    cy.intercept('GET', '/api/budgets*', {
      body: [...BUDGETS, newBudget],
    }).as('getBudgetsAfterCreate');

    cy.contains('button', 'Add Budget').click();

    cy.get('input[type="number"]').type('300');
    cy.get('select').first().select('1'); // category
    cy.contains('button', 'Save').click();

    cy.wait('@createBudget');
    cy.get('input[type="number"]').should('not.exist');
  });

  it('cancels adding a budget', () => {
    cy.contains('button', 'Add Budget').click();
    cy.get('input[type="number"]').should('be.visible');
    cy.contains('button', 'Cancel').click();
    cy.get('input[type="number"]').should('not.exist');
  });

  // -------------------------------------------------------------------------
  // UPDATE
  // -------------------------------------------------------------------------
  it('opens the edit modal for a budget', () => {
    cy.contains('tr', 'Food').contains('button', 'Edit').click();
    cy.get('input[type="number"]').should('have.value', '400');
  });

  it('updates a budget amount', () => {
    const updated = { ...BUDGETS[0], amount: 450, remaining: 300 };

    cy.intercept('PUT', '/api/budgets/1', {
      statusCode: 200,
      body: updated,
    }).as('updateBudget');

    cy.contains('tr', 'Food').contains('button', 'Edit').click();
    cy.get('input[type="number"]').clear().type('450');
    cy.contains('button', 'Save').click();

    cy.wait('@updateBudget');
    cy.get('input[type="number"]').should('not.exist');
  });

  // -------------------------------------------------------------------------
  // DELETE
  // -------------------------------------------------------------------------
  it('deletes a budget after confirmation', () => {
    cy.intercept('DELETE', '/api/budgets/2', {
      statusCode: 200,
      body: {},
    }).as('deleteBudget');

    cy.contains('tr', 'Utilities').contains('button', 'Delete').click();
    cy.wait('@deleteBudget');
  });

  // -------------------------------------------------------------------------
  // EMPTY STATE
  // -------------------------------------------------------------------------
  it('shows an empty state when no budgets exist', () => {
    cy.intercept('GET', '/api/budgets*', { body: [] }).as('emptyBudgets');
    cy.visit('/budgets');
    cy.wait('@emptyBudgets');

    cy.contains('button', 'Add Budget').should('be.visible');
    cy.get('tbody tr').should('not.exist');
  });
});
