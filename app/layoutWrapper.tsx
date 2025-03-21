"use client"

import { usePathname } from "next/navigation"
import { SidebarProvider } from "@/components/sidebar-provider"
import { Sidebar } from "@/components/sidebar"

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const isPublicInvoicePage = pathname.includes("/public/invoice") // Adjust if necessary

  console.log("Path Name: ", pathname);
  console.log("pathname.includes(/invoice/public: ", pathname.includes("/invoice/public"));
  console.log("isPublicInvoicePage :", isPublicInvoicePage);

  return (
    <SidebarProvider>
      <div className="flex min-h-screen">
        {!isPublicInvoicePage && <Sidebar />}
        <main className="flex-1 bg-background">{children}</main>
      </div>
    </SidebarProvider>
  )
}
