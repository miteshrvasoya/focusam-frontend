"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { SidebarProvider } from "@/components/sidebar-provider"
import { Sidebar } from "@/components/sidebar"
import { AuthProvider } from "@/context/auth-context"
import { ErrorBoundary } from "@/components/error-boundary"
import { usePathname } from "next/navigation"
import { LoadingSpinner } from "@/components/loading-spinner"

export function ClientWrapper({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false)
  const pathname = usePathname()
  const isPublicPage = pathname?.startsWith("/public") || pathname === "/login"

  // Only render client-side
  useEffect(() => {
    setMounted(true)
  }, [])

  // Show a loading state while the client components are mounting
  if (!mounted) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <AuthProvider>
        {isPublicPage ? (
          // For public pages, render without sidebar
          <div className={isPublicPage ? "bg-white text-black" : ""}>{children}</div>
        ) : (
          // For protected pages, render with sidebar
          <SidebarProvider>
            <div className="flex min-h-screen">
              <Sidebar />
              <main className="flex-1">{children}</main>
            </div>
          </SidebarProvider>
        )}
      </AuthProvider>
    </ErrorBoundary>
  )
}

