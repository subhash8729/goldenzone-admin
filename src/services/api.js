import axios from 'axios';

// Normalize API base URL: ensure it handles with or without trailing slashes and /api suffix
function getBaseUrl() {
  let url = import.meta.env.VITE_API_URL;
  if (!url) {
    return '/api';
  }
  url = url.trim();
  if (url.endsWith('/')) {
    url = url.slice(0, -1);
  }
  // If user passed e.g. http://localhost:5000 or https://goldenzone.in without /api
  if (url.startsWith('http') && !url.endsWith('/api')) {
    url = `${url}/api`;
  }
  return url;
}

const API_BASE_URL = getBaseUrl();

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor: Attach Admin JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('goldenzone_admin_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: Handle expired/invalid admin session
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const hasToken = !!localStorage.getItem('goldenzone_admin_token');

    // If 401 or 403 on protected admin calls, clear token and redirect to login
    if ((status === 401 || status === 403) && hasToken) {
      // Avoid redirect loops if the failure was specifically from the login endpoint
      const isLoginEndpoint = error.config?.url?.includes('/auth/admin/login') || error.config?.url?.includes('/auth/admin/send-otp');
      if (!isLoginEndpoint) {
        localStorage.removeItem('goldenzone_admin_token');
        localStorage.removeItem('goldenzone_admin_user');
        const loginPath = window.location.pathname.startsWith('/admin') ? '/admin/login' : '/login';
        if (window.location.pathname !== loginPath) {
          window.location.assign(loginPath);
        }
      }
    }
    return Promise.reject(error);
  }
);

// Helper to reliably extract error message from API errors
export function getErrorMessage(error, defaultMsg = 'An unexpected error occurred. Please try again.') {
  if (!error) return defaultMsg;
  if (typeof error === 'string') return error;
  if (error.response?.data?.message) return error.response.data.message;
  if (error.response?.data?.error) return error.response.data.error;
  if (error.message === 'Network Error') return 'Unable to connect to the backend server. Please check your connection.';
  if (error.code === 'ECONNABORTED') return 'Server request timed out. Please try again.';
  return error.message || defaultMsg;
}

export const adminAuthService = {
  sendOtp: (mobile_number) =>
    api.post('/auth/admin/send-otp', { mobile_number }),
  login: (mobile_number, password, otp) =>
    api.post('/auth/admin/login', { mobile_number, password, otp }),
  getProfile: () => api.get('/auth/admin/profile'),
  changePassword: (current_password, new_password) =>
    api.put('/auth/admin/change-password', { current_password, new_password })
};

export const adminDashboardService = {
  getStats: (params) => api.get('/dashboard/stats', { params })
};

export const adminProductService = {
  getProducts: (params) => api.get('/products/admin/all', { params }),
  createProduct: (data) => api.post('/products', data),
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/products/${id}`),
  toggleFlag: (id, field, value) => api.patch(`/products/${id}/toggle`, { field, value })
};

export const adminOrderService = {
  getOrders: (params) => api.get('/orders/admin/all', { params }),
  getOrderDetail: (id) => api.get(`/orders/admin/${id}`),
  updateStatus: (id, is_shipped, is_delivered) =>
    api.patch(`/orders/admin/${id}/status`, { is_shipped, is_delivered }),
  updateRemark: (id, remark) => api.patch(`/orders/admin/${id}/remark`, { remark }),
  softDeleteOrder: (id) => api.delete(`/orders/admin/${id}`)
};

export const adminCategoryService = {
  getCategories: () => api.get('/categories/admin/all'),
  createCategory: (data) => api.post('/categories', data),
  updateCategory: (id, data) => api.put(`/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/categories/${id}`)
};

export const adminCustomerService = {
  getCustomers: (params) => api.get('/customers/admin/all', { params }),
  getCustomerDetail: (id) => api.get(`/customers/admin/${id}`)
};

export const adminPaymentService = {
  getPayments: (params) => api.get('/payments/admin/all', { params })
};

export const adminSettingService = {
  getSettings: () => api.get('/settings'),
  updateSettings: (settings) => api.put('/settings', { settings }),
  getEnquiries: () => api.get('/settings/enquiries')
};

export const adminReviewService = {
  getReviews: () => api.get('/reviews/admin/all'),
  toggleApproval: (id, is_approved) => api.patch(`/reviews/admin/${id}/approval`, { is_approved }),
  deleteReview: (id) => api.delete(`/reviews/admin/${id}`)
};

export const adminNoteService = {
  getNotes: () => api.get('/notes/admin/all'),
  createNote: (data) => api.post('/notes/admin', data),
  updateNote: (id, data) => api.put(`/notes/admin/${id}`, data),
  deleteNote: (id) => api.delete(`/notes/admin/${id}`)
};

export default api;
