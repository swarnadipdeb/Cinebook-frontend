import axios from 'axios'
import { AUTH_BASE_URL } from '../constants/config'

const authApi = axios.create({
  baseURL: `${AUTH_BASE_URL}/auth/v1`,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

export interface SignupRequest {
  user_name: string
  email: string
  password: string
  roles?: Object[]
}

export interface SignupVerifyRequest {
  first_name: string
  last_name: string
  phone_number?: number
}

export interface LoginRequest {
  username: string
  password: string
}

export interface RefreshTokenRequest {
  token: string
}

export interface AuthResponse {
  accessToken: string
  token: string
  userId: string
}

export interface AuthError {
  message: string
  status: number
}

const authService = {
  /**
   * Step 1: Signup - Send OTP to email
   * POST /auth/v1/signup
   */
  signup: async (data: SignupRequest): Promise<string> => {
    const response = await authApi.post<string>('/signup', data)
    return response.data
  },

  /**
   * Step 2: Verify OTP & Complete Registration
   * POST /auth/v1/signup-otp-verify?otp=<code>
   */
  verifyOTP: async (userId: string, otp: string, data: SignupVerifyRequest): Promise<AuthResponse> => {
    const response = await authApi.post<AuthResponse>(`/signup-otp-verify?otp=${otp}`, data, {
      headers: {
        UserId: userId,
      },
    })
    return response.data
  },

  /**
   * Login with username and password
   * POST /auth/v1/login
   */
  login: async (data: LoginRequest): Promise<AuthResponse> => {
    const response = await authApi.post<AuthResponse>('/login', data)
    return response.data
  },

  /**
   * Refresh access token
   * POST /auth/v1/refreshToken
   */
  refreshToken: async (data: RefreshTokenRequest): Promise<AuthResponse> => {
    const response = await authApi.post<AuthResponse>('/refreshToken', data)
    return response.data
  },

  /**
   * Verify JWT token (protected endpoint)
   * GET /auth/v1/ping
   */
  ping: async (): Promise<string> => {
    const accessToken = localStorage.getItem('accessToken')
    const response = await authApi.get<string>('/ping', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })
    return response.data
  },

  /**
   * Health check
   * GET /health
   */
  healthCheck: async (): Promise<boolean> => {
    const response = await authApi.get<boolean>('/health')
    return response.data
  },
}

export default authService