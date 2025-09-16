// Suitable for a local admin MVP; revisit storage strategy for production hardening later

const TOKEN_KEY = 'token'

export const getToken = () => localStorage.getItem(TOKEN_KEY)
export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token)
export const clearToken = () => localStorage.removeItem(TOKEN_KEY)
export const isAuthenticated = () => Boolean(getToken())
