// web/src/lib/api.js
import { getToken } from './auth'

const base = import.meta.env.VITE_API_BASE_URL || '/api'

const json = async (resPromise) => {
  const res = await resPromise
  if (!res.ok) throw new Error((await res.json().catch(() => ({})))?.error || res.statusText)
  return res.json()
}

const headers = () => {
  const h = { 'Content-Type': 'application/json' }
  const token = getToken()
  if (token) h.Authorization = `Bearer ${token}`
  return h
}

export const resource = (name) => {
  const url = `${base}/${name}`
  return {
    list: (params) =>
      json(fetch(url + (params ? `?${new URLSearchParams(params)}` : ''), { headers: headers() })),
    get: (id) => json(fetch(`${url}/${id}`, { headers: headers() })),
    create: (data) =>
      json(fetch(url, { method: 'POST', headers: headers(), body: JSON.stringify(data) })),
    update: (id, data) =>
      json(fetch(`${url}/${id}`, { method: 'PUT', headers: headers(), body: JSON.stringify(data) })),
    remove: (id) =>
      json(fetch(`${url}/${id}`, { method: 'DELETE', headers: headers() })),
  }
}
