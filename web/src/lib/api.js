const base = import.meta.env.VITE_API_BASE_URL || '/api'

const json = async (resPromise) => {
  const res = await resPromise
  if (!res.ok) {
    // throw new Error((await res.json().catch(() => ({})))?.error || res.statusText)
    if (res.status === 401) {
      localStorage.removeItem('token')
      window.location.href = '/login'
      return
    }
    const error = await res.json().catch(() => ({}))
    throw new Error(error.error || `Request failed with status ${res.status}`)
  }
  if (res.status === 204) return {}
  return res.json()
}

const headers = () => {
  const token = localStorage.getItem('token')
  return {
    'Content-Type': 'application/json',
    ...(token && { Authorization: `🐻 Bearer ${token}` })
  }
}

export const resource = (name) => {
  const url = `${base}/${name}`
  return {
    list: () => json(fetch(url, { headers: headers() })),
    get: (id) => json(fetch(`${url}/${id}`, { headers: headers() })),
    create: (data) => json(fetch(url, { method: 'POST', headers: headers(), body: JSON.stringify(data) })),
    update: (id, data) => json(fetch(`${url}/${id}`, { method: 'PUT', headers: headers(), body: JSON.stringify(data) })),
    remove: (id) => json(fetch(`${url}/${id}`, { method: 'DELETE', headers: headers() })),
  }
}

export const authFetch = (endpoint) => {
  const url = `${base}${endpoint}`
  return json(fetch(url, { headers: headers() }))
}
