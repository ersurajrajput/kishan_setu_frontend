import axios from 'axios';

// Use relative URL - Vite proxy will handle the backend connection
const API_BASE_URL = '/api';

const api = axios.create({
    baseURL: API_BASE_URL,
});

// Add a request interceptor to include JWT token if it exists
api.interceptors.request.use(
    (config) => {
        const userInfo = localStorage.getItem('userInfo');
        if (userInfo) {
            try {
                const parsedUserInfo = JSON.parse(userInfo);
                // Try different token property names based on backend response structure
                const token = parsedUserInfo.token || parsedUserInfo.accessToken || parsedUserInfo.data?.token;
                if (token) {
                    config.headers.Authorization = `Bearer ${token}`;
                    console.log('[API] Token added to request headers');
                } else {
                    // If no token but user is logged in, still allow requests (backend may not use tokens)
                    console.log('[API] No token found, but user info exists. Proceeding without token.');
                }
            } catch (err) {
                console.error('[API] Error parsing userInfo:', err);
            }
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor for global error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        console.error('[API] Request error:', {
            status: error.response?.status,
            message: error.response?.data?.message || error.message,
            url: error.config?.url,
        });
        
        if (error.response?.status === 401) {
            // Token expired or unauthorized
            console.warn('[API] 401 Unauthorized - clearing user info and redirecting to login');
            localStorage.removeItem('userInfo');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default api;

