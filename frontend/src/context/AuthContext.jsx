import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import api from '@/services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [token, setToken]     = useState(() => localStorage.getItem('cf_token'))
  const [loading, setLoading] = useState(true)

  // On mount: if token exists, fetch profile to validate it
  useEffect(() => {
    if (!token) { setLoading(false); return }
    api.defaults.headers.common['Authorization'] = `Bearer ${token}`
    api.get('/users/profile')
      .then(({ data }) => setUser(data.user))
      .catch(() => { localStorage.removeItem('cf_token'); setToken(null) })
      .finally(() => setLoading(false))
  }, []) // eslint-disable-line

  const login = useCallback((newToken, userData) => {
    localStorage.setItem('cf_token', newToken)
    api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`
    setToken(newToken)
    setUser(userData)
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('cf_token')
    delete api.defaults.headers.common['Authorization']
    setToken(null)
    setUser(null)
  }, [])

  const updateUser = useCallback((updated) => setUser(updated), [])

  return (
    <AuthContext.Provider value={{ user, token, loading, isAuthenticated: !!token, login, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
