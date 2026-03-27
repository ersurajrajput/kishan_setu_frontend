import api from './api';

/**
 * User Authentication Service
 * Handles all login and signup related API calls
 */

const authService = {
  /**
   * Login user
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} User data with token
   */
  login: async (email, password) => {
    try {
      // Send POST request with credentials in body
      const { data } = await api.post('/user/login', { email, password });

      console.log('Login response:', data);
      const cleanData = (obj) => {
  return Object.fromEntries(
    Object.entries(obj).filter(
      ([_, value]) => value !== null && value !== undefined && value !== ""
    )
  );
};
      // Backend returns user data directly, not nested
      if (data) {
        const cleanedUser = cleanData(data);
        // Store user info with token
        localStorage.setItem('userInfo', JSON.stringify(cleanedUser));
        return data;
      }
      throw new Error('Invalid response from server');
    } catch (error) {
      console.error('Login error:', error.response?.data || error.message);
      
      throw new Error(
        error.response?.data?.message || 
        error.message || 
        'Login failed. Please try again.'
      );
    }
  },

  /**
   * Register new user
   * @param {string} name - User full name
   * @param {string} email - User email
   * @param {string} password - User password
   * @param {string} role - User role (farmer/buyer)
   * @returns {Promise<Object>} User data with token
   */
  register: async (name, email, password, role) => {
    try {
      const { data } = await api.post('/user/register', {
        name,
        email,
        password,
        role,
      });

      console.log('Register response:', data);
      console.log('Register response JSON:', JSON.stringify(data, null, 2));

      // Handle different response structures
      const userData = data.user || data.data || data;
      
      if (userData && (userData._id || userData.id)) {
        // Store user info with token
        localStorage.setItem('userInfo', JSON.stringify(userData));
        return userData;
      }
      throw new Error('Invalid response from server');
    } catch (error) {
      console.error('Register error response:', error.response?.data);
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Registration failed. Please try again.'
      );
    }
  },

  /**
   * Logout user
   */
  logout: () => {
    localStorage.removeItem('userInfo');
    window.location.href = '/login';
  },

  /**
   * Get current user from localStorage
   * @returns {Object|null} User data or null if not logged in
   */
  getCurrentUser: () => {
    const userInfo = localStorage.getItem('userInfo');
    return userInfo ? JSON.parse(userInfo) : null;
  },

  /**
   * Check if user is authenticated
   * @returns {boolean}
   */
  isAuthenticated: () => {
    const user = authService.getCurrentUser();
    return user && user.token ? true : false;
  },

  /**
   * Get user role
   * @returns {string|null} User role or null
   */
  getUserRole: () => {
    const user = authService.getCurrentUser();
    return user ? user.role : null;
  },

  /**
   * Update user profile
   * @param {Object} userData - User data to update
   * @returns {Promise<Object>} Updated user data
   */
  updateProfile: async (userData) => {
    try {
      const { data } = await api.put('/users/profile', userData);
      if (data && data._id) {
        // Update stored user info
        localStorage.setItem('userInfo', JSON.stringify(data));
        return data;
      }
      throw new Error('Invalid response from server');
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Profile update failed.'
      );
    }
  },

  /**
   * Verify email
   * @param {string} email - Email to verify
   * @param {string} code - Verification code
   * @returns {Promise<Object>}
   */
  verifyEmail: async (email, code) => {
    try {
      const { data } = await api.post('/users/verify-email', { email, code });
      return data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Email verification failed.'
      );
    }
  },

  /**
   * Request password reset
   * @param {string} email - User email
   * @returns {Promise<Object>}
   */
  requestPasswordReset: async (email) => {
    try {
      const { data } = await api.post('/users/forgot-password', { email });
      return data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Password reset request failed.'
      );
    }
  },

  /**
   * Reset password with token
   * @param {string} token - Reset token
   * @param {string} newPassword - New password
   * @returns {Promise<Object>}
   */
  resetPassword: async (token, newPassword) => {
    try {
      const { data } = await api.post('/users/reset-password', {
        token,
        newPassword
      });
      return data;
    } catch (error) {
      throw new Error(
        error.response?.data?.message ||
        error.message ||
        'Password reset failed.'
      );
    }
  },
};

export default authService;
