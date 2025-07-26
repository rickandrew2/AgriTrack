// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// API endpoints
export const API_ENDPOINTS = {
  // Auth
  LOGIN: '/auth/login',
  REGISTER: '/auth/register',
  LOGOUT: '/auth/logout',
  
  // Users
  USERS: '/users',
  
  // Products
  PRODUCTS: '/products',
  PRODUCTS_IMPORT: '/products/import',
  PRODUCTS_EXPORT: '/products/export',
  
  // Transactions
  TRANSACTIONS: '/transactions',
  
  // Reports
  REPORTS: '/reports',
  REPORTS_FILTER_OPTIONS: '/reports/filter-options',
  REPORTS_RECENT: '/reports/recent',
  
  // Dashboard
  DASHBOARD_STATS: '/dashboard/stats',
  
  // Activity Logs
  ACTIVITY_LOGS: '/activity-logs',
  
  // Categories
  CATEGORIES: '/categories',
  
  // Storage Areas
  STORAGE_AREAS: '/storage-areas',
  
  // Barangays
  BARANGAYS: '/barangays'
};

// Helper function to build full API URLs
export const buildApiUrl = (endpoint) => {
  return `${API_BASE_URL}${endpoint}`;
};

// Default fetch options
export const defaultFetchOptions = {
  headers: {
    'Content-Type': 'application/json',
  },
  credentials: 'include',
};

// Helper function for API calls with error handling
export const apiCall = async (endpoint, options = {}) => {
  const url = buildApiUrl(endpoint);
  const fetchOptions = {
    ...defaultFetchOptions,
    ...options,
    headers: {
      ...defaultFetchOptions.headers,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, fetchOptions);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API call failed:', error);
    throw error;
  }
}; 