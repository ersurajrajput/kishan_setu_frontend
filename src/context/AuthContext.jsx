import { createContext, useContext, useState, useEffect } from 'react';
import authService from '../services/authService';

/**
 * Convert technical error messages to user-friendly messages
 */
const getReadableErrorMessage = (error) => {
  // If error has a custom message from backend
  if (error.response?.data?.message) {
    return error.response.data.message;
  }

  // Handle HTTP status codes
  const status = error.response?.status;
  switch (status) {
    case 400:
      return 'Invalid email or password. Please check and try again.';
    case 401:
      return 'Invalid credentials. Please enter correct email and password.';
    case 404:
      return 'User not found. Please check your email or sign up first.';
    case 409:
      return 'This email is already registered. Please log in or use a different email.';
    case 500:
      return 'Server error. Please try again later.';
    case 502:
      return 'Server is temporarily unavailable. Please try again later.';
    case 503:
      return 'Service is temporarily down. Please try again later.';
    default:
      break;
  }

  // Handle network errors
  if (error.message === 'Network Error' || !error.response) {
    return 'Network error. Please check your internet connection.';
  }

  // Handle error message patterns
  if (error.message?.includes('404')) {
    return 'Resource not found. Please try again.';
  }

  if (error.message?.includes('timeout')) {
    return 'Request took too long. Please try again.';
  }

  // Fallback generic message
  return error.message || 'An error occurred. Please try again.';
};

/**
 * Authentication Context
 * Provides authentication state and methods to the entire app
 */
const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState(null);

  // Initialize auth state from localStorage on mount
  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      setError(null);
      setLoading(true);
      const userData = await authService.login(email, password);
      setUser(userData);
      setIsAuthenticated(true);
      return userData;
    } catch (error) {
      const errorMessage = getReadableErrorMessage(error);
      setError(errorMessage);
      setIsAuthenticated(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const register = async (name, email, password, role) => {
    try {
      setError(null);
      setLoading(true);
      const userData = await authService.register(name, email, password, role);
      setUser(userData);
      setIsAuthenticated(true);
      return userData;
    } catch (error) {
      const errorMessage = getReadableErrorMessage(error);
      setError(errorMessage);
      setIsAuthenticated(false);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setIsAuthenticated(false);
    setError(null);
  };

  const updateProfile = async (userData) => {
    try {
      setError(null);
      const updatedUser = await authService.updateProfile(userData);
      setUser(updatedUser);
      return updatedUser;
    } catch (error) {
      const errorMessage = getReadableErrorMessage(error);
      setError(errorMessage);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    error,
    login,
    register,
    logout,
    updateProfile,
    userRole: user?.role,
    clearError: () => setError(null),
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to use authentication context
 * @returns {Object} Authentication context value
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
