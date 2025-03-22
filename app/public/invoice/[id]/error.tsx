"use client"

import { Button } from "@/components/ui/button"
import { useEffect } from "react"

export default function InvoiceError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error(error)
  }, [error])

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-white text-black">
      <h1 className="text-3xl font-bold mb-4">Something went wrong</h1>
      <p className="text-gray-600 mb-6 text-center">We encountered an error while trying to load this invoice.</p>
      <Button onClick={reset} className="bg-blue-600 hover:bg-blue-700">
        Try again
      </Button>
    </div>
  )
}

