"use client"

import type React from "react"
import { SidebarProvider } from "@/components/sidebar-provider"
import { Sidebar } from "@/components/sidebar"
import { usePathname } from "next/navigation"
import { AuthProvider } from "@/context/auth-context"
import { AuthGuard } from "@/components/auth-guard"

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()
  const isPublicPage = pathname?.startsWith("/public")

  return (
    <AuthProvider>
      <AuthGuard>
        <SidebarProvider>
          <div className="flex min-h-screen">
            {!isPublicPage && <Sidebar />}
            <main className={`flex-1 ${isPublicPage ? "bg-white" : "bg-background"}`}>{children}</main>
          </div>
          {/* <Toaster /> */}
        </SidebarProvider>
      </AuthGuard>
    </AuthProvider>
  )
}

