const BASE_URL = 'http://localhost:3000/api'

const json = async (resPromise) => {
  const res = await resPromise
  if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.error || res.statusText)
  return res.json()
}

const headers = () => {
  const token = getToken()
  console.log('🔑 Token for API call:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN')
  const h = { 'Content-Type': 'application/json' }
  if (token) {
    h.Authorization = `Bearer ${token}`
    console.log('✅ Authorization header set')
  } else {
    console.warn('⚠️ No token found for API call')
  }
  return h
}

// A generic, authenticated fetcher for any endpoint
export const authFetch = async (endpoint) => {
  const requestHeaders = headers();
  console.log('🌐 Making authenticated request to:', endpoint)
  console.log('📋 Headers:', requestHeaders)

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
