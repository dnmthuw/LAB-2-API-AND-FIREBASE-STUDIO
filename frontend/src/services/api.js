import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000',
});

// Interceptor: attach Firebase Bearer token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor for unified error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Optional: Log errors or handle specific status codes globally
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// ── Project API ────────────────────────────────────────────────────────────
export const projectApi = {
  list: () => api.get('/projects').then(r => r.data),
  create: (name, description = '') =>
    api.post('/projects', { name, description }).then(r => r.data),
  get: (projectId) => api.get(`/projects/${projectId}`).then(r => r.data),
  update: (projectId, data) =>
    api.put(`/projects/${projectId}`, data).then(r => r.data),
  delete: (projectId) =>
    api.delete(`/projects/${projectId}`).then(r => r.data),
};

// ── Source API ────────────────────────────────────────────────────────────────
export const sourceApi = {
  uploadPdf: (projectId, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/projects/${projectId}/upload-pdf`, formData).then(r => r.data);
  },
  addText: (projectId, name, content) =>
    api.post(`/projects/${projectId}/add-text`, { name, content }).then(r => r.data),
  list: (projectId) =>
    api.get(`/projects/${projectId}/sources`).then(r => r.data),
  remove: (projectId, sourceId) =>
    api.delete(`/projects/${projectId}/sources/${sourceId}`).then(r => r.data),
};

// ── Conversation API ───────────────────────────────────────────────────────
export const conversationApi = {
  list: (projectId) =>
    api.get(`/projects/${projectId}/conversations`).then(r => r.data),
  create: (projectId, title = 'New Conversation') =>
    api.post(`/projects/${projectId}/conversations`, { title }).then(r => r.data),
  get: (projectId, convId) =>
    api.get(`/projects/${projectId}/conversations/${convId}`).then(r => r.data),
  rename: (projectId, convId, title) =>
    api.put(`/projects/${projectId}/conversations/${convId}`, { title }).then(r => r.data),
  delete: (projectId, convId) =>
    api.delete(`/projects/${projectId}/conversations/${convId}`).then(r => r.data),
};

// ── Chat API ───────────────────────────────────────────────────────────────
export const chatApi = {
  send: (projectId, message, conversationId = null, documentIds = []) =>
    api.post(`/projects/${projectId}/chat`, {
      message,
      conversation_id: conversationId,
      document_ids: documentIds,
    }).then(r => r.data),
};

export default api;
