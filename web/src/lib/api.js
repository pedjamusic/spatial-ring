const BASE_URL = 'http://localhost:3000/api'

const makeRequest = async (url, options = {}) => {
  const token = localStorage.getItem('accessToken')
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  }

  const response = await fetch(`${BASE_URL}${url}`, config)
  
  if (!response.ok) {
    if (response.status === 401) {
      localStorage.clear()
      window.location.href = '/login'
      return
    }
    throw new Error(`Request failed: ${response.status}`)
  }

  if (response.status === 204) return {}
  return response.json()
}

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
})

export const authFetch = (url) => makeRequest(url)
