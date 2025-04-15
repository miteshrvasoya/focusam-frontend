"use client"

import { useToast } from "./use-toast"
import { X } from "lucide-react"
import { useEffect, useState } from "react"

export function Toaster() {
  const { toasts } = useToast()
  const [mounted, setMounted] = useState(false)

  // Only run on client
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            p-4 rounded-md shadow-md min-w-[300px] max-w-md 
            transition-all duration-300 transform 
            ${toast.visible ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"}
            ${toast.variant === "destructive" ? "bg-destructive text-destructive-foreground" : "bg-background border"}
          `}
        >
          <div className="flex justify-between items-start">
            <div>
              <h3 className="font-medium">{toast.title}</h3>
              <p className="text-sm text-muted-foreground">{toast.description}</p>
            </div>
            <button
              className="text-muted-foreground hover:text-foreground"
              onClick={() => {
                if (typeof window !== "undefined") {
                  const event = new CustomEvent("toast-hide", {
                    detail: { id: toast.id },
                  })
                  window.dispatchEvent(event)
                }
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

