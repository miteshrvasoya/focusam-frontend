"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { LoadingSpinner } from "./loading-spinner"

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isChecking, setIsChecking] = useState(true)
  const [mounted, setMounted] = useState(false)

  // Only run on client
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    // Check if this is a public page that doesn't need authentication
    const isPublicPage = pathname?.startsWith("/public") || pathname === "/login"

    if (!isLoading) {
      if (!isAuthenticated && !isPublicPage) {
        router.push("/login")
      }
      setIsChecking(false)
    }
  }, [isAuthenticated, isLoading, pathname, router, mounted])

  // Don't render anything on server
  if (!mounted) {
    return null
  }

  // Show loading while checking authentication
  if (isLoading || isChecking) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    )
  }

  // If path is login and user is authenticated, redirect to dashboard
  if (pathname === "/login" && isAuthenticated) {
    router.push("/")
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    )
  }

  // Check if this is a public page or the user is authenticated
  const isPublicPage = pathname?.startsWith("/public")

  if (isPublicPage || isAuthenticated) {
    return <>{children}</>
  }

  // Default case - should not reach here due to redirect in useEffect
  return null
}

