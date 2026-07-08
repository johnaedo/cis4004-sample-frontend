// cypress/e2e/taxEstimator.cy.js
//
// Tests for the Tax Estimator page.
// This page is entirely client-side (no API calls) so no stubs are needed.

describe('Tax Estimator', () => {
  beforeEach(() => {
    cy.fixture('auth').then((auth) => {
      cy.loginByLocalStorage(auth.user, auth.token);
    });
    cy.visit('/tax-estimator');
  });

  // -------------------------------------------------------------------------
  // PAGE STRUCTURE
  // -------------------------------------------------------------------------
  it('renders the Tax Estimator page', () => {
    // Look for a heading or calculator label
    cy.contains(/tax estimator/i).should('be.visible');
  });

  it('shows the Basic Info tab by default', () => {
    cy.contains(/basic/i).should('be.visible');
  });

  it('shows income and filing status fields', () => {
    cy.get('input[name="income"]').should('be.visible');
    cy.get('select[name="filingStatus"]').should('be.visible');
  });

  it('shows a Calculate button', () => {
    cy.contains('button', /calculate/i).should('be.visible');
  });

  // -------------------------------------------------------------------------
  // CALCULATION – SINGLE FILER
  // -------------------------------------------------------------------------
  it('calculates estimated federal tax for a single filer', () => {
    cy.get('input[name="income"]').clear().type('60000');
    cy.get('select[name="filingStatus"]').select('single');

    cy.contains('button', /calculate/i).click();

    // The result section should appear with some dollar amount
    cy.contains(/federal tax/i).should('be.visible');
    cy.contains(/\$/).should('be.visible');
  });

  it('calculates estimated federal tax for a married filer', () => {
    cy.get('input[name="income"]').clear().type('120000');
    cy.get('select[name="filingStatus"]').select('married');

    cy.contains('button', /calculate/i).click();

    cy.contains(/federal tax/i).should('be.visible');
    cy.contains(/\$/).should('be.visible');
  });

  it('calculates tax for head of household filing status', () => {
    cy.get('input[name="income"]').clear().type('75000');
    cy.get('select[name="filingStatus"]').select('headOfHousehold');

    cy.contains('button', /calculate/i).click();

    cy.contains(/\$/).should('be.visible');
  });

  // -------------------------------------------------------------------------
  // STATE TAX
  // -------------------------------------------------------------------------
  it('includes state tax when a state is selected', () => {
    cy.get('input[name="income"]').clear().type('80000');
    cy.get('select[name="filingStatus"]').select('single');

    // Select a state (Florida = no income tax; California = high income tax)
    cy.get('select[name="state"]').select('CA');

    cy.contains('button', /calculate/i).click();

    cy.contains(/state tax/i).should('be.visible');
  });

  // -------------------------------------------------------------------------
  // SELF-EMPLOYMENT INCOME
  // -------------------------------------------------------------------------
  it('calculates self-employment tax when self-employment income is entered', () => {
    cy.get('input[name="income"]').clear().type('50000');
    cy.get('input[name="selfEmploymentIncome"]').clear().type('20000');
    cy.get('select[name="filingStatus"]').select('single');

    cy.contains('button', /calculate/i).click();

    cy.contains(/self.employment/i).should('be.visible');
  });

  // -------------------------------------------------------------------------
  // EDGE CASES
  // -------------------------------------------------------------------------
  it('shows a result section with $0 or similar for zero income', () => {
    cy.get('input[name="income"]').clear().type('0');
    cy.get('select[name="filingStatus"]').select('single');

    cy.contains('button', /calculate/i).click();

    // Should not crash; some result should render
    cy.contains(/\$/).should('be.visible');
  });

  it('shows a result section for very high income', () => {
    cy.get('input[name="income"]').clear().type('1000000');
    cy.get('select[name="filingStatus"]').select('single');

    cy.contains('button', /calculate/i).click();

    cy.contains(/federal tax/i).should('be.visible');
    cy.contains(/\$/).should('be.visible');
  });

  // -------------------------------------------------------------------------
  // TABS
  // -------------------------------------------------------------------------
  it('can switch to a second tab (deductions / advanced)', () => {
    // The TaxEstimator has multiple tabs — click one that isn't "basic"
    cy.contains('button', /deduction/i).click();
    cy.contains(/deduction/i).should('be.visible');
  });
});
