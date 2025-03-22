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
  return <div className="bg-white text-black min-h-screen">{children}</div>
}

