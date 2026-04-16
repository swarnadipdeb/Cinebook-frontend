import { createContext, useContext, useState, useCallback, ReactNode } from 'react'
import type { User, AuthContextValue } from '../types'

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(false)

  const login = useCallback((email: string, _password: string): Promise<{ success: boolean }> => {
    setLoading(true)
    return new Promise((resolve) => {
      setTimeout(() => {
        setUser({ id: '1', name: 'John Doe', email })
        setLoading(false)
        resolve({ success: true })
      }, 800)
    })
  }, [])

  const register = useCallback((name: string, email: string, _password: string): Promise<{ success: boolean }> => {
    setLoading(true)
    return new Promise((resolve) => {
      setTimeout(() => {
        setUser({ id: '1', name, email })
        setLoading(false)
        resolve({ success: true })
      }, 800)
    })
  }, [])

  const logout = useCallback(() => {
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, isLoggedIn: !!user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext)
  if (!context) throw new Error('useAuth must be used within AuthProvider')
  return context
}
