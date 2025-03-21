import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { SidebarProvider } from "@/components/sidebar-provider"
import { Sidebar } from "@/components/sidebar"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Focus Automobile",
  description: "Car Repair and Workshop System",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {

  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
      <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  )
}

import './globals.css'
import LayoutWrapper from "./layoutWrapper"

