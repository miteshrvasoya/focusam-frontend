import type { User, LoginCredentials, AuthResponse } from "@/types/auth"

// Mock users for demo purposes
const MOCK_USERS: User[] = [
  {
    id: "usr_001",
    name: "Admin User",
    email: "admin@autofixworkshop.com",
    mobile: "9876543210",
    role: "admin",
  },
  {
    id: "usr_002",
    name: "Staff User",
    email: "staff@autofixworkshop.com",
    mobile: "9876543211",
    role: "staff",
  },
]

// Mock authentication service
export const mockAuthService = {
  // Mock login function
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1000))

    // Find user by mobile
    const user = MOCK_USERS.find((u) => u.mobile === credentials.mobile)

    // For demo purposes, check if password matches "password123"
    if (user && credentials.password === "password123") {
      return {
        success: true,
        user,
        token: `mock_token_${user.id}_${Date.now()}`,
      }
    }

    // Authentication failed
    return {
      success: false,
      message: "Invalid mobile number or password",
      user: null as any,
      token: "",
    }
  },

  // Mock function to get current user
  getCurrentUser: async (token: string): Promise<AuthResponse> => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Extract user ID from token
    const tokenParts = token.split("_")
    if (tokenParts.length < 2) {
      return {
        success: false,
        message: "Invalid token format",
        user: null as any,
        token: "",
      }
    }

    const userId = tokenParts[1]
    const user = MOCK_USERS.find((u) => u.id === userId)

    if (user) {
      return {
        success: true,
        user,
        token,
      }
    }

    return {
      success: false,
      message: "Invalid or expired token",
      user: null as any,
      token: "",
    }
  },
}

