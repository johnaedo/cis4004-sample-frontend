// cypress/e2e/categories.cy.js
//
// Tests for the Category Manager page (CRUD operations).

const CATEGORIES = [
  { _id: 1, name: 'Food', type: 'expense', color: '#FF5733' },
  { _id: 2, name: 'Salary', type: 'income', color: '#28B463' },
  { _id: 3, name: 'Utilities', type: 'expense', color: '#3498DB' },
];

describe('Category Manager', () => {
  beforeEach(() => {
    cy.fixture('auth').then((auth) => {
      cy.loginByLocalStorage(auth.user, auth.token);
    });

    cy.intercept('GET', '/api/categories*', { body: CATEGORIES }).as('getCategories');
    cy.visit('/categories');
    cy.wait('@getCategories');
  });

  // -------------------------------------------------------------------------
  // READ
  // -------------------------------------------------------------------------
  it('displays existing categories', () => {
    cy.contains('Food').should('be.visible');
    cy.contains('Salary').should('be.visible');
    cy.contains('Utilities').should('be.visible');
  });

  it('shows an "Add Category" button', () => {
    cy.contains('button', 'Add Category').should('be.visible');
  });

  // -------------------------------------------------------------------------
  // CREATE
  // -------------------------------------------------------------------------
  it('opens the Add Category modal', () => {
    cy.contains('button', 'Add Category').click();
    // Modal should appear — look for a heading or a name input
    cy.get('input[type="text"]').should('be.visible');
  });

  it('creates a new expense category', () => {
    const newCategory = { _id: 4, name: 'Entertainment', type: 'expense', color: '#9B59B6' };

    cy.intercept('POST', '/api/categories', {
      statusCode: 201,
      body: newCategory,
    }).as('createCategory');
    cy.intercept('GET', '/api/categories*', {
      body: [...CATEGORIES, newCategory],
    }).as('getCategoriesAfterCreate');

    cy.contains('button', 'Add Category').click();

    // Fill in name (type select defaults to "expense")
    cy.get('input[type="text"]').type('Entertainment');

    cy.contains('button', 'Save').click();
    cy.wait('@createCategory');

    // Modal should close
    cy.get('input[type="text"]').should('not.exist');
  });

  it('cancels adding a category without saving', () => {
    cy.contains('button', 'Add Category').click();
    cy.get('input[type="text"]').should('be.visible');

    cy.contains('button', 'Cancel').click();
    cy.get('input[type="text"]').should('not.exist');
  });

  // -------------------------------------------------------------------------
  // UPDATE
  // -------------------------------------------------------------------------
  it('opens the edit modal pre-filled with the category name', () => {
    cy.contains('tr', 'Food').contains('button', 'Edit').click();
    cy.get('input[type="text"]').should('have.value', 'Food');
  });

  it('updates a category name', () => {
    const updated = { ...CATEGORIES[0], name: 'Groceries' };

    cy.intercept('PUT', '/api/categories/1', {
      statusCode: 200,
      body: updated,
    }).as('updateCategory');
    cy.intercept('GET', '/api/categories*', {
      body: [updated, ...CATEGORIES.slice(1)],
    }).as('getCategoriesAfterUpdate');

    cy.contains('tr', 'Food').contains('button', 'Edit').click();
    cy.get('input[type="text"]').clear().type('Groceries');
    cy.contains('button', 'Save').click();

    cy.wait('@updateCategory');
    cy.get('input[type="text"]').should('not.exist');
  });

  // -------------------------------------------------------------------------
  // DELETE
  // -------------------------------------------------------------------------
  it('deletes a category after confirmation', () => {
    cy.intercept('DELETE', '/api/categories/3', {
      statusCode: 200,
      body: {},
    }).as('deleteCategory');
    cy.intercept('GET', '/api/categories*', {
      body: CATEGORIES.slice(0, 2),
    }).as('getCategoriesAfterDelete');

    cy.contains('tr', 'Utilities').contains('button', 'Delete').click();
    cy.wait('@deleteCategory');
  });

  it('displays an empty state when there are no categories', () => {
    cy.intercept('GET', '/api/categories*', { body: [] }).as('emptyCategories');
    cy.visit('/categories');
    cy.wait('@emptyCategories');

    cy.contains('button', 'Add Category').should('be.visible');
    cy.get('tbody tr').should('not.exist');
  });
});
