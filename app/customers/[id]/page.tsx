"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, Edit, Car, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/loading-spinner"
import { ErrorMessage } from "@/components/error-message"
import { customersApi } from "@/lib/api"
import type { Customer } from "@/types/api"
import { useParams } from "next/navigation"

export default function CustomerDetailPage() {
  const [customer, setCustomer] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  let params = useParams();
  let customerId = params.id as string;

  const fetchCustomer = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await customersApi.getById(customerId)
      setCustomer(response.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load customer details")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomer()
  }, [customerId])

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
        <ErrorMessage message={error} onRetry={fetchCustomer} />
      </div>
    )
  }

  if (!customer) {
    return null
  }

  return (
    <div className="p-6">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/customers">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">{customer.customer.name}</h1>
        </div>
        <p className="text-muted-foreground">Customer ID: {customer.customer.customer_id}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                  <p className="text-lg font-medium">{customer.customer.email}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Phone</h3>
                  <p className="text-lg font-medium">{customer.customer.phone}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Address</h3>
                  <p className="text-lg font-medium">{customer.customer.address}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Customer Since</h3>
                  <p className="text-lg font-medium">{new Date(customer.customer.createdAt).toLocaleDateString('en-UK')}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/customers/${customer.customer.id}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Customer
                </Link>
              </Button>
            </CardFooter>
          </Card>

          {customer.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Notes</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm">{customer.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Vehicles</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/vehicles/create?customerId=${customer.id}`}>
                  <Car className="h-4 w-4 mr-2" />
                  Add Vehicle
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div key={customer.customer._id} className="space-y-4">
                {customer.vehicles.length > 0 ? (
                  customer.vehicles.map((vehicle: any, index: number) => (
                    <div key={vehicle.id || index} className="border rounded-md p-4">
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-semibold">
                          {vehicle.make} {vehicle.model} ({vehicle.year})
                        </h3>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href={`/vehicles/${vehicle.id}`}>View Details</Link>
                        </Button>
                      </div>
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                          <span className="text-muted-foreground">Registration: </span>
                          {vehicle.registration}
                        </div>
                        <div>
                          <span className="text-muted-foreground">Last Service: </span>
                          {new Date(vehicle.lastServiceDate).toLocaleDateString('en-UK')}
                        </div>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-4 text-muted-foreground">No vehicles found for this customer</div>
                )}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Invoice History</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href={`/invoices/create?customerId=${customer.id}`}>
                  <FileText className="h-4 w-4 mr-2" />
                  New Invoice
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              {customer.invoices.length > 0 ? (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Invoice #</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Vehicle</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customer.invoices.map((invoice: any, index: number) => (
                        <TableRow key={invoice.id || index}>
                          <TableCell className="font-medium">{invoice.id}</TableCell>
                          <TableCell>{new Date(invoice.date).toLocaleDateString('en-UK')}</TableCell>
                          <TableCell>{invoice.vehicle}</TableCell>
                          <TableCell>${invoice.amount.toFixed(2)}</TableCell>
                          <TableCell>
                            <Badge
                              className={
                                invoice.status === "paid"
                                  ? "bg-green-600"
                                  : invoice.status === "pending"
                                    ? "bg-yellow-600"
                                    : "bg-red-600"
                              }
                            >
                              {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/invoices/${invoice.id}`}>View</Link>
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              ) : (
                <div className="text-center py-4 text-muted-foreground">No invoices found for this customer</div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

