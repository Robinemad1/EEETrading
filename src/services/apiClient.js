const axios = require("axios");

// Create axios instance
const apiClient = axios.create();

// Add response interceptor to maintain consistent return signature
apiClient.interceptors.response.use(
  (response) => response.data,
  (error) => {
    console.error(
      `API request failed: ${error.config.method} ${error.config.url}`,
      error.response?.data || error.message
    );
    return Promise.reject(error.response?.data || error);
  }
);

// API methods
const api = {
  // Auth endpoints
  auth: {
    login: (data) => apiClient.post("/api/auth/login", data),
    register: (data) => apiClient.post("/api/auth/register", data),
    requestPasswordReset: (data) =>
      apiClient.post("/api/auth/request-password-reset", data),
    resetPassword: (data) => apiClient.post("/api/auth/reset-password", data),
  },

  // Inventory endpoints
  inventory: {
    getAll: () => apiClient.get("/api/inventory/quickbooks-inventory"),
    getById: (id) => apiClient.get(`/api/inventory/quickbooks-inventory/${id}`),
    getImage: (id) => apiClient.get(`/api/inventory/image/${id}`),
    getAllImages: () => apiClient.get("/api/inventory/images"),
  },

  // Invoice endpoints
  invoices: {
    getAll: () => apiClient.get("/api/invoices"),
    getById: (id) => apiClient.get(`/api/invoices/${id}`),
    create: (data) => apiClient.post("/api/invoices/create", data),
    updateStatus: (id, status) =>
      apiClient.patch(`/api/invoices/${id}/status`, { status }),
  },

  // User endpoints
  users: {
    getAll: () => apiClient.get("/api/users"),
    getById: (id) => apiClient.get(`/api/users/${id}`),
  },
};

module.exports = api;
