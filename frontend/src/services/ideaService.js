import api from './api'

export const ideaService = {
  create:     (data)   => api.post('/ideas', data),
  getAll:     (params) => api.get('/ideas', { params }),
  getById:    (id)     => api.get(`/ideas/${id}`),
  getMatched: ()       => api.get('/ideas', { params: { match: true } }),
  // ── NEW ──────────────────────────────────────────────────────
  update:     (id, data) => api.put(`/ideas/${id}`, data),
  remove:     (id)       => api.delete(`/ideas/${id}`),
}
