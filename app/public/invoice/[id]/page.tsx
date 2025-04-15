"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Printer } from "lucide-react"
import { LoadingSpinner } from "@/components/loading-spinner"
import { ErrorMessage } from "@/components/error-message"
import { invoicesApi } from "@/lib/api"
import type { Invoice } from "@/types/api"
import Image from "next/image"
import { ErrorBoundary } from "@/components/error-boundary"

export default function PublicInvoiceView({ params }: { params: { id: string } }) {
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const printRef = useRef<HTMLDivElement>(null)

  // Only run on client
  useEffect(() => {
    setMounted(true)
  }, [])

  const fetchInvoice = async () => {
    if (!mounted) return

    setIsLoading(true)
    setError(null)
    try {
      const response = await invoicesApi.getById(params.id)
      setInvoice(response.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load invoice details")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (mounted) {
      fetchInvoice()
    }
  }, [params.id, mounted])

  const handlePrint = () => {
    if (mounted && typeof window !== "undefined") {
      window.print()
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      paid: { label: "Paid", className: "bg-green-600" },
      pending: { label: "Pending", className: "bg-yellow-600" },
      overdue: { label: "Overdue", className: "bg-red-600" },
      default: { label: "Unknown", className: "" },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.default
    return <Badge className={config.className}>{config.label}</Badge>
  }

  // Don't render anything on server
  if (!mounted) {
    return null
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <ErrorMessage message={error} onRetry={fetchInvoice} />
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <ErrorMessage message="Invoice not found" onRetry={fetchInvoice} />
      </div>
    )
  }

  return (
    <ErrorBoundary>
      <div className="p-4 sm:p-6 max-w-4xl mx-auto">
        <div className="flex justify-end mb-4">
          <Button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700">
            <Printer className="h-4 w-4 mr-2" />
            Print Invoice
          </Button>
        </div>

        <div ref={printRef} className="space-y-6">
          {/* Header with logo and invoice info */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
            <div className="flex items-center mb-4 sm:mb-0">
              <div className="mr-3">
                <Image src="/logo.svg" alt="AutoFix Workshop" width={50} height={50} className="h-12 w-12" />
              </div>
              <div>
                <h1 className="text-2xl font-bold">AutoFix Workshop</h1>
                <p className="text-gray-600">Professional Auto Repair Services</p>
              </div>
            </div>
            <div className="text-right">
              <h2 className="text-xl font-bold">Invoice #{invoice.id}</h2>
              <div className="flex items-center justify-end mt-1">
                <span className="mr-2">Status:</span>
                {getStatusBadge(invoice.status)}
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="flex flex-col sm:flex-row justify-between text-sm gap-2">
            <div className="bg-gray-50 p-3 rounded-md flex-1">
              <p>
                <span className="font-medium">Invoice Date:</span> {new Date(invoice.date).toLocaleDateString()}
              </p>
            </div>
            <div className="bg-gray-50 p-3 rounded-md flex-1">
              <p>
                <span className="font-medium">Due Date:</span> {new Date(invoice.dueDate).toLocaleDateString()}
              </p>
            </div>
            <div className="bg-gray-50 p-3 rounded-md flex-1">
              <p>
                <span className="font-medium">Payment Method:</span> {invoice.paymentMethod}
              </p>
            </div>
          </div>

          {/* Customer and Vehicle Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="shadow-sm">
              <CardContent className="p-4">
                <h3 className="font-bold text-lg mb-2 text-blue-700">Customer Information</h3>
                <div className="space-y-1">
                  <p>
                    <span className="font-medium">Name:</span> {invoice.customer}
                  </p>
                  <p>
                    <span className="font-medium">Customer ID:</span> {invoice.customerId}
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="p-4">
                <h3 className="font-bold text-lg mb-2 text-blue-700">Vehicle Information</h3>
                <div className="space-y-1">
                  <p>
                    <span className="font-medium">Vehicle:</span> {invoice?.vehicle || ""}
                  </p>
                  <p>
                    <span className="font-medium">Vehicle ID:</span> {invoice?.vehicle?.vehicleId || ""}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Services Table */}
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <h3 className="font-bold text-lg mb-3 text-blue-700">Services & Charges</h3>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="text-left p-2 border-b">Description</th>
                      <th className="text-center p-2 border-b">Quantity</th>
                      <th className="text-right p-2 border-b">Unit Price</th>
                      <th className="text-right p-2 border-b">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.services.map((service, index) => (
                      <tr key={service.id || index} className="border-b hover:bg-gray-50">
                        <td className="p-2">{service.description}</td>
                        <td className="p-2 text-center">{service.quantity}</td>
                        <td className="p-2 text-right">${service.unitPrice.toFixed(2)}</td>
                        <td className="p-2 text-right">${service.total.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-b bg-gray-50">
                      <td colSpan={3} className="p-2 text-right font-medium">
                        Subtotal
                      </td>
                      <td className="p-2 text-right">${invoice.subtotal.toFixed(2)}</td>
                    </tr>
                    <tr className="border-b bg-gray-50">
                      <td colSpan={3} className="p-2 text-right font-medium">
                        Tax
                      </td>
                      <td className="p-2 text-right">${invoice.tax.toFixed(2)}</td>
                    </tr>
                    <tr className="bg-blue-50">
                      <td colSpan={3} className="p-2 text-right font-bold">
                        Total
                      </td>
                      <td className="p-2 text-right font-bold">${invoice.amount.toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          {invoice.notes && (
            <Card className="shadow-sm">
              <CardContent className="p-4">
                <h3 className="font-bold text-lg mb-2 text-blue-700">Notes</h3>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-md">{invoice.notes}</p>
              </CardContent>
            </Card>
          )}

          {/* Footer */}
          <div className="text-center text-sm text-gray-500 mt-8 border-t pt-4">
            <p>Thank you for choosing AutoFix Workshop for your vehicle service needs.</p>
            <p>For any questions regarding this invoice, please contact us at support@autofixworkshop.com</p>
            <p className="mt-2">© {new Date().getFullYear()} AutoFix Workshop. All rights reserved.</p>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}

