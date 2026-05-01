import api from './api'
export const requestService = {
  send:         (data) => api.post('/requests', data),
  getAsFounder: ()     => api.get('/requests', { params: { role: 'founder'   } }),
  getAsApplicant: ()   => api.get('/requests', { params: { role: 'applicant' } }),
  updateStatus: (id, status) => api.put(`/requests/${id}`, { status }),
}
