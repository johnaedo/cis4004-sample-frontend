// cypress/e2e/transactions.cy.js
//
// Tests for the Transaction Manager page (CRUD operations).

// ---------------------------------------------------------------------------
// Sample data we'll reuse in multiple tests
// ---------------------------------------------------------------------------
const CATEGORIES = [
  { _id: 1, name: 'Food', type: 'expense', color: '#FF5733' },
  { _id: 2, name: 'Salary', type: 'income', color: '#28B463' },
];

const TRANSACTIONS = [
  {
    _id: 1,
    amount: 50.0,
    description: 'Grocery shopping',
    category_id: 1,
    category_name: 'Food',
    date: '2024-06-01',
    type: 'expense',
  },
  {
    _id: 2,
    amount: 3000.0,
    description: 'Monthly salary',
    category_id: 2,
    category_name: 'Salary',
    date: '2024-06-01',
    type: 'income',
  },
];

describe('Transaction Manager', () => {
  beforeEach(() => {
    cy.fixture('auth').then((auth) => {
      cy.loginByLocalStorage(auth.user, auth.token);
    });

    // Default stubs – individual tests can override these with cy.intercept()
    cy.intercept('GET', '/api/transactions*', { body: TRANSACTIONS }).as('getTransactions');
    cy.intercept('GET', '/api/categories*', { body: CATEGORIES }).as('getCategories');

    cy.visit('/transactions');
    cy.wait('@getTransactions');
    cy.wait('@getCategories');
  });

  // -------------------------------------------------------------------------
  // READ
  // -------------------------------------------------------------------------
  it('renders the transactions table', () => {
    cy.contains('th', 'Description').should('be.visible');
    cy.contains('th', 'Amount').should('be.visible');
    cy.contains('th', 'Category').should('be.visible');
  });

  it('lists existing transactions', () => {
    cy.contains('td', 'Grocery shopping').should('be.visible');
    cy.contains('td', 'Monthly salary').should('be.visible');
  });

  it('shows expense amounts in red and income in green', () => {
    cy.contains('td', '-$50.00').should('have.class', 'text-red-600');
    cy.contains('td', '+$3000.00').should('have.class', 'text-green-600');
  });

  // -------------------------------------------------------------------------
  // CREATE
  // -------------------------------------------------------------------------
  it('opens the Add Transaction modal when the button is clicked', () => {
    cy.contains('button', 'Add Transaction').click();
    cy.contains('h2', 'Add Transaction').should('be.visible');
  });

  it('adds a new expense transaction', () => {
    const newTransaction = {
      _id: 3,
      amount: 25.0,
      description: 'Coffee',
      category_id: 1,
      category_name: 'Food',
      date: '2024-06-15',
      type: 'expense',
    };

    // Stub the POST and the subsequent GET (after mutation invalidates cache)
    cy.intercept('POST', '/api/transactions', {
      statusCode: 201,
      body: newTransaction,
    }).as('createTransaction');
    cy.intercept('GET', '/api/transactions*', {
      body: [...TRANSACTIONS, newTransaction],
    }).as('getTransactionsAfterCreate');

    cy.contains('button', 'Add Transaction').click();

    // Fill in the form (default type is "expense")
    cy.get('input[type="number"]').type('25');
    cy.get('input[type="text"]').type('Coffee');
    cy.get('select').eq(1).select('1'); // category dropdown
    cy.get('input[type="date"]').type('2024-06-15');

    cy.contains('button', 'Add').click();

    cy.wait('@createTransaction');

    // Modal should close
    cy.contains('h2', 'Add Transaction').should('not.exist');
  });

  it('adds a new income transaction', () => {
    cy.intercept('POST', '/api/transactions', {
      statusCode: 201,
      body: { _id: 4, amount: 500, description: 'Freelance', type: 'income' },
    }).as('createIncome');

    cy.contains('button', 'Add Transaction').click();

    // Switch type to income
    cy.get('select').first().select('income');

    cy.get('input[type="number"]').type('500');
    cy.get('input[type="text"]').type('Freelance');
    cy.get('select').eq(1).select('2'); // Salary category (income type)
    cy.get('input[type="date"]').type('2024-06-20');

    cy.contains('button', 'Add').click();
    cy.wait('@createIncome');
    cy.contains('h2', 'Add Transaction').should('not.exist');
  });

  it('cancels adding a transaction without saving', () => {
    cy.contains('button', 'Add Transaction').click();
    cy.contains('h2', 'Add Transaction').should('be.visible');

    cy.contains('button', 'Cancel').click();
    cy.contains('h2', 'Add Transaction').should('not.exist');
  });

  // -------------------------------------------------------------------------
  // UPDATE
  // -------------------------------------------------------------------------
  it('opens the edit modal pre-filled with the transaction data', () => {
    cy.contains('tr', 'Grocery shopping').contains('button', 'Edit').click();

    // Modal title should say Edit
    cy.contains('h2', 'Edit Transaction').should('be.visible');

    // Description field should be pre-filled
    cy.get('input[type="text"]').should('have.value', 'Grocery shopping');
    cy.get('input[type="number"]').should('have.value', '50');
  });

  it('updates a transaction', () => {
    const updated = { ...TRANSACTIONS[0], description: 'Supermarket run', amount: 65 };

    cy.intercept('PUT', '/api/transactions/1', {
      statusCode: 200,
      body: updated,
    }).as('updateTransaction');
    cy.intercept('GET', '/api/transactions*', {
      body: [updated, TRANSACTIONS[1]],
    }).as('getTransactionsAfterUpdate');

    cy.contains('tr', 'Grocery shopping').contains('button', 'Edit').click();

    cy.get('input[type="text"]').clear().type('Supermarket run');
    cy.get('input[type="number"]').clear().type('65');
    cy.contains('button', 'Update').click();

    cy.wait('@updateTransaction');
    cy.contains('h2', 'Edit Transaction').should('not.exist');
  });

  // -------------------------------------------------------------------------
  // DELETE
  // -------------------------------------------------------------------------
  it('deletes a transaction after confirmation', () => {
    cy.intercept('DELETE', '/api/transactions/1', {
      statusCode: 200,
      body: {},
    }).as('deleteTransaction');
    cy.intercept('GET', '/api/transactions*', {
      body: [TRANSACTIONS[1]],
    }).as('getTransactionsAfterDelete');

    // Cypress auto-accepts window.confirm dialogs by default
    cy.contains('tr', 'Grocery shopping').contains('button', 'Delete').click();

    cy.wait('@deleteTransaction');
  });

  it('shows an empty table when there are no transactions', () => {
    cy.intercept('GET', '/api/transactions*', { body: [] }).as('emptyTransactions');
    cy.visit('/transactions');
    cy.wait('@emptyTransactions');

    // Table header still exists but no data rows
    cy.contains('th', 'Description').should('be.visible');
    cy.get('tbody tr').should('not.exist');
  });
});
