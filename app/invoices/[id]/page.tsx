"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Download, Printer, Edit, Share2 } from "lucide-react"
import Link from "next/link"
import { LoadingSpinner } from "@/components/loading-spinner"
import { ErrorMessage } from "@/components/error-message"
import { invoicesApi } from "@/lib/api"
import type { Invoice } from "@/types/api"
import { useParams } from "next/navigation"
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { toast } from "@/components/ui/use-toast"


export default function InvoiceDetailPage() {
  const [invoice, setInvoice] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [isSharing, setIsSharing] = useState(false)

  const params = useParams();  // Correctly use useParams()
  const invoiceId = params?.id as string; // Ensure it's properly accessed

  useEffect(() => {
    if (invoiceId) {
      fetchInvoice();
    }
  }, [invoiceId]); // Use invoiceId instead of params.id

  const fetchInvoice = async () => {
    try {
      const response = await invoicesApi.getById(params.id as string);
      let data = response;
      console.log("Data: ", data.data);
      if (data.success) {
        setInvoice(data.data);
        setIsLoading(false);
      }
    } catch (error) {
      console.error("Error fetching invoice:", error);
    }
  };

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


  const handleShareInvoice = async () => {

    console.log("Invoice :", invoice);

    if (!invoice) return

    setIsSharing(true)
    try {
      // Generate a shareable link
      const shareableLink = `${window.location.origin}/public/invoice/${invoice.invoice._id}`

      // Create WhatsApp share link with invoice details
      const message = `Hello! Here's your invoice #${invoice.id} from AutoFix Workshop for ${invoice.vehicle} servicing. Total amount: $${invoice.invoice.amount.toFixed(2)}. View your invoice here: ${shareableLink}`
      const whatsappLink = `https://wa.me/?text=${encodeURIComponent(message)}`

      console.log("WhatsApp Link:", whatsappLink);

      // Open WhatsApp in a new tab
      window.open(whatsappLink, "_blank")

      // Copy link to clipboard
      await navigator.clipboard.writeText(shareableLink)
      toast({
        title: "Link copied to clipboard",
        description: "You can now paste and share the invoice link",
      })
    } catch (err) {
      console.log("err : ", err);
      toast({
        title: "Error sharing invoice",
        description: "Failed to share the invoice. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSharing(false)
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
    return <p className="text-center text-gray-500">No invoice found.</p>;
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
          <h1 className="text-3xl font-bold" ref={invoiceRef}>Invoice {invoice.id}</h1>
          {getStatusBadge(invoice.invoice.status)}
        </div>
        <p className="text-muted-foreground">Created on {new Date(invoice.invoice.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</p>
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
                  <p className="text-lg font-medium">{invoice.invoice.id}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Payment Method</h3>
                  <p className="text-lg font-medium">{invoice.invoice.paymentMethod}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Created Date</h3>
                  <p className="text-lg font-medium">{new Date(invoice.invoice.date).toLocaleDateString('en-UK')}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Due Date</h3>
                  <p className="text-lg font-medium">{new Date(invoice.invoice.dueDate).toLocaleDateString('en-UK')}</p>
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
                    {invoice.invoice.services.map((service: any, index: number) => (
                      <tr key={service.id || index} className="border-b">
                        <td className="px-4 py-3 text-left">{service.description}</td>
                        <td className="px-4 py-3 text-center">{service.quantity}</td>
                        <td className="px-4 py-3 text-right">{service.unitPrice}</td>
                        <td className="px-4 py-3 text-right">{service.total}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-b">
                      <td colSpan={3} className="px-4 py-3 text-right font-medium">
                        Subtotal
                      </td>
                      <td className="px-4 py-3 text-right">{invoice.invoice.amount.toFixed(2)}</td>
                    </tr>
                    <tr className="border-b">
                      <td colSpan={3} className="px-4 py-3 text-right font-medium">
                        Tax
                      </td>
                      <td className="px-4 py-3 text-right">${invoice.invoice.tax?.toFixed(2) || 0}</td>
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
              <Button onClick={handleShareInvoice} disabled={isSharing}>
                <Share2 className={`h-4 w-4 mr-2 ${isSharing ? "animate-spin" : ""}`} />
                {isSharing ? "Sharing..." : "Share Invoice"}
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
                  {/* <h3 className="text-sm font-medium text-muted-foreground">Customer ID</h3> */}
                  {/* <p className="text-lg font-medium">{invoice.customerId}</p> */}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Name</h3>
                  <p className="text-lg font-medium">{invoice.customer.name}</p>
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
                  {/* <h3 className="text-sm font-medium text-muted-foreground">Vehicle ID</h3> */}
                  {/* <p className="text-lg font-medium">{invoice.vehicleId}</p> */}
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Make | Model | Year</h3>
                  <p className="text-lg font-medium">{invoice.vehicle.make} | {invoice.vehicle.model} | {invoice.vehicle.year}</p>
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

