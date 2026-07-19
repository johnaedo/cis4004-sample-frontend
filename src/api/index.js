// src/api/index.js

import axios from "axios";

const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.PROD ? "/api" : "http://localhost:4001/api");

// Create axios instance with default config
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const register = (userData) => api.post("/users/register", userData);
export const login = (credentials) => api.post("/users/login", credentials);
export const getProfile = () => api.get("/users/profile");

// Categories API
export const getCategories = () => api.get("/categories");
export const createCategory = (categoryData) =>
  api.post("/categories", categoryData);
export const updateCategory = (id, categoryData) =>
  api.put(`/categories/${id}`, categoryData);
export const deleteCategory = (id) => api.delete(`/categories/${id}`);

// Transactions API
export const getTransactions = (params) => api.get("/transactions", { params });
export const createTransaction = (transactionData) =>
  api.post("/transactions", transactionData);
export const updateTransaction = (id, transactionData) =>
  api.put(`/transactions/${id}`, transactionData);
export const deleteTransaction = (id) => api.delete(`/transactions/${id}`);
export const getTransactionSummary = (params) =>
  api.get("/transactions/summary", { params });

// Budgets API
export const getBudgets = (params) => api.get("/budgets", { params });
export const createBudget = (budgetData) => api.post("/budgets", budgetData);
export const updateBudget = ([id, budgetData]) =>
  api.put(`/budgets/${id}`, budgetData);
export const deleteBudget = (id) => api.delete(`/budgets/${id}`);
export const getBudgetSummary = (params) =>
  api.get("/budgets/summary", { params });
export const getBudgetTransactions = (id) =>
  api.get(`/budgets/${id}/transactions`);

// Error handler
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    if (error.response) {
      // Server responded with error
      if (error.response.status === 401) {
        const token = localStorage.getItem("token");
        if (token) {
          // ← only redirect on session expiry
          localStorage.removeItem("token");
          window.location.href = "/login";
        }
      }
      throw error.response.data;
    } else if (error.request) {
      // Request made but no response
      throw { error: "Network error. Please try again." };
    } else {
      // Something else happened
      throw { error: "An error occurred. Please try again." };
    }
  },
);

export default api;
