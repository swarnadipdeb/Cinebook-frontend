import { AUTH_BASE_URL } from '../constants/config'

export interface SignupRequest {
  user_name: string
  email: string
  password: string
  roles?: string[]
}

export interface OtpVerifyRequest {
  first_name?: string
  last_name?: string
  phone_number?: string
}

export interface LoginRequest {
  username: string
  password: string
}

export interface JwtResponse {
  accessToken: string
  token: string
  userId: string
}

export interface RefreshTokenRequest {
  token: string
}

const TIMEOUT_MS = 150000

async function fetchWithTimeout(url: string, options: RequestInit): Promise<Response> {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), TIMEOUT_MS)
  try {
    const response = await fetch(url, { ...options, signal: controller.signal })
    return response
  } finally {
    clearTimeout(timeout)
  }
}

export const authService = {
  async signup(data: SignupRequest): Promise<{ userId: string }> {
    const response = await fetchWithTimeout(`${AUTH_BASE_URL}/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      const error = await response.text()
      throw new Error(error || 'Signup failed')
    }
    return response.json()
  },

  async verifyOtp(userId: string, otp: string, data?: OtpVerifyRequest): Promise<JwtResponse> {
    const response = await fetchWithTimeout(`${AUTH_BASE_URL}/signup-otp-verify?otp=${otp}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        UserId: userId,
      },
      body: JSON.stringify(data || {}),
    })
    if (!response.ok) {
      const error = await response.text()
      throw new Error(error || 'OTP verification failed')
    }
    return response.json()
  },

  async login(credentials: LoginRequest): Promise<JwtResponse> {
    const response = await fetchWithTimeout(`${AUTH_BASE_URL}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    })
    if (!response.ok) {
      const error = await response.text()
      throw new Error(error || 'Login failed')
    }
    return response.json()
  },

  async refreshToken(data: RefreshTokenRequest): Promise<JwtResponse> {
    const response = await fetchWithTimeout(`${AUTH_BASE_URL}/refreshToken`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
    if (!response.ok) {
      const error = await response.text()
      throw new Error(error || 'Token refresh failed')
    }
    return response.json()
  },
}
