const API_BASE_URLS = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api,http://localhost:5001/api,http://localhost:5002/api')
  .split(',')
  .map((value) => value.trim())
  .filter(Boolean);

const request = async (path, options = {}) => {
  const token = localStorage.getItem('grievance_token');
  const headers = {
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const isFormData = options.body instanceof FormData;
  if (!isFormData && options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }

  const requestBody = isFormData
    ? options.body
    : (options.body === undefined ? undefined : (typeof options.body === 'string' ? options.body : JSON.stringify(options.body)));

  let lastError = null;

  for (const baseUrl of API_BASE_URLS) {
    try {
      const response = await fetch(`${baseUrl}${path}`, {
        ...options,
        headers,
        body: requestBody
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        return data;
      }

      if (response.status === 404) {
        lastError = new Error(data.message || 'Request failed');
        continue;
      }

      throw new Error(data.message || 'Request failed');
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error('Request failed');
};

export const api = {
  login: (payload) => request('/auth/login', { method: 'POST', body: payload }),
  register: (payload) => request('/auth/register', { method: 'POST', body: payload }),
  me: () => request('/auth/me'),
  createComplaint: (payload, file = null) => {
    if (file) {
      const formData = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') {
          return;
        }

        if (Array.isArray(value) || typeof value === 'object') {
          return;
        }

        formData.append(key, value);
      });
      formData.append('image', file);
      return request('/complaints', { method: 'POST', body: formData });
    }

    return request('/complaints', { method: 'POST', body: payload });
  },
  listComplaints: (params = {}) => {
    const search = new URLSearchParams(params).toString();
    return request(`/complaints${search ? `?${search}` : ''}`);
  },
  getComplaint: (id) => request(`/complaints/${id}`),
  updateComplaintStatus: (id, payload) => request(`/complaints/${id}/status`, { method: 'PATCH', body: JSON.stringify(payload) }),
  analytics: () => request('/admin/analytics'),
  notifications: () => request('/notifications'),
  markNotificationRead: (id) => request(`/notifications/${id}/read`, { method: 'PATCH' }),
  triage: (complaintText) => request('/triage/classify', { method: 'POST', body: { complaintText } }),
  logout: () => {
    localStorage.removeItem('grievance_token');
    localStorage.removeItem('grievance_user');
  },
  saveSession: ({ token, user }) => {
    localStorage.setItem('grievance_token', token);
    localStorage.setItem('grievance_user', JSON.stringify(user));
  },
  getSessionUser: () => {
    try {
      return JSON.parse(localStorage.getItem('grievance_user') || 'null');
    } catch {
      return null;
    }
  }
};