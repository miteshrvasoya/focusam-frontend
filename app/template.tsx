import type React from "react"
import { ClientWrapper } from "@/components/client-wrapper"

export default function Template({ children }: { children: React.ReactNode }) {
  return <ClientWrapper>{children}</ClientWrapper>
}

