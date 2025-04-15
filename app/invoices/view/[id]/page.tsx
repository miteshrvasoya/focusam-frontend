"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Printer, ArrowLeft } from "lucide-react"
import { LoadingSpinner } from "@/components/loading-spinner"
import { ErrorMessage } from "@/components/error-message"
import { invoicesApi, customersApi, vehiclesApi } from "@/lib/api"
import type { Invoice, Customer, Vehicle } from "@/types/api"
import Link from "next/link"

export default function CustomerInvoiceView({ params }: { params: { id: string } }) {
  const [invoice, setInvoice] = useState<any>(null)
  const [customer, setCustomer] = useState<Customer | null>(null)
  const [vehicle, setVehicle] = useState<Vehicle | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const printRef = useRef<HTMLDivElement>(null)

  const fetchData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      // Fetch invoice data
      const invoiceRes = await invoicesApi.getById(params.id)
      setInvoice(invoiceRes.data)

      // Fetch customer data
      const customerRes = await customersApi.getById(invoiceRes.data.customerId)
      setCustomer(customerRes.data)

      // Fetch vehicle data
      const vehicleRes = await vehiclesApi.getById(invoiceRes.data.vehicleId)
      setVehicle(vehicleRes.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load invoice details")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
  }, [params.id])

  const handlePrint = () => {
    const printContent = printRef.current
    if (!printContent) return

    const originalContents = document.body.innerHTML
    const printContents = printContent.innerHTML

    document.body.innerHTML = `
      <div style="padding: 20px;">
        <style>
          @media print {
            body { font-family: Arial, sans-serif; color: #000; }
            table { width: 100%; border-collapse: collapse; }
            th, td { padding: 8px; text-align: left; border-bottom: 1px solid #ddd; }
            th { font-weight: bold; }
            .text-right { text-align: right; }
            .text-center { text-align: center; }
            .font-bold { font-weight: bold; }
            .header { margin-bottom: 30px; }
            .footer { margin-top: 50px; font-size: 12px; }
          }
        </style>
        ${printContents}
      </div>
    `

    window.print()
    document.body.innerHTML = originalContents
    window.location.reload()
  }

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      paid: { label: "Paid", className: "bg-green-600" },
      pending: { label: "Pending", className: "bg-yellow-600" },
      overdue: { label: "Overdue", className: "bg-red-600" },
    }

    const statusInfo = statusMap[status] || { label: "Unknown", className: "" }
    return <Badge className={statusInfo.className}>{statusInfo.label}</Badge>
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
        <ErrorMessage message={error} onRetry={fetchData} />
      </div>
    )
  }

  if (!invoice || !customer || !vehicle) {
    return (
      <div className="p-6">
        <ErrorMessage message="Invoice information not found" onRetry={fetchData} />
      </div>
    )
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <Link href="/" className="text-primary hover:underline flex items-center">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Link>
        <Button onClick={handlePrint}>
          <Printer className="h-4 w-4 mr-2" />
          Print Invoice
        </Button>
      </div>

      <div ref={printRef}>
        <div className="header flex justify-between items-start mb-8">
          <div>
            <h1 className="text-3xl font-bold">AutoFix Workshop</h1>
            <p className="text-muted-foreground">Professional Auto Repair Services</p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold">Invoice #{invoice.id}</h2>
            <p>Date: {new Date(invoice.date).toLocaleDateString()}</p>
            <p>Due Date: {new Date(invoice.dueDate).toLocaleDateString()}</p>
            <div className="mt-2">{getStatusBadge(invoice.status)}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p>
                  <strong>Name:</strong> {customer.name}
                </p>
                <p>
                  <strong>Email:</strong> {customer.email}
                </p>
                <p>
                  <strong>Phone:</strong> {customer.phone}
                </p>
                <p>
                  <strong>Address:</strong> {customer.address}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Vehicle Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p>
                  <strong>Make & Model:</strong> {vehicle.make} {vehicle.model}
                </p>
                <p>
                  <strong>Year:</strong> {vehicle.year}
                </p>
                <p>
                  <strong>Registration:</strong> {vehicle.registration}
                </p>
                <p>
                  <strong>Color:</strong> {vehicle.color}
                </p>
                <p>
                  <strong>VIN:</strong> {vehicle.vin}
                </p>
                <p>
                  <strong>Odometer:</strong> {vehicle.odometer}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Services & Charges</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-md overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-3 text-left">Description</th>
                    <th className="px-4 py-3 text-center">Quantity</th>
                    <th className="px-4 py-3 text-right">Unit Price</th>
                    <th className="px-4 py-3 text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.services.map((service: any, index: number) => (
                    <tr key={service.id || index} className="border-b">
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
                    <td className="px-4 py-3 text-right font-bold">${invoice.invoice.amount.toFixed(2)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {invoice.notes && (
              <div className="mt-6">
                <h3 className="text-sm font-medium mb-2">Notes</h3>
                <p className="text-sm p-3 bg-muted rounded-md">{invoice.notes}</p>
              </div>
            )}
          </CardContent>
        </Card>

        <div className="footer text-center text-muted-foreground text-sm">
          <p>Thank you for choosing AutoFix Workshop for your vehicle service needs.</p>
          <p>For any questions regarding this invoice, please contact us at support@autofixworkshop.com</p>
        </div>
      </div>
    </div>
  )
}

