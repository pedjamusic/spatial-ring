import { config } from "../config";

const BASE_URL = config.apiUrl ? `${config.apiUrl}/api` : "/api";

async function handleResponse(response) {
  if (response.status === 401) {
    localStorage.removeItem("token");
    window.location.href = "/login";
    throw new Error("Unauthorized");
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error || `Request failed: ${response.statusText}`,
    );
  }

  if (response.status === 204) {
    return {};
  }

  return response.json();
}

function getAuthHeaders() {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

async function makeRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const fetchConfig = {
    ...options,
    headers: getAuthHeaders(),
  };

  const response = await fetch(url, fetchConfig);
  return await handleResponse(response);
}

function buildQuery(params) {
  const entries = Object.entries(params).filter(([, v]) => v != null && v !== '');
  if (!entries.length) return '';
  return '?' + new URLSearchParams(entries).toString();
}

export const resource = (name) => ({
  list: (params) => {
    const query = params ? buildQuery(params) : '';
    return makeRequest(`/${name}${query}`);
  },
  get: (id) => makeRequest(`/${name}/${id}`),
  create: (data) =>
    makeRequest(`/${name}`, {
      method: "POST",
      body: JSON.stringify(data),
    }),
  update: (id, data) =>
    makeRequest(`/${name}/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  remove: (id) =>
    makeRequest(`/${name}/${id}`, {
      method: "DELETE",
    }),
});

export const authFetch = (endpoint) => makeRequest(`/${endpoint}`);
