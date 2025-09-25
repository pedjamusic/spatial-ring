const BASE_URL = '/api';

// This is a robust helper to handle all fetch responses.
async function handleResponse(response) {
  // If the server returns a 401 Unauthorized, the token is bad.
  // Clear the token and redirect to the login page.
  if (response.status === 401) {
    localStorage.removeItem('token');
    window.location.href = '/login';
    // Throw an error to stop further processing
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    // Try to parse the error message from the JSON body
    const errorData = await response.json().catch(() => ({}));
    // Throw an error with the server's message or a generic one
    throw new Error(errorData.error || `Request failed: ${response.statusText}`);
  }

  // If the response is 204 No Content (e.g., from a DELETE request), return an empty object.
  if (response.status === 204) {
    return {};
  }

  // Otherwise, parse and return the JSON body.
  return response.json();
}

// A helper to construct the authorization headers.
function getAuthHeaders() {
  const token = localStorage.getItem('token');
  // const headers = {
  //   'Content-Type': 'application/json',
  // };
  // if (token) {
  //   headers['Authorization'] = `Bearer ${token}`;
  // }
  // return headers;
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

// The main function for making API requests.
async function makeRequest(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const config = {
    ...options,
    headers: getAuthHeaders(),
  };

  try {
    const response = await fetch(url, config);
    return await handleResponse(response);
  } catch (error) {
    console.error(`API request to ${endpoint} failed:`, error);
    // Re-throw the error so component-level error handling can catch it.
    throw error;
  }
}

// Your resource factory, now using the robust makeRequest function.
export const resource = (name) => ({
  list: () => makeRequest(`/${name}`),
  get: (id) => makeRequest(`/${name}/${id}`),
  create: (data) => makeRequest(`/${name}`, {
    method: 'POST',
    body: JSON.stringify(data),
  }),
  update: (id, data) => makeRequest(`/${name}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  }),
  remove: (id) => makeRequest(`/${name}/${id}`, {
    method: 'DELETE',
  }),
});

// This function is used for fetching relation options.
export const authFetch = (endpoint) => makeRequest(`/${endpoint}`);
