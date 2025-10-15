import React, { createContext, useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../services/api";

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem("token");
    if (token) {
      try {
        const response = await authAPI.getProfile();
        setUser(response.data.data);
      } catch (error) {
        localStorage.removeItem("token");
        console.error("Auth check failed:", error);
      }
    }
    setLoading(false);
  };

  const login = async (credentials) => {
    try {
      setError("");
      console.log("Attempting login...", credentials.email);

      const response = await authAPI.login(credentials);
      console.log("Login response:", response.data);

      // FIXED: Token is inside response.data.data, not separate
      const { token, ...userData } = response.data.data;

      console.log("Token:", token);
      console.log("User data:", userData);

      // Store token and set user
      localStorage.setItem("token", token);
      setUser(userData);

      console.log("Login successful, navigating to dashboard...");

      // Navigate to dashboard after successful login
      setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 100);

      return { success: true };
    } catch (error) {
      console.error("Login error:", error);
      const message = error.response?.data?.message || "Login failed";
      setError(message);
      return { success: false, message };
    }
  };

  const register = async (userData) => {
    try {
      setError("");
      console.log("Attempting registration...", userData.email);

      const response = await authAPI.register(userData);
      console.log("Registration response:", response.data);

      // FIXED: Token is inside response.data.data, not separate
      const { token, ...userInfo } = response.data.data;

      console.log("Token:", token);
      console.log("User data:", userInfo);

      // Store token and set user
      localStorage.setItem("token", token);
      setUser(userInfo);

      console.log("Registration successful, navigating to dashboard...");

      // Navigate to dashboard after successful registration
      setTimeout(() => {
        navigate("/dashboard", { replace: true });
      }, 100);

      return { success: true };
    } catch (error) {
      console.error("Registration error:", error);
      const message = error.response?.data?.message || "Registration failed";
      setError(message);
      return { success: false, message };
    }
  };

  const logout = () => {
    console.log("Logging out...");
    localStorage.removeItem("token");
    setUser(null);
    setError("");
    navigate("/login", { replace: true });
  };

  const value = {
    user,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
