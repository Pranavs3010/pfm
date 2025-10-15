import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000, // Increased timeout to 30 seconds
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    console.log("🔑 Making request to:", config.url);
    console.log("🔑 Token present:", !!token);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    console.error("❌ Request error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log("✅ Response from:", response.config.url);
    console.log("📦 Response data:", response.data);
    return response;
  },
  (error) => {
    console.error("❌ Response error:", error.response?.data || error.message);

    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials) => api.post("/auth/login", credentials),
  register: (userData) => api.post("/auth/register", userData),
  getProfile: () => api.get("/auth/me"),
  updateProfile: (data) => api.put("/auth/profile", data),
};

export const plaidAPI = {
  createLinkToken: async () => {
    console.log("🔗 Requesting Plaid link token...");
    try {
      const response = await api.post("/plaid/create_link_token");
      console.log("📦 Full response:", response.data);

      // Handle both response formats
      const linkToken =
        response.data.linkToken || response.data.data?.linkToken;

      if (!linkToken) {
        console.error("❌ No link token in response:", response.data);
        throw new Error("No link token received from server");
      }

      console.log(
        "✅ Link token received:",
        linkToken.substring(0, 20) + "..."
      );
      return { data: { linkToken } };
    } catch (error) {
      console.error("❌ Create link token error:", error);
      throw error;
    }
  },
  exchangePublicToken: (data) => api.post("/plaid/exchange_public_token", data),
  syncTransactions: (accountId) => api.post(`/plaid/sync/${accountId}`),
  removeAccount: (accountId) => api.delete(`/plaid/remove/${accountId}`),
};

export const accountsAPI = {
  getAccounts: () => api.get("/accounts"),
  getAccount: (id) => api.get(`/accounts/${id}`),
  updateAccount: (id, data) => api.put(`/accounts/${id}`, data),
  getBalance: () => api.get("/accounts/balance"),
  syncTransactions: (accountId) => api.post(`/plaid/sync/${accountId}`),
  removeAccount: (accountId) => api.delete(`/plaid/remove/${accountId}`),
};

export const transactionsAPI = {
  getTransactions: (params = {}) => api.get("/transactions", { params }),
  getTransaction: (id) => api.get(`/transactions/${id}`),
  createTransaction: (data) => api.post("/transactions", data),
  updateTransaction: (id, data) => api.put(`/transactions/${id}`, data),
  deleteTransaction: (id) => api.delete(`/transactions/${id}`),
};

export const dashboardAPI = {
  getSummary: () => api.get("/dashboard/summary"),
  getAnalytics: (params) => api.get("/dashboard/analytics", { params }),
};

export const budgetsAPI = {
  getBudgets: () => api.get("/budgets"),
  getBudget: (id) => api.get(`/budgets/${id}`),
  createBudget: (data) => api.post("/budgets", data),
  updateBudget: (id, data) => api.put(`/budgets/${id}`, data),
  deleteBudget: (id) => api.delete(`/budgets/${id}`),
};

export default api;
