/**
 * Utility for consistent, human-readable error handling across the application
 */

// Map HTTP status codes to human-readable error messages
const HTTP_ERROR_MESSAGES = {
  400: 'Invalid request. Please check your input and try again.',
  401: 'You are not logged in. Please log in to continue.',
  403: 'You do not have permission to perform this action.',
  404: 'The requested resource was not found. It may have been deleted.',
  409: 'This item already exists. Please try a different one.',
  413: 'The file is too large. Please use a smaller file.',
  422: 'The data provided is invalid. Please check and try again.',
  429: 'Too many requests. Please wait a moment and try again.',
  500: 'Server error. Please try again later.',
  502: 'Server connection error. Please try again later.',
  503: 'Server is temporarily unavailable. Please try again in a few moments.',
  504: 'Request timeout. The server is not responding. Please try again.',
};

// Map specific error patterns/messages to user-friendly versions
const ERROR_MESSAGE_PATTERNS = {
  'File.*too.*large': 'Image file is too large. Please use an image smaller than 5MB.',
  'Invalid file type': 'Invalid file type. Please upload an image file (PNG, JPG, GIF, etc.).',
  'No token': 'Authentication token not found. Please log in again.',
  'Token.*expired': 'Your session has expired. Please log in again.',
  'Not authenticated': 'You must be logged in to perform this action.',
  'Not authorized': 'You do not have permission to perform this action.',
  'already.*exists': 'This item already exists. Please check the marketplace.',
  'not found': 'This item does not exist or has been deleted.',
  'Network': 'Network error. Please check your internet connection.',
  'ECONNREFUSED': 'Cannot connect to server. Please check your internet connection.',
  'timeout': 'Request took too long. Please try again.',
};

/**
 * Convert an error object to a human-readable message
 * @param {Error|Object} error - The error object (from API or JS error)
 * @param {string} context - Context of where the error occurred (e.g., 'marketplace', 'profile')
 * @returns {string} Human-readable error message
 */
export function getHumanReadableError(error, context = '') {
  // Handle API errors (Axios or Fetch)
  if (error.response) {
    const status = error.response.status;
    const serverMessage = error.response.data?.message;
    const serverError = error.response.data?.error;

    // Check if server provided a custom message
    if (serverMessage) {
      return matchErrorPattern(serverMessage) || serverMessage;
    }

    if (serverError) {
      return matchErrorPattern(serverError) || serverError;
    }

    // Fall back to HTTP status message
    return HTTP_ERROR_MESSAGES[status] || `Server error (${status}). Please try again.`;
  }

  // Handle request errors (timeout, network issues)
  if (error.request && !error.response) {
    return 'Network error. Please check your internet connection and try again.';
  }

  // Handle client-side errors
  if (error.message) {
    return matchErrorPattern(error.message) || error.message;
  }

  // Handle string errors
  if (typeof error === 'string') {
    return matchErrorPattern(error) || error;
  }

  // Generic fallback
  return 'An unexpected error occurred. Please try again.';
}

/**
 * Match error message against known patterns
 * @param {string} message - Error message to match
 * @returns {string|null} Human-readable message or null if no pattern matches
 */
function matchErrorPattern(message) {
  if (!message || typeof message !== 'string') return null;

  const lowerMessage = message.toLowerCase();

  for (const [pattern, replacement] of Object.entries(ERROR_MESSAGE_PATTERNS)) {
    if (new RegExp(pattern, 'i').test(lowerMessage)) {
      return replacement;
    }
  }

  return null;
}

/**
 * Log error for debugging (only in development)
 * @param {Error} error - The error to log
 * @param {string} context - Context information
 */
export function logError(error, context = '') {
  if (process.env.NODE_ENV === 'development') {
    console.error(`[ERROR - ${context}]`, {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      url: error.config?.url,
      fullError: error,
    });
  }
}

/**
 * Handle API errors consistently
 * @param {Error|Object} error - The error from API call
 * @param {string} context - Where the error occurred
 * @returns {Object} Object with error message and original error
 */
export function handleApiError(error, context = '') {
  logError(error, context);
  const message = getHumanReadableError(error, context);
  
  return {
    message,
    status: error.response?.status,
    originalError: error,
  };
}

/**
 * Specific error handler for authentication errors
 * @param {Error} error - The error from API call
 * @returns {boolean} True if error is authentication-related
 */
export function isAuthError(error) {
  const status = error.response?.status;
  return status === 401 || status === 403;
}

/**
 * Specific error handler for network errors
 * @param {Error} error - The error from API call
 * @returns {boolean} True if error is network-related
 */
export function isNetworkError(error) {
  return (
    !error.response &&
    error.message &&
    (error.message.includes('Network') ||
      error.message.includes('timeout') ||
      error.message.includes('ECONNREFUSED'))
  );
}

/**
 * Generate context-specific error message
 * @param {string} context - Context (e.g., 'sell_crop', 'marketplace', 'profile')
 * @param {Error} error - The error object
 * @returns {string} Context-aware error message
 */
export function getContextualError(context, error) {
  const baseMessage = getHumanReadableError(error);

  const contextMessages = {
    sell_crop: 'Unable to list your crop right now. ' + baseMessage,
    marketplace: 'Unable to load marketplace items. ' + baseMessage,
    profile: 'Unable to load profile information. ' + baseMessage,
    delete_listing: 'Unable to delete listing. ' + baseMessage,
    weather: 'Unable to fetch weather data. ' + baseMessage,
    recommendation: 'Unable to get crop recommendations. ' + baseMessage,
    chat: 'Unable to send message. ' + baseMessage,
    upload: 'Unable to upload file. ' + baseMessage,
  };

  return contextMessages[context] || baseMessage;
}

export default {
  getHumanReadableError,
  handleApiError,
  logError,
  isAuthError,
  isNetworkError,
  getContextualError,
};
