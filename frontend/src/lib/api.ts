const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
    if (window.location.hostname.includes('evegah.cloud')) {
      return 'https://evegah.cloud/api';
    }
    return '/api';
  }
  return process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
};

const BASE_URL = getBaseUrl();

const getAuthHeaders = (extraHeaders: Record<string, string> = {}) => {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extraHeaders,
  };
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('evegah_token');
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    headers['x-api-key'] = 'evegah-internal-key';
  }
  return headers;
};

export const api = {
  async get(endpoint: string) {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      headers: getAuthHeaders(),
    });
    if (!response.ok) {
      let msg = `HTTP error! status: ${response.status}`;
      try {
        const errJson = await response.json();
        if (errJson && (errJson.message || errJson.error)) {
          msg = errJson.message || errJson.error;
        }
      } catch (_) {}
      throw new Error(msg);
    }
    return response.json();
  },

  async post(endpoint: string, data: any) {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      let msg = `HTTP error! status: ${response.status}`;
      try {
        const errJson = await response.json();
        if (errJson && (errJson.message || errJson.error)) {
          msg = errJson.message || errJson.error;
        }
      } catch (_) {}
      throw new Error(msg);
    }
    return response.json();
  },

  async put(endpoint: string, data: any) {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      let msg = `HTTP error! status: ${response.status}`;
      try {
        const errJson = await response.json();
        if (errJson && (errJson.message || errJson.error)) {
          msg = errJson.message || errJson.error;
        }
      } catch (_) {}
      throw new Error(msg);
    }
    return response.json();
  },

  async patch(endpoint: string, data: any) {
    const response = await fetch(`${BASE_URL}${endpoint}`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      let msg = `HTTP error! status: ${response.status}`;
      try {
        const errJson = await response.json();
        if (errJson && (errJson.message || errJson.error)) {
          msg = errJson.message || errJson.error;
        }
      } catch (_) {}
      throw new Error(msg);
    }
    return response.json();
  },

  async delete(endpoint: string, data?: any) {
    const options: RequestInit = {
      method: 'DELETE',
      headers: getAuthHeaders(data ? { 'Content-Type': 'application/json' } : {}),
    };
    if (data) {
      options.body = JSON.stringify(data);
    }
    const response = await fetch(`${BASE_URL}${endpoint}`, options);
    if (!response.ok) {
      let msg = `HTTP error! status: ${response.status}`;
      try {
        const errJson = await response.json();
        if (errJson && (errJson.message || errJson.error)) {
          msg = errJson.message || errJson.error;
        }
      } catch (_) {}
      throw new Error(msg);
    }
    return response.json();
  }
};

export default api;
