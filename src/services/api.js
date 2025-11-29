import axios from 'axios';

const API_BASE_URL = 'https://anvaya-backend-woad.vercel.app/';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Leads API
export const leadsAPI = {
  getAll: (filters = {}) => {
    const params = new URLSearchParams();
    if (filters.salesAgent) params.append('salesAgent', filters.salesAgent);
    if (filters.status) params.append('status', filters.status);
    if (filters.source) params.append('source', filters.source);
    if (filters.tags) {
      if (Array.isArray(filters.tags)) {
        filters.tags.forEach(tag => params.append('tags', tag));
      } else {
        params.append('tags', filters.tags);
      }
    }
    return api.get(`/leads?${params.toString()}`);
  },
  getById: (id) => api.get(`/leads/${id}`),
  create: (data) => api.post('/leads', data),
  update: (id, data) => api.put(`/leads/${id}`, data),
  delete: (id) => api.delete(`/leads/${id}`),
};

// Sales Agents API
export const agentsAPI = {
  getAll: () => api.get('/agents'),
  create: (data) => api.post('/agents', data),
  delete: (id) => api.delete(`/agents/${id}`),
};

// Comments API
export const commentsAPI = {
  getByLeadId: (leadId) => api.get(`/leads/${leadId}/comments`),
  create: (leadId, data) => api.post(`/leads/${leadId}/comments`, data),
};

// Tags API
export const tagsAPI = {
  getAll: () => api.get('/tags'),
  create: (data) => api.post('/tags', data),
};

// Reports API
export const reportsAPI = {
  getLastWeek: () => api.get('/report/last-week'),
  getPipeline: () => api.get('/report/pipeline'),
  getClosedByAgent: () => api.get('/report/closed-by-agent'),
  getStatusDistribution: () => api.get('/report/status-distribution'),
};

export default api;

