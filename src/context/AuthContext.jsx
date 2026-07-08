// src/context/AuthContext.jsx

import { createContext, useContext, useState, useCallback } from "react";
import { login as apiLogin, register as apiRegister, getProfile } from "../api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = useCallback(async (identifier, password) => {
    try {
      const response = await apiLogin({ identifier, password });
      const { user: userData, token } = response;

      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", token);
      setUser(userData);

      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        error: error.error || "Failed to login",
      };
    }
  }, []);

  const register = useCallback(async (username, email, password) => {
    try {
      const response = await apiRegister({ username, email, password });
      const { user: userData, token } = response;

      localStorage.setItem("user", JSON.stringify(userData));
      localStorage.setItem("token", token);
      setUser(userData);

      return { success: true };
    } catch (error) {
      console.error("Register error:", error);
      return {
        success: false,
        error: error.error || "Failed to register",
      };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    setUser(null);
  }, []);

  const updateUser = useCallback(async () => {
    try {
      const updatedUser = await getProfile();
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      return { success: true };
    } catch (error) {
      console.error("Update user error:", error);
      return {
        success: false,
        error: error.error || "Failed to update profile",
      };
    }
  }, []);

  const value = {
    user,
    login,
    register,
    logout,
    updateUser,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export default AuthContext;
