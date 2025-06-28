import Cookies from 'js-cookie'

export const setAuthToken = (token: string) => {
  // Set token in cookie
  Cookies.set('token', token, { expires: 1 }) // Expires in 1 day
  // Also set in localStorage for backward compatibility
  localStorage.setItem('token', token)
}

export const setUserData = (user: any) => {
  // Store user data in localStorage
  localStorage.setItem('user', JSON.stringify(user))
}

export const getUserData = () => {
  const userData = localStorage.getItem('user')
  return userData ? JSON.parse(userData) : null
}

export const getAuthToken = () => {
  // Try to get from cookie first
  const cookieToken = Cookies.get('token')
  if (cookieToken) return cookieToken
  
  // Fallback to localStorage
  return localStorage.getItem('token')
}

export const removeAuthToken = () => {
  // Remove token from cookies
  Cookies.remove('token')
  // Remove token from localStorage (correct key name)
  localStorage.removeItem('token')
  // Remove token from sessionStorage
  sessionStorage.removeItem('token')
  // Clear any other auth-related data
  localStorage.removeItem('user')
  sessionStorage.removeItem('user')
}

export const isAuthenticated = () => {
  return !!getAuthToken()
}

export const logout = async () => {
  try {
    // Try to call backend logout endpoint
    const token = getAuthToken()
    if (token) {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/logout`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })
    }
  } catch (error) {
    console.warn('Backend logout failed, continuing with client-side logout:', error)
  } finally {
    // Always clear local storage and redirect
    removeAuthToken()
    window.location.href = '/login'
  }
}

// Get the authentication header for API requests
export const getAuthHeader = () => {
  const token = getAuthToken()
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  }
} 