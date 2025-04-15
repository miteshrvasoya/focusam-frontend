export interface User {
  id: string
  name: string
  email: string
  mobile: string
  role: "admin" | "staff"
}

export interface LoginCredentials {
  mobile: string
  password: string
}

export interface AuthResponse {
  user: User
  token: string
  success: boolean
  message?: string
}

