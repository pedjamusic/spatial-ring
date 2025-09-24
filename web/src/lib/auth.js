export const login = async (credentials) => {
  const response = await fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  })

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Login failed' }))
    throw new Error(error.error || 'Login failed')
  }

  const data = await response.json()
  
  // Store tokens
  localStorage.setItem('accessToken', data.accessToken)
  localStorage.setItem('refreshToken', data.refreshToken)
  
  console.log('✅ Tokens stored:', {
    accessToken: data.accessToken.substring(0, 20) + '...',
    refreshToken: data.refreshToken.substring(0, 20) + '...'
  })
  
  return data
}

export const logout = () => {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
  window.location.href = '/login'
}

export const getToken = () => localStorage.getItem('accessToken')

export const isAuthenticated = () => !!localStorage.getItem('accessToken')