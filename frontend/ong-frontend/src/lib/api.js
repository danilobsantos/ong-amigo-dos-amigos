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
      window.location.href = '/admin/login';
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
  create: (data) => api.post('/admin/blog', data),
  update: (id, data) => api.put(`/admin/blog/${id}`, data),
  delete: (id) => api.delete(`/admin/blog/${id}`),
};

// Voluntários
export const volunteersAPI = {
  create: (data) => api.post('/volunteers', data),
  getAll: (params = {}) => api.get('/admin/volunteers', { params }),
};

// Doações
export const donationsAPI = {
  create: (data) => api.post('/donations', data),
  getAll: (params = {}) => api.get('/admin/donations', { params }),
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

// Uploads
export const uploadsAPI = {
  uploadImages: (formData) => api.post('/uploads', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
};

export default api;
