// cypress/e2e/auth.cy.js
//
// Tests for the Login and Register pages and related auth flows.
//
// NOTE: These tests stub (fake) the network calls to the back-end API so
// they run even when the server is offline. The stubs are set up with
// cy.intercept() before the page loads.

describe('Authentication', () => {
  // -------------------------------------------------------------------------
  // LOGIN PAGE
  // -------------------------------------------------------------------------
  describe('Login page', () => {
    beforeEach(() => {
      // Make sure we start each test logged-out
      cy.logout();
      cy.visit('/login');
    });

    it('displays the Login form', () => {
      // The modal title should say "Login"
      cy.contains('h2', 'Login').should('be.visible');

      // Both inputs and the submit button must be present
      cy.get('input[autocomplete="username"]').should('be.visible');
      cy.get('input[autocomplete="current-password"]').should('be.visible');
      cy.contains('button', 'Login').should('be.visible');
    });

    it('shows a link/button to navigate to Register', () => {
      cy.contains('button', 'Register').should('be.visible').click();
      cy.url().should('include', '/register');
    });

    it('shows an error message when credentials are invalid', () => {
      // Stub the API to return a 401 Unauthorized response
      cy.intercept('POST', '/api/users/login', {
        statusCode: 401,
        body: { error: 'Invalid credentials' },
      }).as('loginFail');

      cy.get('input[autocomplete="username"]').type('wrong@example.com');
      cy.get('input[autocomplete="current-password"]').type('wrongpassword');
      cy.contains('button', 'Login').click();

      cy.wait('@loginFail');

      // The error message should appear on screen
      cy.contains('Invalid credentials').should('be.visible');

      // We should still be on /login
      cy.url().should('include', '/login');
    });

    it('redirects to the dashboard after a successful login', () => {
      // Stub the API to return a successful login response
      cy.fixture('auth').then((auth) => {
        cy.intercept('POST', '/api/users/login', {
          statusCode: 200,
          body: { user: auth.user, token: auth.token },
        }).as('loginSuccess');

        cy.get('input[autocomplete="username"]').type(auth.credentials.identifier);
        cy.get('input[autocomplete="current-password"]').type(auth.credentials.password);
        cy.contains('button', 'Login').click();

        cy.wait('@loginSuccess');

        // After login we should land on the home/dashboard route
        cy.url().should('eq', Cypress.config('baseUrl') + '/');
      });
    });

    it('requires both fields (HTML5 validation prevents empty submission)', () => {
      // Click Login without filling anything in.
      // Because the inputs have `required`, the browser blocks submission.
      cy.contains('button', 'Login').click();

      // The identifier input should have the "invalid" state
      cy.get('input[autocomplete="username"]').then(($input) => {
        expect($input[0].validity.valid).to.be.false;
      });
    });
  });

  // -------------------------------------------------------------------------
  // REGISTER PAGE
  // -------------------------------------------------------------------------
  describe('Register page', () => {
    beforeEach(() => {
      cy.logout();
      cy.visit('/register');
    });

    it('displays the Register form', () => {
      cy.contains('h2', 'Register').should('be.visible');
      cy.get('input[autocomplete="username"]').should('be.visible');
      cy.get('input[autocomplete="email"]').should('be.visible');
      cy.get('input[autocomplete="new-password"]').should('be.visible');
      cy.contains('button', 'Register').should('be.visible');
    });

    it('shows an error when registration fails', () => {
      cy.intercept('POST', '/api/users/register', {
        statusCode: 400,
        body: { error: 'Username already taken' },
      }).as('registerFail');

      cy.get('input[autocomplete="username"]').type('existinguser');
      cy.get('input[autocomplete="email"]').type('existing@example.com');
      cy.get('input[autocomplete="new-password"]').type('Password123!');
      cy.contains('button', 'Register').click();

      cy.wait('@registerFail');
      cy.contains('Username already taken').should('be.visible');
    });

    it('redirects to the dashboard after successful registration', () => {
      cy.fixture('auth').then((auth) => {
        cy.intercept('POST', '/api/users/register', {
          statusCode: 201,
          body: { user: auth.user, token: auth.token },
        }).as('registerSuccess');

        cy.get('input[autocomplete="username"]').type('newuser');
        cy.get('input[autocomplete="email"]').type('newuser@example.com');
        cy.get('input[autocomplete="new-password"]').type('Password123!');
        cy.contains('button', 'Register').click();

        cy.wait('@registerSuccess');
        cy.url().should('eq', Cypress.config('baseUrl') + '/');
      });
    });
  });

  // -------------------------------------------------------------------------
  // PROTECTED ROUTES
  // -------------------------------------------------------------------------
  describe('Route protection', () => {
    it('redirects unauthenticated users from the dashboard to /login', () => {
      cy.logout();
      cy.visit('/');
      cy.url().should('include', '/login');
    });

    it('redirects unauthenticated users from /transactions to /login', () => {
      cy.logout();
      cy.visit('/transactions');
      cy.url().should('include', '/login');
    });

    it('redirects already-logged-in users away from /login to the dashboard', () => {
      cy.fixture('auth').then((auth) => {
        cy.loginByLocalStorage(auth.user, auth.token);
        cy.visit('/login');
        cy.url().should('eq', Cypress.config('baseUrl') + '/');
      });
    });
  });

  // -------------------------------------------------------------------------
  // LOGOUT
  // -------------------------------------------------------------------------
  describe('Logout', () => {
    it('logs the user out and redirects to /login', () => {
      cy.fixture('auth').then((auth) => {
        cy.loginByLocalStorage(auth.user, auth.token);

        // Stub the dashboard API calls so the page renders without a real server
        cy.intercept('GET', '/api/transactions/summary*', { body: [] }).as('summary');
        cy.intercept('GET', '/api/budgets/summary*', { body: [] }).as('budgetSummary');

        cy.visit('/');

        // Open the user menu and click Logout
        cy.contains(auth.user.username).click();
        cy.contains('button', 'Logout').click();

        // Should end up on the login page
        cy.url().should('include', '/login');

        // localStorage should be cleared
        cy.window().then((win) => {
          expect(win.localStorage.getItem('token')).to.be.null;
          expect(win.localStorage.getItem('user')).to.be.null;
        });
      });
    });
  });
});
