"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import type { User, LoginCredentials } from "@/types/auth"
import { authApi } from "@/lib/api"
import { toast } from "@/components/ui/use-toast"

interface AuthContextType {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<boolean>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [mounted, setMounted] = useState(false)
  const router = useRouter()

  // Only run on client
  useEffect(() => {
    setMounted(true)
  }, [])

  // Load the user from localStorage on initial load
  useEffect(() => {
    if (!mounted) {
      setIsLoading(false)
      return
    }

    const loadUser = () => {
      try {
        const storedToken = localStorage.getItem("auth_token")
        const storedUser = localStorage.getItem("auth_user")

        if (storedToken && storedUser) {
          setToken(storedToken)
          try {
            setUser(JSON.parse(storedUser))
          } catch (e) {
            console.error("Failed to parse user data:", e)
            localStorage.removeItem("auth_user")
          }
        }
      } catch (error) {
        console.error("Error loading user from localStorage:", error)
        // Clear any invalid data
        try {
          localStorage.removeItem("auth_token")
          localStorage.removeItem("auth_user")
        } catch (e) {
          console.error("Failed to clear localStorage:", e)
        }
      } finally {
        setIsLoading(false)
      }
    }

    loadUser()
  }, [mounted])

  // Function to log in
  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    if (!mounted) return false

    try {
      setIsLoading(true)
      const response = await authApi.login(credentials)

      if (response.success && response.data.token && response.data.user) {
        // Store auth data
        try {
          localStorage.setItem("auth_token", response.data.token)
          localStorage.setItem("auth_user", JSON.stringify(response.data.user))
        } catch (e) {
          console.error("Failed to store auth data:", e)
        }

        // Update state
        setToken(response.data.token)
        setUser(response.data.user)

        toast({
          title: "Login Successful",
          description: `Welcome back, ${response.data.user.name}!`,
        })

        return true
      } else {
        throw new Error(response.message || "Login failed")
      }
    } catch (error: any) {
      console.error("Login error:", error)
      toast({
        title: "Login Failed",
        description: error.message || "Invalid credentials. Please try again.",
        variant: "destructive",
      })
      return false
    } finally {
      setIsLoading(false)
    }
  }

  // Function to log out
  const logout = () => {
    if (!mounted) return

    try {
      localStorage.removeItem("auth_token")
      localStorage.removeItem("auth_user")
    } catch (e) {
      console.error("Failed to clear localStorage:", e)
    }

    setToken(null)
    setUser(null)
    router.push("/login")

    toast({
      title: "Logged Out",
      description: "You have been successfully logged out.",
    })
  }

  const isAuthenticated = !!user && !!token

  const value = {
    user,
    token,
    isAuthenticated,
    isLoading,
    login,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

