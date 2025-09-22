// web/src/lib/api.js
import { getToken } from './auth'

const base = import.meta.env.VITE_API_BASE_URL || '/api'

const json = async (resPromise) => {
  const res = await resPromise
  if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.error || res.statusText)

      // If response is 204 No Content, return empty object instead of trying to parse JSON
  if (res.status === 204) return {}
  
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

  const response = await fetch(`${base}/${endpoint}`, { headers: requestHeaders });

  console.log('📡 Response status:', response.status);

  if (!response.ok) {
    // If auth fails, it will throw an error here
    const errorBody = await response.json().catch(() => ({ error: `HTTP error ${response.status}` }));
    console.error('❌ API Error:', errorBody)
    throw new Error(errorBody.error || `Request failed with status ${response.status}`);
  }

  const data = await response.json()
  console.log('✅ Data received:', data)
  return data;
};

export const resource = (name) => {
  const url = `${base}/${name}`
  return {
    list: (params) =>
      json(fetch(url + (params ? `?${new URLSearchParams(params)}` : ''), { headers: headers() })),
    get: (id) => json(fetch(`${url}/${id}`, { headers: headers() })),
    create: (data) => {
      console.log("🚀 Creating resource at:", url, "with data:", data);
      return json(fetch(url, { method: 'POST', headers: headers(), body: JSON.stringify(data) }));
    },
    update: (id, data) =>
      json(fetch(`${url}/${id}`, { method: 'PUT', headers: headers(), body: JSON.stringify(data) })),
    remove: (id) =>
      json(fetch(`${url}/${id}`, { method: 'DELETE', headers: headers() })),
  }
}
