import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "AutoFix Workshop - Invoice",
  description: "View your invoice from AutoFix Workshop",
}

export default function PublicLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // No HTML or body tags, just a simple wrapper
  return <>{children}</>
}

