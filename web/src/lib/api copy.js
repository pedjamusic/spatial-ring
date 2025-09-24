// import { getToken } from './auth'
import http, { setTokens} from "./http"


export const login = async (credentials) => {
  const { accessToken, refreshToken } = await auth.login(credentials)
  setTokens(accessToken, refreshToken)
}

// const base = import.meta.env.VITE_API_BASE_URL || '/api'

// const json = async (resPromise) => {
//   const res = await resPromise
//   if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.error || res.statusText)

//       // If response is 204 No Content, return empty object instead of trying to parse JSON
//   if (res.status === 204) return {}
  
//   return res.json()
// }

// const headers = () => {
//   const token = getToken()
//   console.log('🔑 Token for API call:', token ? `${token.substring(0, 20)}...` : 'NO TOKEN')
//   const h = { 'Content-Type': 'application/json' }
//   if (token) {
//     h.Authorization = `Bearer ${token}`
//     console.log('✅ Authorization header set')
//   } else {
//     console.warn('⚠️ No token found for API call')
//   }
//   return h
// }

// Auth API
export const auth = {
  login: (credentials) => http.post('/auth/login', credentials).then(r => r.data),
  logout: (refreshToken) => http.post('/auth/logout', { refreshToken }).then(r => r.data),
  refresh: (refreshToken) => http.post('/auth/refresh', { refreshToken }).then(r => r.data),
}

// Utility to make authenticated requests
export const authFetch = (endpoint, options = {}) => {
  return http.get(endpoint, options).then(r => r.data)
}

// A generic, authenticated fetcher for any endpoint
// export const authFetch = async (endpoint) => {
//   const requestHeaders = headers();
//   console.log('🌐 Making authenticated request to:', endpoint)
//   console.log('📋 Headers:', requestHeaders)

//   const response = await fetch(`${base}/${endpoint}`, { headers: requestHeaders });

//   console.log('📡 Response status:', response.status);

//   if (!response.ok) {
//     // If auth fails, it will throw an error here
//     const errorBody = await response.json().catch(() => ({ error: `HTTP error ${response.status}` }));
//     console.error('❌ API Error:', errorBody)
//     throw new Error(errorBody.error || `Request failed with status ${response.status}`);
//   }

//   const data = await response.json()
//   console.log('✅ Data received:', data)
//   return data;
// };

export const resource = (name) => {
  return {
    list: (params) => http.get(`/${name}`, { params }).then(r => r.data),
    get: (id) => http.get(`/${name}/${id}`).then(r => r.data),
    create: (data) => http.post(`/${name}`, data).then(r => r.data),
    update: (id, data) => http.put(`/${name}/${id}`, data).then(r => r.data),
    remove: (id) => http.delete(`/${name}/${id}`).then(r => r.data || {}),
  }
}

