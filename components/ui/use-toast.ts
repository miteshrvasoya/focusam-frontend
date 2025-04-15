"use client"

import { useState, useEffect } from "react"

type ToastProps = {
  title: string
  description: string
  variant?: "default" | "destructive"
  duration?: number
}

type ToastState = ToastProps & {
  id: string
  visible: boolean
}

// Simple toast implementation
export function toast(props: ToastProps) {
  if (typeof window === "undefined") return

  const id = Math.random().toString(36).substring(2, 9)
  const toastEvent = new CustomEvent("toast", {
    detail: {
      ...props,
      id,
      visible: true,
    },
  })

  window.dispatchEvent(toastEvent)

  // Auto-hide toast after duration
  setTimeout(() => {
    if (typeof window !== "undefined") {
      const hideEvent = new CustomEvent("toast-hide", {
        detail: { id },
      })
      window.dispatchEvent(hideEvent)
    }
  }, props.duration || 3000)
}

export function useToast() {
  const [toasts, setToasts] = useState<ToastState[]>([])
  const [mounted, setMounted] = useState(false)

  // Only run on client
  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const handleToast = (event: CustomEvent<ToastState>) => {
      setToasts((prev) => [...prev, event.detail])
    }

    const handleHideToast = (event: CustomEvent<{ id: string }>) => {
      setToasts((prev) => prev.map((toast) => (toast.id === event.detail.id ? { ...toast, visible: false } : toast)))

      // Remove toast from array after animation
      setTimeout(() => {
        setToasts((prev) => prev.filter((toast) => toast.id !== event.detail.id))
      }, 300)
    }

    window.addEventListener("toast", handleToast as EventListener)
    window.addEventListener("toast-hide", handleHideToast as EventListener)

    return () => {
      window.removeEventListener("toast", handleToast as EventListener)
      window.removeEventListener("toast-hide", handleHideToast as EventListener)
    }
  }, [mounted])

  return { toasts }
}

