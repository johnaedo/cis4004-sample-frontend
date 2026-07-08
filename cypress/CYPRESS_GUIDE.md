# Cypress Testing Guide
### Budget Planner – `client/` front-end

---

## Table of Contents

1. [What is Cypress?](#1-what-is-cypress)
2. [Prerequisites](#2-prerequisites)
3. [Installing Cypress](#3-installing-cypress)
4. [Project Structure](#4-project-structure)
5. [Running the Tests](#5-running-the-tests)
6. [Understanding the Test Files](#6-understanding-the-test-files)
7. [How Stubs (cy.intercept) Work](#7-how-stubs-cyintercept-work)
8. [How the Login Helper Works](#8-how-the-login-helper-works)
9. [Writing Your Own Tests](#9-writing-your-own-tests)
10. [Common Commands Cheat Sheet](#10-common-commands-cheat-sheet)
11. [Troubleshooting](#11-troubleshooting)

---

## 1. What is Cypress?

Cypress is an **end-to-end (E2E) testing framework** for web applications.  
Where a unit test checks a single function in isolation, an E2E test controls a real browser, loads your actual app, clicks buttons, fills forms, and checks what appears on screen — exactly as a human user would.

**Key ideas to know before you begin:**

| Term | Plain-English meaning |
|---|---|
| **Test file** | A `.cy.js` file that contains one or more tests |
| **`describe()`** | A named group of related tests (like a chapter heading) |
| **`it()`** | A single test case (like one exam question) |
| **`beforeEach()`** | Code that runs automatically before *every* `it()` in a `describe()` block |
| **`cy.`** | The Cypress global — every browser command starts with `cy.` |
| **Stub / intercept** | A fake API response so tests don't need a real running server |
| **Fixture** | A JSON file containing reusable test data |

---

## 2. Prerequisites

You need **Node.js** installed on your computer.  
Cypress requires **Node.js 18 or newer**.

To check your version, open a terminal and run:

```
node --version
```

If you see `v18.x.x` or higher you are good.  
If not, download the latest LTS release from [https://nodejs.org](https://nodejs.org).

---

## 3. Installing Cypress

All commands below must be run from inside the **`client/`** folder of the project.

```bash
# Step 1 – move into the client directory
cd path/to/cis4004-project-template/client

# Step 2 – install all dependencies (including Cypress, which was added to package.json)
npm install
```

That's it. Cypress is now installed into `client/node_modules/`.

> **Why no separate install step?**  
> Cypress was added to the `devDependencies` section of `client/package.json`, so
> `npm install` picks it up automatically along with all the other packages.

---

## 4. Project Structure

After installation, the `client/` folder looks like this (new files highlighted with `<--`):

```
client/
├── cypress/                          <-- All test-related files live here
│   ├── e2e/                          <-- The actual test files
│   │   ├── auth.cy.js                    Login, Register, route protection
│   │   ├── navigation.cy.js              Nav bar and routing
│   │   ├── dashboard.cy.js               Home / dashboard page
│   │   ├── transactions.cy.js            Transaction CRUD
│   │   ├── categories.cy.js              Category CRUD
│   │   ├── budgets.cy.js                 Budget CRUD
│   │   └── taxEstimator.cy.js            Tax calculator
│   ├── fixtures/
│   │   └── auth.json                     Reusable test data (user, token, credentials)
│   └── support/
│       ├── commands.js                   Custom helper commands (cy.loginByUI, etc.)
│       └── e2e.js                        Auto-loaded before every test file
├── cypress.config.js                 <-- Cypress configuration
├── package.json                      <-- Updated with cy:open and cy:run scripts
└── src/                              (your existing React source — unchanged)
```

---

## 5. Running the Tests

You always need **two terminals open at the same time**.

### Terminal 1 – Start the dev server

Cypress needs your app to be running in a browser so it has something to test.

```bash
cd path/to/cis4004-project-template/client
npm run dev
```

Leave this terminal open. You should see output like:
```
  VITE v5.x.x  ready in 300ms
  ➜  Local:   http://localhost:8080/
```

### Terminal 2 – Run Cypress

Open a **second** terminal tab/window:

```bash
cd path/to/cis4004-project-template/client
```

Then choose one of the two modes below:

---

#### Mode A – Interactive mode (recommended for learning and development)

```bash
npm run cy:open
```

This opens the **Cypress App**, a graphical interface where you can:
- Pick which test file to run
- Watch the browser open and execute each step in real time
- Click on any step to see a snapshot of what the page looked like at that moment
- See pass/fail status with detailed error messages

**Step by step:**
1. Run `npm run cy:open`
2. Click **"E2E Testing"** in the Cypress App
3. Choose a browser (Chrome is recommended)
4. Click **"Start E2E Testing in Chrome"**
5. Click any `.cy.js` file to run it

---

#### Mode B – Headless mode (for CI / automated pipelines)

```bash
npm run cy:run
```

This runs all tests in the terminal with no visible browser window. Useful for checking everything passes before committing code.

---

## 6. Understanding the Test Files

### `auth.cy.js` – Authentication

Covers:
- Login form renders correctly
- Successful login redirects to the dashboard
- Wrong credentials show an error message
- Register form works
- Protected routes redirect unauthenticated users to `/login`
- Already-logged-in users are redirected away from `/login`
- Logout clears localStorage and redirects

### `navigation.cy.js` – Nav bar

Covers:
- Brand/logo is visible
- Each nav link takes you to the right page
- User menu opens and shows Edit Profile / Logout

### `dashboard.cy.js` – Home page

Covers:
- Dashboard loads without errors
- Summary cards (Income, Expenses, Savings) are visible
- Recent transactions appear
- Budget overview appears
- Empty state (no data) doesn't crash the page

### `transactions.cy.js` – Transaction Manager

Covers:
- Table renders with correct columns
- Income amounts shown in green, expenses in red
- Add Transaction modal opens
- Creating an expense transaction (form → POST stub → modal closes)
- Creating an income transaction
- Cancelling without saving
- Edit modal pre-fills existing data
- Updating a transaction
- Deleting a transaction
- Empty state (no transactions)

### `categories.cy.js` – Category Manager

Covers full CRUD for categories (same pattern as transactions).

### `budgets.cy.js` – Budget Manager

Covers full CRUD for budgets, including the amount display.

### `taxEstimator.cy.js` – Tax Estimator

Covers:
- Page renders
- Income + filing status fields present
- Calculate button exists
- Tax results appear after submission (single, married, head of household)
- State tax is shown when a state is selected
- Self-employment income section
- Edge cases: $0 income, $1,000,000 income
- Tab switching (Basic → Deductions)

---

## 7. How Stubs (cy.intercept) Work

Most tests use `cy.intercept()` to **fake the back-end API**.  
This means the tests work even when the server is not running.

Here is a simple example from `transactions.cy.js`:

```js
// Before the test runs, tell Cypress:
// "Whenever the app makes a GET request to /api/transactions,
//  pretend the server replied with this data instead."
cy.intercept('GET', '/api/transactions*', { body: TRANSACTIONS }).as('getTransactions');

// Visit the page
cy.visit('/transactions');

// Wait until the app has made (and received) that stubbed request
cy.wait('@getTransactions');
```

The `.as('getTransactions')` part gives the intercept an alias so you can
reference it in `cy.wait()`. The `*` at the end of the URL is a wildcard —
it matches `/api/transactions`, `/api/transactions?month=6`, etc.

---

## 8. How the Login Helper Works

Most tests need the user to already be logged in. Re-testing the login form in
every single test would be slow and fragile. Instead, two custom helpers are
available (defined in `cypress/support/commands.js`):

### `cy.loginByLocalStorage(user, token)`

Directly writes auth data into `localStorage` — no browser interaction needed.
This is used in the `beforeEach()` of almost every test file:

```js
beforeEach(() => {
  cy.fixture('auth').then((auth) => {
    cy.loginByLocalStorage(auth.user, auth.token);
  });
});
```

`cy.fixture('auth')` loads the data from `cypress/fixtures/auth.json`.

### `cy.loginByUI(identifier, password)`

Actually visits `/login`, types credentials, and clicks Login.
Use this only in `auth.cy.js` where you are explicitly testing the login flow.

---

## 9. Writing Your Own Tests

Here is a minimal template to add a new test:

```js
// cypress/e2e/myNewFeature.cy.js

describe('My Feature', () => {
  beforeEach(() => {
    // Log in so the app thinks we are authenticated
    cy.fixture('auth').then((auth) => {
      cy.loginByLocalStorage(auth.user, auth.token);
    });

    // Stub any API calls the page will make
    cy.intercept('GET', '/api/something*', { body: [] }).as('getData');

    // Navigate to the page
    cy.visit('/my-page');
    cy.wait('@getData');
  });

  it('shows some text on the page', () => {
    cy.contains('Hello World').should('be.visible');
  });

  it('clicks a button and checks the result', () => {
    cy.contains('button', 'Click Me').click();
    cy.contains('You clicked it!').should('be.visible');
  });
});
```

**Selectors — how to target elements:**

```js
// By text content (most readable)
cy.contains('Submit')
cy.contains('button', 'Save')

// By HTML attribute
cy.get('input[type="email"]')
cy.get('[data-cy="login-button"]')   // ← best practice: add data-cy attrs to your app

// By CSS class (fragile — avoid if possible)
cy.get('.modal-title')
```

---

## 10. Common Commands Cheat Sheet

| Command | What it does |
|---|---|
| `cy.visit('/path')` | Navigate to a URL (baseUrl is prepended) |
| `cy.contains('text')` | Find an element that contains this text |
| `cy.contains('button', 'Save')` | Find a `<button>` with text "Save" |
| `cy.get('selector')` | Find element(s) by CSS selector |
| `.click()` | Click the element |
| `.type('hello')` | Type into an input field |
| `.clear()` | Clear an input field |
| `.select('option')` | Choose an option in a `<select>` dropdown |
| `.should('be.visible')` | Assert the element is visible |
| `.should('not.exist')` | Assert the element is gone from the DOM |
| `.should('have.value', 'x')` | Assert an input's value |
| `.should('have.class', 'foo')` | Assert a CSS class is present |
| `cy.url().should('include', '/path')` | Assert the current URL |
| `cy.intercept('GET', '/api/x', {...})` | Stub an API call |
| `cy.wait('@alias')` | Wait for a stubbed/spied request to complete |
| `cy.fixture('file')` | Load data from `cypress/fixtures/file.json` |
| `cy.window()` | Access the browser's `window` object |

---

## 11. Troubleshooting

### "Cannot find module 'cypress'"
You have not installed dependencies yet. Run `npm install` inside `client/`.

### Tests fail with "cy.visit() failed because the server responded with 502"
The Vite dev server is not running. Start it with `npm run dev` in a separate terminal.

### "baseUrl is not set" warning
Make sure `cypress.config.js` exists in the `client/` folder (it was created as part of this setup).

### "Cannot read properties of undefined" in a test
The API stub may not be returning the shape the component expects. Check your
fixture data in `cypress/fixtures/auth.json` and the inline stub objects in the
test file.

### Tests pass in `cy:open` but fail in `cy:run`
Headless Electron (the default runner for `cy:run`) renders slightly differently.
Add `.should('be.visible')` checks before interacting with elements, and use
`cy.wait('@alias')` after intercepts instead of relying on timing.

### A test randomly passes/fails (flaky tests)
Add an explicit `cy.wait('@alias')` after `cy.intercept()` stubs so Cypress waits
for the network call before proceeding, rather than assuming the data is already there.

---

## Quick-start summary (copy-paste)

```bash
# Terminal 1 – app server (keep running)
cd client
npm run dev

# Terminal 2 – Cypress interactive mode
cd client
npm run cy:open

# Terminal 2 – OR run all tests headlessly
cd client
npm run cy:run
```
