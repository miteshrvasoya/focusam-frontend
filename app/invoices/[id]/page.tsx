"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Download, Printer, Edit } from "lucide-react"
import Link from "next/link"
import { LoadingSpinner } from "@/components/loading-spinner"
import { ErrorMessage } from "@/components/error-message"
import { invoicesApi } from "@/lib/api"
import type { Invoice } from "@/types/api"

export default function InvoiceDetailPage({ params }: { params: { id: string } }) {
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchInvoice = async () => {
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
    fetchInvoice()
  }, [params.id])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return <Badge className="bg-green-600">Paid</Badge>
      case "pending":
        return <Badge className="bg-yellow-600">Pending</Badge>
      case "overdue":
        return <Badge className="bg-red-600">Overdue</Badge>
      default:
        return <Badge>Unknown</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="p-6">
        <LoadingSpinner />
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6">
        <ErrorMessage message={error} onRetry={fetchInvoice} />
      </div>
    )
  }

  if (!invoice) {
    return null
  }

  return (
    <div className="p-6">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/invoices">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Invoice {invoice.id}</h1>
          {getStatusBadge(invoice.status)}
        </div>
        <p className="text-muted-foreground">Created on {new Date(invoice.createdAt).toLocaleDateString()}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Invoice Number</h3>
                  <p className="text-lg font-medium">{invoice.id}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Payment Method</h3>
                  <p className="text-lg font-medium">{invoice.paymentMethod}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Created Date</h3>
                  <p className="text-lg font-medium">{new Date(invoice.date).toLocaleDateString()}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Due Date</h3>
                  <p className="text-lg font-medium">{new Date(invoice.dueDate).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="border rounded-md">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-3 text-left">Description</th>
                      <th className="px-4 py-3 text-center">Quantity</th>
                      <th className="px-4 py-3 text-right">Unit Price</th>
                      <th className="px-4 py-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoice.services.map((service) => (
                      <tr key={service.id} className="border-b">
                        <td className="px-4 py-3">{service.description}</td>
                        <td className="px-4 py-3 text-center">{service.quantity}</td>
                        <td className="px-4 py-3 text-right">${service.unitPrice.toFixed(2)}</td>
                        <td className="px-4 py-3 text-right">${service.total.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-b">
                      <td colSpan={3} className="px-4 py-3 text-right font-medium">
                        Subtotal
                      </td>
                      <td className="px-4 py-3 text-right">${invoice.subtotal.toFixed(2)}</td>
                    </tr>
                    <tr className="border-b">
                      <td colSpan={3} className="px-4 py-3 text-right font-medium">
                        Tax
                      </td>
                      <td className="px-4 py-3 text-right">${invoice.tax.toFixed(2)}</td>
                    </tr>
                    <tr>
                      <td colSpan={3} className="px-4 py-3 text-right font-bold">
                        Total
                      </td>
                      <td className="px-4 py-3 text-right font-bold">${invoice.amount.toFixed(2)}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>

              {invoice.notes && (
                <div className="mt-6">
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Notes</h3>
                  <p className="text-sm p-3 bg-muted rounded-md">{invoice.notes}</p>
                </div>
              )}
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button variant="outline" asChild>
                <Link href={`/invoices/${invoice.id}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Invoice
                </Link>
              </Button>
              <div className="flex gap-2">
                <Button variant="outline">
                  <Printer className="h-4 w-4 mr-2" />
                  Print
                </Button>
                <Button>
                  <Download className="h-4 w-4 mr-2" />
                  Download PDF
                </Button>
              </div>
            </CardFooter>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Customer ID</h3>
                  <p className="text-lg font-medium">{invoice.customerId}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Name</h3>
                  <p className="text-lg font-medium">{invoice.customer}</p>
                </div>
                <Button variant="outline" className="w-full mt-4" asChild>
                  <Link href={`/customers/${invoice.customerId}`}>View Customer Details</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Vehicle Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Vehicle ID</h3>
                  <p className="text-lg font-medium">{invoice.vehicleId}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Make & Model</h3>
                  <p className="text-lg font-medium">{invoice.vehicle}</p>
                </div>
                <Button variant="outline" className="w-full mt-4" asChild>
                  <Link href={`/vehicles/${invoice.vehicleId}`}>View Vehicle Details</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

