import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useNavigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import BudgetDashboard from './components/BudgetDashboard';
import TransactionManager from './components/TransactionManager';
import CategoryManager from './components/CategoryManager';
import BudgetManager from './components/BudgetManager';
import TaxEstimator from './components/TaxEstimator';
import LoginModal from './components/LoginModal';
import RegisterModal from './components/RegisterModal';
import UserMenu from './components/UserMenu';
import Footer from './components/Footer';
import './App.css';

const queryClient = new QueryClient();

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

const PublicRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  if (token) {
    return <Navigate to="/" replace />;
  }
  return children;
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen flex flex-col">
            {/* Navigation */}
            <nav className="bg-white shadow-lg">
              <div className="max-w-7xl mx-auto px-4">
                <div className="flex justify-between items-center h-16">
                  <div className="flex items-center">
                    <Link to="/" className="flex items-center">
                      <span className="text-xl font-bold text-gray-800">💰 Budget Planner</span>
                    </Link>
                    <div className="hidden md:flex md:items-center md:ml-10 space-x-4">
                      <Link
                        to="/"
                        className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md"
                      >
                        Dashboard
                      </Link>
                      <Link
                        to="/transactions"
                        className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md"
                      >
                        Transactions
                      </Link>
                      <Link
                        to="/categories"
                        className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md"
                      >
                        Categories
                      </Link>
                      <Link
                        to="/budgets"
                        className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md"
                      >
                        Budgets
                      </Link>
                      <Link
                        to="/tax-estimator"
                        className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md"
                      >
                        Tax Estimator
                      </Link>
                    </div>
                  </div>
                  <div className="flex items-center h-full py-2">
                    <UserMenu />
                  </div>
                </div>
              </div>
            </nav>

            {/* Main Content */}
            <main className="flex-grow max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={
                  <PublicRoute>
                    <LoginModal />
                  </PublicRoute>
                } />
                <Route path="/register" element={
                  <PublicRoute>
                    <RegisterModal />
                  </PublicRoute>
                } />

                {/* Protected Routes */}
                <Route path="/" element={
                  <PrivateRoute>
                    <BudgetDashboard />
                  </PrivateRoute>
                } />
                <Route path="/transactions" element={
                  <PrivateRoute>
                    <TransactionManager />
                  </PrivateRoute>
                } />
                <Route path="/categories" element={
                  <PrivateRoute>
                    <CategoryManager />
                  </PrivateRoute>
                } />
                <Route path="/budgets" element={
                  <PrivateRoute>
                    <BudgetManager />
                  </PrivateRoute>
                } />
                <Route path="/tax-estimator" element={
                  <PrivateRoute>
                    <TaxEstimator />
                  </PrivateRoute>
                } />
              </Routes>
            </main>

            {/* Footer */}
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
