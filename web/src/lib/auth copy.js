// Suitable for a local admin MVP; revisit storage strategy for production hardening later

// const TOKEN_KEY = 'token'

// export const getToken = () => localStorage.getItem(TOKEN_KEY)
// export const setToken = (token) => localStorage.setItem(TOKEN_KEY, token)
// export const clearToken = () => localStorage.removeItem(TOKEN_KEY)
// export const isAuthenticated = () => Boolean(getToken())

import { setTokens, clearTokens, getAccessToken, getRefreshToken } from './http.js'
import { auth } from './api.js'

export const login = async (credentials) => {
  const response = await auth.login(credentials)
  setTokens(response.accessToken, response.refreshToken)
  return response
}

export const logout = async () => {
  const refreshToken = getRefreshToken()
  if (refreshToken) {
    try {
      await auth.logout(refreshToken)
    } catch (error) {
      console.error('Logout API call failed:', error)
    }
  }
  clearTokens()
  window.location.href = '/login'
}

export const getToken = getAccessToken

export const setToken = (token) => {
  // For backward compatibility
  localStorage.setItem('accessToken', token)
}

export const isAuthenticated = () => {
  return !!getAccessToken()
}

export { setTokens, clearTokens, getAccessToken, getRefreshToken }