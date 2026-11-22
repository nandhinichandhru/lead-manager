const BASE_URL = '/api';

export class ApiClientError extends Error {
  constructor(message, status = 0, errors = undefined) {
    super(message);
    this.name = 'ApiClientError';
    this.status = status;
    this.errors = errors;
  }
}

async function request(path, { method = 'GET', body, signal } = {}) {
  let response;

  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      signal,
      headers: body ? { 'Content-Type': 'application/json' } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new ApiClientError('Could not reach the server. Is the API running on port 5000?');
  }

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const payload = isJson ? await response.json().catch(() => null) : null;

  if (!response.ok) {
    throw new ApiClientError(
      payload?.message || `Request failed with status ${response.status}`,
      response.status,
      payload?.errors,
    );
  }

  return payload;
}

function toQuery(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '' && value !== 'All') {
      query.set(key, value);
    }
  });
  const string = query.toString();
  return string ? `?${string}` : '';
}

export const api = {
  listLeads(params = {}, options = {}) {
    return request(`/leads${toQuery(params)}`, options);
  },
  getLead(id, options = {}) {
    return request(`/leads/${id}`, options);
  },
  createLead(payload) {
    return request('/leads', { method: 'POST', body: payload });
  },
  updateLead(id, payload) {
    return request(`/leads/${id}`, { method: 'PUT', body: payload });
  },
  deleteLead(id) {
    return request(`/leads/${id}`, { method: 'DELETE' });
  },
  getStats(options = {}) {
    return request('/stats', options);
  },
};
