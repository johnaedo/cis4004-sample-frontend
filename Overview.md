# Frontend Directory Walk-through
This directory contains our React frontend application. Here's how it's organized:

## Core Structure:
`src/` This is where all our frontend code lives.
- `main.jsx` The entry point of our React application that sets up React Query and renders the App component.
- `App.jsx` The main component that handles routing and authentication state.
- `index.css` & `App.css`: Global styling files, with `App.css` containing application-wide styles.

## Key Directories:
`src/components/` Reusable UI components.
- Contains modular components like forms, buttons, navigation elements, and other UI pieces.
- These components are designed to be reusable across different pages.
`src/pages/` Page-level components.
- Each file represents a different page/route in our application.
- Pages combine multiple components to create complete views.
`src/context/` React context providers.
- Manages global state that needs to be accessed by multiple components.
- Likely includes authentication context for user login state.
`src/api/` API integration.
- Contains functions that make HTTP requests to our backend.
- Organizes API calls by feature (users, transactions, budgets, etc.).
`src/utils/` Utility functions.
- Helper functions and common logic used throughout the application.
- May include date formatting, validation, calculations, etc.
`src/assets/` Static assets.
- Images, icons, and other static files used in the UI.

## Configuration Files
- `vite.config.js` Configuration for the Vite build tool.
- `tailwind.config.js` Tailwind CSS configuration.
- `postcss.config.js` PostCSS configuration for processing CSS.
- `eslint.config.js` ESLint rules for code quality.

# How Data Flows Through the Application
1. **User Interaction:** User interacts with a component in the React frontend.
2. **API Call:** Frontend makes an API call to the backend using functions from the `api/` directory.
3. **State Update:** Frontend updates its state with React Query and re-renders components after the response is received.

# Key Features and Their Implementation
## User Authentication
- Frontend: Login/Register forms, authentication context for state.
## Budget Management
- Frontend: Budget creation/editing forms, budget display components.
## Transaction Tracking
- Frontend: Transaction entry forms, history displays, filtering.
## Category Management
- Frontend: Category creation/editing components.
