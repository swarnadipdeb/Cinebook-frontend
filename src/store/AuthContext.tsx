import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import type { User, AuthContextValue } from '../types'
import { authService } from '../services/authService'
import { decodeJwt } from '../utils/jwtDecode'

const extractRoles = (token: string): string[] => {
  const payload = decodeJwt(token)
  if (!payload || !payload.roles || !Array.isArray(payload.roles)) return []
  return (payload.roles as Array<{ name: string }>).map((r) => r.name)
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    const stored = localStorage.getItem('user')
    return stored ? JSON.parse(stored) : null
  })
  const [loading, setLoading] = useState(false)
  const isAdmin = (user?.roles ?? []).includes('ROLE_ADMIN')

  const login = useCallback(async (username: string, password: string): Promise<{ success: boolean }> => {
    setLoading(true)
    try {
      const response = await authService.login({ username, password })
      localStorage.setItem('access_token', response.accessToken)
      localStorage.setItem('refresh_token', response.token)
      const roles = extractRoles(response.accessToken)
      const userData = { id: response.userName, name: username, email: '', roles }
      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))
      setLoading(false)
      return { success: true }
    } catch {
      setLoading(false)
      return { success: false }
    }
  }, [])

  const register = useCallback(async (name: string, email: string, password: string): Promise<{ success: boolean; userName?: string }> => {
    setLoading(true)
    try {
      const response = await authService.signup({ user_name: name, email, password })
      setLoading(false)
      return { success: true, userName: response.userName }
    } catch {
      setLoading(false)
      return { success: false }
    }
  }, [])

  const verifyOtp = useCallback(async (userName: string, otp: string, firstName?: string, lastName?: string, phoneNumber?: string): Promise<{ success: boolean }> => {
    setLoading(true)
    try {
      const response = await authService.verifyOtp(userName, otp, { first_name: firstName, last_name: lastName, phone_number: phoneNumber })
      localStorage.setItem('access_token', response.accessToken)
      localStorage.setItem('refresh_token', response.token)
      localStorage.setItem('userName', response.userName)
      const roles = extractRoles(response.accessToken)
      const userData = { id: response.userName, name: firstName ? `${firstName} ${lastName || ''}`.trim() : 'User', email: '', roles }
      setUser(userData)
      localStorage.setItem('user', JSON.stringify(userData))
      setLoading(false)
      return { success: true }
    } catch {
      setLoading(false)
      return { success: false }
    }
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
    localStorage.removeItem('userId')
    localStorage.removeItem('user')
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, isAdmin, loading, login, register, logout, verifyOtp }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
