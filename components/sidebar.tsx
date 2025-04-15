"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { BarChart3, FileText, FilePlus, Settings, Users, Car, Menu, X, LogOut } from "lucide-react"
import { useSidebar } from "./sidebar-provider"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/auth-context"

export function Sidebar() {
  const pathname = usePathname()
  const { isOpen, toggle } = useSidebar()
  const { logout, user } = useAuth()

  // Don't render sidebar for public pages
  if (pathname?.startsWith("/public") || pathname === "/login") {
    return null
  }

  const routes = [
    {
      label: "Dashboard",
      icon: BarChart3,
      href: "/",
      active: pathname === "/",
    },
    {
      label: "Invoices",
      icon: FileText,
      href: "/invoices",
      active: pathname === "/invoices",
    },
    {
      label: "Create Invoice",
      icon: FilePlus,
      href: "/invoices/create",
      active: pathname === "/invoices/create",
    },
    {
      label: "Customers",
      icon: Users,
      href: "/customers",
      active: pathname === "/customers",
    },
    {
      label: "Vehicles",
      icon: Car,
      href: "/vehicles",
      active: pathname === "/vehicles",
    },
    {
      label: "Settings",
      icon: Settings,
      href: "/settings",
      active: pathname === "/settings",
    },
  ]

  return (
    <>
      <div className="md:hidden fixed top-4 left-4 z-50">
        <Button variant="outline" size="icon" onClick={toggle}>
          <Menu className="h-5 w-5" />
        </Button>
      </div>
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col bg-card border-r border-border transition-all duration-300 ease-in-out",
          isOpen ? "w-64" : "w-0 md:w-20",
          "md:relative",
        )}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-border">
          <h1
            className={cn(
              "font-bold text-xl transition-opacity duration-200",
              isOpen ? "opacity-100" : "opacity-0 md:opacity-0",
            )}
          >
            AutoFix
          </h1>
          <Button variant="ghost" size="icon" onClick={toggle} className="md:hidden">
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* User info section */}
        {user && (
          <div
            className={cn(
              "px-4 py-3 border-b border-border transition-opacity duration-200",
              isOpen ? "opacity-100" : "opacity-0 md:opacity-0",
            )}
          >
            <p className="font-medium text-sm">{user.name}</p>
            <p className="text-xs text-muted-foreground">{user.role}</p>
          </div>
        )}

        <div className="flex-1 overflow-auto py-4">
          <nav className="space-y-1 px-2">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors",
                  route.active
                    ? "bg-secondary text-secondary-foreground"
                    : "text-muted-foreground hover:bg-secondary hover:text-secondary-foreground",
                )}
              >
                <route.icon className={cn("h-5 w-5 mr-3", isOpen ? "" : "mx-auto")} />
                <span
                  className={cn(
                    "transition-opacity duration-200",
                    isOpen ? "opacity-100" : "opacity-0 hidden md:block md:opacity-0",
                  )}
                >
                  {route.label}
                </span>
              </Link>
            ))}
          </nav>
        </div>

        {/* Logout button */}
        <div className="p-2 border-t border-border">
          <Button
            variant="ghost"
            className={cn(
              "w-full justify-start text-muted-foreground hover:text-foreground",
              !isOpen && "justify-center",
            )}
            onClick={logout}
          >
            <LogOut className={cn("h-5 w-5 mr-3", isOpen ? "" : "mx-auto")} />
            <span
              className={cn(
                "transition-opacity duration-200",
                isOpen ? "opacity-100" : "opacity-0 hidden md:block md:opacity-0",
              )}
            >
              Logout
            </span>
          </Button>
        </div>
      </div>
    </>
  )
}

