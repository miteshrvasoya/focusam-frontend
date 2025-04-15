"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { usePathname } from "next/navigation"

type SidebarContextType = {
  isOpen: boolean
  toggle: () => void
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined)

export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(true)
  const [isBrowser, setIsBrowser] = useState(false)
  const pathname = usePathname()

  // Safe check for browser environment
  useEffect(() => {
    setIsBrowser(true)
  }, [])

  // Close sidebar by default on public pages
  useEffect(() => {
    if (!isBrowser) return

    if (pathname?.startsWith("/public") || pathname === "/login") {
      setIsOpen(false)
    }
  }, [pathname, isBrowser])

  const toggle = () => {
    setIsOpen(!isOpen)
  }

  return <SidebarContext.Provider value={{ isOpen, toggle }}>{children}</SidebarContext.Provider>
}

export function useSidebar() {
  const context = useContext(SidebarContext)
  if (context === undefined) {
    throw new Error("useSidebar must be used within a SidebarProvider")
  }
  return context
}

