import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

// Criar instância do axios
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar respostas e erros
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      // Só redireciona para login se estivermos numa rota administrativa
      if (window.location.pathname.startsWith('/admin') && !window.location.pathname.includes('/admin/login')) {
        window.location.href = '/admin/login';
      }
    }
    return Promise.reject(error);
  }
);

// Funções da API

// Cães
export const dogsAPI = {
  getAll: (params = {}) => api.get('/dogs', { params }),
  getById: (id) => api.get(`/dogs/${id}`),
  create: (data) => api.post('/dogs', data),
  update: (id, data) => api.put(`/dogs/${id}`, data),
  delete: (id) => api.delete(`/dogs/${id}`),
};

// Adoções
export const adoptionsAPI = {
  create: (data) => api.post('/adoptions', data),
  getAll: (params = {}) => api.get('/adoptions', { params }),
  updateStatus: (id, status, reason = null) => {
    const payload = { status };
    if (reason) payload.reason = reason;
    return api.patch(`/adoptions/${id}/status`, payload);
  },
};

// Blog
export const blogAPI = {
  getPosts: (params = {}) => api.get('/blog', { params }),
  getPost: (slug) => api.get(`/blog/${slug}`),
  getPostById: (id) => api.get(`/admin/blog/${id}`),
  getAllPosts: (params = {}) => api.get('/admin/blog', { params }),
  create: (data) => api.post('/admin/blog', data),
  update: (id, data) => api.put(`/admin/blog/${id}`, data),
  delete: (id) => api.delete(`/admin/blog/${id}`),
};

// Voluntários
export const volunteersAPI = {
  create: (data) => api.post('/volunteers', data),
  getAll: (params = {}) => api.get('/admin/volunteers', { params }),
  updateStatus: (id, status, reason = null) => {
    const payload = { status };
    if (reason) payload.reason = reason;
    return api.patch(`/admin/volunteers/${id}/status`, payload);
  },
};

// Doações
export const donationsAPI = {
  createPix: (data) => api.post('/donations/pix', data),
  createStripe: (data) => api.post('/donations/stripe', data),
  checkStripeStatus: (sessionId) => api.get(`/donations/stripe/status/${sessionId}`),
  getAll: (params = {}) => api.get('/donations', { params }),
  updateStatus: (id, status, notes = null) => {
    const payload = { status };
    if (notes) payload.notes = notes;
    return api.patch(`/donations/${id}/status`, payload);
  },
};

// Contatos
export const contactsAPI = {
  create: (data) => api.post('/contacts', data),
  getAll: (params = {}) => api.get('/admin/contacts', { params }),
};

// Estatísticas
export const statsAPI = {
  get: () => api.get('/stats'),
};

// Autenticação
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  verify: () => api.get('/auth/verify'),
  logout: () => api.post('/auth/logout'),
};

// Admin
export const adminAPI = {
  getDashboard: () => api.get('/admin/dashboard'),
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (data) => api.put('/admin/settings', data),
};

// Settings públicas
export const settingsAPI = {
  getPublicSettings: () => api.get('/settings'),
};

// Users (admin)
export const usersAPI = {
  list: () => api.get('/users'),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  resetPassword: (id, data) => api.post(`/users/${id}/reset-password`, data),
  changePassword: (data) => api.post('/users/change-password', data)
  ,
  delete: (id) => api.delete(`/users/${id}`)
};

// Financial Reports (admin)
export const financialReportsAPI = {
  getAll: (params = {}) => api.get('/financial-reports', { params }),
  upload: (formData) => api.post('/financial-reports/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  download: (id) => api.get(`/financial-reports/download/${id}`, {
    responseType: 'blob'
  }),
  delete: (id) => api.delete(`/financial-reports/${id}`)
};

// Uploads
export const uploadsAPI = {
  uploadImages: (formData) => api.post('/uploads', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  uploadLogo: (formData) => api.post('/uploads/logo', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
};

export default api;