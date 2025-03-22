"use client"

import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { SidebarProvider } from "@/components/sidebar-provider"
import { Sidebar } from "@/components/sidebar"
import { usePathname } from "next/navigation"

const inter = Inter({ subsets: ["latin"] })

export default function ClientLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()
  const isPublicPage = pathname?.startsWith("/public")

  return (
    <html lang="en" className={isPublicPage ? "" : "dark"}>
      <body className={inter.className}>
        <SidebarProvider>
          <div className="flex min-h-screen">
            {!isPublicPage && <Sidebar />}
            <main className={`flex-1 ${isPublicPage ? "bg-white" : "bg-background"}`}>{children}</main>
          </div>
        </SidebarProvider>
      </body>
    </html>
  )
}

