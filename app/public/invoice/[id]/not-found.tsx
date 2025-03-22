import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function InvoiceNotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-white text-black">
      <h1 className="text-3xl font-bold mb-4">Invoice Not Found</h1>
      <p className="text-gray-600 mb-6 text-center">
        The invoice you're looking for doesn't exist or has been removed.
      </p>
      <Button asChild className="bg-blue-600 hover:bg-blue-700">
        <Link href="/">Return to Home</Link>
      </Button>
    </div>
  )
}

