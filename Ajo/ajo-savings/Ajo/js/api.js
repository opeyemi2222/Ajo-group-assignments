/**
 * api.js — API Layer
 * Base URL points to JSON Server running on port 3000.
 * Adapt BASE_URL if your backend is different.
 */

const BASE_URL = 'http://localhost:3000';

async function apiCall(method, path, body) {
  let res;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (networkError) {
    throw new Error(`Network error: ${networkError.message}`);
  }

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`HTTP ${res.status}: ${text}`);
  }

  const contentType = res.headers.get('Content-Type') || '';
  if (res.status === 204 || !contentType.includes('application/json')) return null;
  return res.json();
}

// Members (needed to populate the dropdown)
export const getMembers = () => apiCall('GET', '/members');

// Contributions CRUD
export const getContributions    = ()        => apiCall('GET',    '/contributions');
export const addContribution     = (data)    => apiCall('POST',   '/contributions', data);
export const updateContribution  = (id, data)=> apiCall('PUT',    `/contributions/${id}`, data);
export const deleteContribution  = (id)      => apiCall('DELETE', `/contributions/${id}`);
