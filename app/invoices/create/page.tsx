"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { ArrowLeft, Plus, Trash2, Car, AlertCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ErrorMessage } from "@/components/error-message"
import { invoicesApi, customersApi, vehiclesApi } from "@/lib/api"
import { toast } from "@/components/ui/use-toast"
import type { Customer, Vehicle, CreateInvoiceDto, CreateVehicleDto, CreateCustomerDto } from "@/types/api"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Skeleton } from "@/components/ui/skeleton"

export default function CreateInvoicePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialCustomerId = searchParams.get("customerId")
  const initialVehicleId = searchParams.get("vehicleId")

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showAddVehicleDialog, setShowAddVehicleDialog] = useState(false)
  const [showAddCustomerDialog, setShowAddCustomerDialog] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  // Form data
  const [invoiceData, setInvoiceData] = useState<Partial<CreateInvoiceDto>>({
    services: [{ description: "", quantity: 1, unitPrice: 0, total: 0 }],
    date: new Date().toISOString().split("T")[0],
    dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // Default due date: 15 days from now
    status: "pending",
    paymentMethod: "credit",
    customerId: initialCustomerId || undefined,
    vehicleId: initialVehicleId || undefined,
  })

  // New vehicle form data
  const [newVehicle, setNewVehicle] = useState<Partial<CreateVehicleDto>>({
    make: "",
    model: "",
    year: "",
    registration: "",
    vin: "",
    color: "",
    fuelType: "petrol",
    odometer: "",
    status: "active",
  })

  // New customer form data
  const [newCustomer, setNewCustomer] = useState<Partial<CreateCustomerDto>>({
    name: "",
    email: "",
    phone: "",
    notes: ""
  })

  // API data
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(true)
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(true)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([])
  const [isAddingVehicle, setIsAddingVehicle] = useState(false)
  const [isAddingCustomer, setIsAddingCustomer] = useState(false)
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null)
  const [customerSearchTerm, setCustomerSearchTerm] = useState("")
  const [vehicleSearchTerm, setVehicleSearchTerm] = useState("")

  // Fetch customers and vehicles
  // useEffect(() => {
  //   const fetchInitialData = async () => {
  //     try {
  //       const customersRes = await customersApi.getAll(1, 100)
  //       setCustomers(customersRes.data.items)
  //       setIsLoadingCustomers(false)

  //       // If we have initialCustomerId, find the customer
  //       if (initialCustomerId) {
  //         const customer = customersRes.data.items.find((c) => c.id === initialCustomerId)
  //         if (customer) {
  //           setSelectedCustomer(customer)

  //           // Fetch vehicles for this customer
  //           try {
  //             const vehiclesRes = await vehiclesApi.getAll(1, 100, undefined, undefined, initialCustomerId)
  //             setVehicles(vehiclesRes.data.items)
  //             setFilteredVehicles(vehiclesRes.data.items)
  //             setIsLoadingVehicles(false)

  //             // If we have initialVehicleId, find the vehicle
  //             if (initialVehicleId) {
  //               const vehicle = vehiclesRes.data.items.find((v) => v.id === initialVehicleId)
  //               if (vehicle) {
  //                 setSelectedVehicle(vehicle)
  //               }
  //             }
  //           } catch (err) {
  //             console.error("Failed to load vehicles for customer:", err)
  //             setIsLoadingVehicles(false)
  //           }
  //         }
  //       } else {
  //         // Load all vehicles if no customer is selected
  //         try {
  //           const vehiclesRes = await vehiclesApi.getAll(1, 100)
  //           setVehicles(vehiclesRes.data.items)
  //           setIsLoadingVehicles(false)
  //         } catch (err) {
  //           console.error("Failed to load vehicles:", err)
  //           setIsLoadingVehicles(false)
  //         }
  //       }
  //     } catch (err) {
  //       console.error("Failed to load customers:", err)
  //       setIsLoadingCustomers(false)
  //       setError("Failed to load initial data. Please try again.")
  //     }
  //   }

  //   fetchInitialData()
  // }, [initialCustomerId, initialVehicleId, retryCount])

  // Filter vehicles by selected customer
  useEffect(() => {
    if (invoiceData.customerId) {
      const filtered = vehicles.filter((v) => v.ownerId === invoiceData.customerId)
      setFilteredVehicles(filtered)

      // Update new vehicle data with customer ID
      setNewVehicle((prev) => ({
        ...prev,
        ownerId: invoiceData.customerId,
      }))

      // Find the selected customer
      const customer = customers.find((c) => c.id === invoiceData.customerId)
      setSelectedCustomer(customer || null)
    } else {
      setFilteredVehicles([])
      setSelectedCustomer(null)
      setSelectedVehicle(null)
      setInvoiceData((prev) => ({ ...prev, vehicleId: undefined }))
    }
  }, [invoiceData.customerId, vehicles, customers])

  // Update selected vehicle when vehicleId changes
  useEffect(() => {
    if (invoiceData.vehicleId) {
      const vehicle = vehicles.find((v) => v.id === invoiceData.vehicleId)
      setSelectedVehicle(vehicle || null)
    } else {
      setSelectedVehicle(null)
    }
  }, [invoiceData.vehicleId, vehicles])

  // Filter customers by search term
  const filteredCustomers = customerSearchTerm
    ? customers.filter(
        (customer) =>
          customer.name.toLowerCase().includes(customerSearchTerm.toLowerCase()) ||
          customer.phone.includes(customerSearchTerm) ||
          customer.email.toLowerCase().includes(customerSearchTerm.toLowerCase()),
      )
    : customers

  // Filter vehicles by search term
  const searchFilteredVehicles = vehicleSearchTerm
    ? filteredVehicles.filter(
        (vehicle) =>
          vehicle.make.toLowerCase().includes(vehicleSearchTerm.toLowerCase()) ||
          vehicle.model.toLowerCase().includes(vehicleSearchTerm.toLowerCase()) ||
          vehicle.registration.toLowerCase().includes(vehicleSearchTerm.toLowerCase()),
      )
    : filteredVehicles

  const calculateTotal = (quantity: number, unitPrice: number) => {
    return quantity * unitPrice
  }

  const updateService = (index: number, field: string, value: string | number) => {
    const updatedServices = [...(invoiceData.services || [])]

    if (field === "quantity" || field === "unitPrice") {
      const numValue = typeof value === "string" ? Number.parseFloat(value) || 0 : value
      updatedServices[index] = {
        ...updatedServices[index],
        [field]: numValue,
        total:
          field === "quantity"
            ? calculateTotal(numValue, updatedServices[index].unitPrice)
            : calculateTotal(updatedServices[index].quantity, numValue),
      }
    } else {
      updatedServices[index] = {
        ...updatedServices[index],
        [field]: value,
      }
    }

    setInvoiceData({ ...invoiceData, services: updatedServices })
  }

  const addService = () => {
    setInvoiceData({
      ...invoiceData,
      services: [
        ...(invoiceData.services || []),
        {
          description: "",
          quantity: 1,
          unitPrice: 0,
          total: 0,
        },
      ],
    })
  }

  const removeService = (index: number) => {
    if ((invoiceData.services || []).length > 1) {
      const updatedServices = [...(invoiceData.services || [])]
      updatedServices.splice(index, 1)
      setInvoiceData({ ...invoiceData, services: updatedServices })
    }
  }

  const calculateSubtotal = () => {
    return (invoiceData.services || []).reduce((sum, service) => sum + (service.total || 0), 0)
  }

  const calculateTax = (subtotal: number) => {
    return subtotal * 0.075 // 7.5% tax rate
  }

  const updateFormField = (field: string, value: any) => {
    setInvoiceData({ ...invoiceData, [field]: value })
  }

  const updateNewVehicleField = (field: string, value: any) => {
    setNewVehicle({ ...newVehicle, [field]: value })
  }

  const updateNewCustomerField = (field: string, value: any) => {
    setNewCustomer({ ...newCustomer, [field]: value })
  }

  const handleAddNewCustomer = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsAddingCustomer(true)

    try {
      // Validate required fields
      if (!newCustomer.name || !newCustomer.email || !newCustomer.phone) {
        throw new Error("Please fill in all required customer fields")
      }

      // Create new customer
      const response = await customersApi.create(newCustomer as CreateCustomerDto)

      // Add new customer to the list and select it
      setCustomers([...customers, response.data])
      setInvoiceData({ ...invoiceData, customerId: response.data.id, vehicleId: undefined })
      setSelectedCustomer(response.data)

      // Reset form and close dialog
      setNewCustomer({
        name: "",
        email: "",
        phone: "",
      })

      setShowAddCustomerDialog(false)

      toast({
        title: "Success",
        description: "Customer added successfully",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to add customer",
        variant: "destructive",
      })
    } finally {
      setIsAddingCustomer(false)
    }
  }

  const handleAddNewVehicle = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!invoiceData.customerId) {
      toast({
        title: "Error",
        description: "Please select a customer first",
        variant: "destructive",
      })
      return
    }

    setIsAddingVehicle(true)
    try {
      // Validate required fields
      if (!newVehicle.make || !newVehicle.model || !newVehicle.year || !newVehicle.registration) {
        throw new Error("Please fill in all required vehicle fields")
      }

      // Create new vehicle
      const vehiclePayload: CreateVehicleDto = {
        make: newVehicle.make || "",
        model: newVehicle.model || "",
        year: newVehicle.year || "",
        registration: newVehicle.registration || "",
        vin: newVehicle.vin || "",
        color: newVehicle.color || "",
        fuelType: newVehicle.fuelType || "petrol",
        odometer: newVehicle.odometer || "",
        customerId: invoiceData.customerId,
        status: "active",
        notes: newVehicle.notes,
      }

      const response = await vehiclesApi.create(vehiclePayload)

      // Add new vehicle to the list and select it
      setVehicles([...vehicles, response.data])
      setFilteredVehicles([...filteredVehicles, response.data])
      setInvoiceData({ ...invoiceData, vehicleId: response.data.id })
      setSelectedVehicle(response.data)

      // Reset form and close dialog
      setNewVehicle({
        make: "",
        model: "",
        year: "",
        registration: "",
        vin: "",
        color: "",
        fuelType: "petrol",
        odometer: "",
        status: "active",
        customerId: invoiceData.customerId,
      })

      setShowAddVehicleDialog(false)

      toast({
        title: "Success",
        description: "Vehicle added successfully",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to add vehicle",
        variant: "destructive",
      })
    } finally {
      setIsAddingVehicle(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    const subtotal = calculateSubtotal()
    const tax = calculateTax(subtotal)

    try {
      if (!invoiceData.customerId) throw new Error("Customer is required")
      if (!invoiceData.vehicleId) throw new Error("Vehicle is required")
      if (!invoiceData.date) throw new Error("Date is required")
      if (!invoiceData.services || invoiceData.services.length === 0) {
        throw new Error("At least one service is required")
      }

      // Validate that services have descriptions and prices
      const invalidServices = invoiceData.services.filter((s) => !s.description || s.unitPrice <= 0)
      if (invalidServices.length > 0) {
        throw new Error("All services must have a description and a price greater than zero")
      }

      const payload: CreateInvoiceDto = {
        customerId: invoiceData.customerId,
        vehicleId: invoiceData.vehicleId,
        date: invoiceData.date,
        dueDate: invoiceData.dueDate || invoiceData.date,
        status: invoiceData.status as "paid" | "pending" | "overdue",
        paymentMethod: invoiceData.paymentMethod || "credit",
        notes: invoiceData.notes,
        services: invoiceData.services.map((s) => ({
          description: s.description,
          quantity: s.quantity,
          unitPrice: s.unitPrice,
          total: s.total,
        })),
        amount: invoiceData.amount || subtotal + tax,
      }

      await invoicesApi.create(payload)
      toast({
        title: "Success",
        description: "Invoice created successfully",
      })
      router.push("/invoices")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create invoice")
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to create invoice",
        variant: "destructive",
      })
      setIsSubmitting(false)
    }
  }

  const subtotal = calculateSubtotal()
  const tax = calculateTax(subtotal)
  const total = subtotal + tax

  // Render loading skeleton
  const renderLoadingSkeleton = () => (
    <div className="space-y-4">
      <Skeleton className="h-10 w-full" />
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
      <Skeleton className="h-20 w-full" />
    </div>
  )

  // Render error state with retry button
  const renderErrorState = () => (
    <div className="flex flex-col items-center justify-center py-8">
      <div className="rounded-full bg-destructive/10 p-3 mb-4">
        <AlertCircle className="h-6 w-6 text-destructive" />
      </div>
      <h3 className="text-lg font-medium mb-2">Failed to load data</h3>
      <p className="text-muted-foreground mb-4 text-center max-w-md">
        We couldn't load the necessary data to create an invoice. Please try again.
      </p>
      <Button onClick={() => setRetryCount((prev) => prev + 1)}>Retry</Button>
    </div>
  )

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
          <h1 className="text-3xl font-bold">Create New Invoice</h1>
        </div>
        <p className="text-muted-foreground">Fill in the details to create a new invoice</p>
      </div>

      {error && (
        <div className="mb-6">
          <ErrorMessage message={error} onRetry={() => setError(null)} />
        </div>
      )}

      {(isLoadingCustomers || isLoadingVehicles) && !error ? (
        <Card>
          <CardHeader>
            <CardTitle>Loading Invoice Form</CardTitle>
          </CardHeader>
          <CardContent>{renderLoadingSkeleton()}</CardContent>
        </Card>
      ) : error && (!customers.length || !vehicles.length) ? (
        <Card>
          <CardContent className="py-8">{renderErrorState()}</CardContent>
        </Card>
      ) : (
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Invoice Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="customerId">Customer</Label>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <div className="relative">
                            <Input
                              placeholder="Search customers..."
                              className="mb-2"
                              value={customerSearchTerm}
                              onChange={(e) => setCustomerSearchTerm(e.target.value)}
                            />
                            <Select
                              value={invoiceData.customerId}
                              onValueChange={(value) => updateFormField("customerId", value)}
                              required
                            >
                              <SelectTrigger id="customerId">
                                <SelectValue placeholder="Select customer" />
                              </SelectTrigger>
                              <SelectContent>
                                {filteredCustomers.length > 0 ? (
                                  filteredCustomers.map((customer) => (
                                    <SelectItem key={customer.id} value={customer.id}>
                                      {customer.name}
                                    </SelectItem>
                                  ))
                                ) : (
                                  <div className="p-2 text-center text-sm text-muted-foreground">
                                    No customers found
                                  </div>
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <Dialog open={showAddCustomerDialog} onOpenChange={setShowAddCustomerDialog}>
                          <DialogTrigger asChild>
                            <Button type="button" variant="outline" size="icon" title="Add New Customer">
                              <Plus className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[500px]">
                            <form onSubmit={handleAddNewCustomer}>
                              <DialogHeader>
                                <DialogTitle>Add New Customer</DialogTitle>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="name">Name *</Label>
                                    <Input
                                      id="name"
                                      value={newCustomer.name || ""}
                                      onChange={(e) => updateNewCustomerField("name", e.target.value)}
                                      required
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="phone">Phone *</Label>
                                    <Input
                                      id="phone"
                                      value={newCustomer.phone || ""}
                                      onChange={(e) => updateNewCustomerField("phone", e.target.value)}
                                      required
                                    />
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="email">Email *</Label>
                                  <Input
                                    id="email"
                                    type="email"
                                    value={newCustomer.email || ""}
                                    onChange={(e) => updateNewCustomerField("email", e.target.value)}
                                    required
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="address">Address</Label>
                                  <Input
                                    id="address"
                                    value={newCustomer.address || ""}
                                    onChange={(e) => updateNewCustomerField("address", e.target.value)}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="notes">Notes</Label>
                                  <Textarea
                                    id="notes"
                                    value={newCustomer.notes || ""}
                                    onChange={(e) => updateNewCustomerField("notes", e.target.value)}
                                    placeholder="Any additional information about the customer"
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setShowAddCustomerDialog(false)}>
                                  Cancel
                                </Button>
                                <Button type="submit" disabled={isAddingCustomer}>
                                  {isAddingCustomer ? "Adding..." : "Add Customer"}
                                </Button>
                              </DialogFooter>
                            </form>
                          </DialogContent>
                        </Dialog>
                      </div>

                      {selectedCustomer && (
                        <div className="mt-2 p-3 bg-muted/50 rounded-md">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                              <AvatarFallback className="bg-primary text-primary-foreground">
                                {selectedCustomer.name.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <div className="font-medium">{selectedCustomer.name}</div>
                              <div className="text-sm text-muted-foreground flex gap-2">
                                <span>{selectedCustomer.phone}</span>
                                <span>•</span>
                                <span>{selectedCustomer.email}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="vehicleId">Vehicle</Label>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <div className="relative">
                            <Input
                              placeholder="Search vehicles..."
                              className="mb-2"
                              value={vehicleSearchTerm}
                              onChange={(e) => setVehicleSearchTerm(e.target.value)}
                              disabled={!invoiceData.customerId}
                            />
                            <Select
                              value={invoiceData.vehicleId}
                              onValueChange={(value) => updateFormField("vehicleId", value)}
                              disabled={!invoiceData.customerId}
                              required
                            >
                              <SelectTrigger id="vehicleId">
                                <SelectValue
                                  placeholder={invoiceData.customerId ? "Select vehicle" : "Select customer first"}
                                />
                              </SelectTrigger>
                              <SelectContent>
                                {searchFilteredVehicles.length > 0 ? (
                                  searchFilteredVehicles.map((vehicle) => (
                                    <SelectItem key={vehicle.id} value={vehicle.id}>
                                      {vehicle.make} {vehicle.model} ({vehicle.year})
                                    </SelectItem>
                                  ))
                                ) : (
                                  <div className="p-2 text-center text-sm text-muted-foreground">
                                    {invoiceData.customerId
                                      ? "No vehicles found for this customer"
                                      : "Select a customer first"}
                                  </div>
                                )}
                              </SelectContent>
                            </Select>
                          </div>
                        </div>

                        <Dialog open={showAddVehicleDialog} onOpenChange={setShowAddVehicleDialog}>
                          <DialogTrigger asChild>
                            <Button
                              type="button"
                              variant="outline"
                              size="icon"
                              disabled={!invoiceData.customerId}
                              title="Add New Vehicle"
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[500px]">
                            <form onSubmit={handleAddNewVehicle}>
                              <DialogHeader>
                                <DialogTitle>Add New Vehicle</DialogTitle>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="make">Make *</Label>
                                    <Input
                                      id="make"
                                      value={newVehicle.make || ""}
                                      onChange={(e) => updateNewVehicleField("make", e.target.value)}
                                      required
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="model">Model *</Label>
                                    <Input
                                      id="model"
                                      value={newVehicle.model || ""}
                                      onChange={(e) => updateNewVehicleField("model", e.target.value)}
                                      required
                                    />
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="year">Year *</Label>
                                    <Input
                                      id="year"
                                      value={newVehicle.year || ""}
                                      onChange={(e) => updateNewVehicleField("year", e.target.value)}
                                      required
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="registration">Registration *</Label>
                                    <Input
                                      id="registration"
                                      value={newVehicle.registration || ""}
                                      onChange={(e) => updateNewVehicleField("registration", e.target.value)}
                                      required
                                    />
                                  </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                  <div className="space-y-2">
                                    <Label htmlFor="color">Color</Label>
                                    <Input
                                      id="color"
                                      value={newVehicle.color || ""}
                                      onChange={(e) => updateNewVehicleField("color", e.target.value)}
                                    />
                                  </div>
                                  <div className="space-y-2">
                                    <Label htmlFor="fuelType">Fuel Type</Label>
                                    <Select
                                      name="fuelType"
                                      value={newVehicle.fuelType}
                                      onValueChange={(value) => updateNewVehicleField("fuelType", value)}
                                    >
                                      <SelectTrigger id="fuelType">
                                        <SelectValue placeholder="Select fuel type" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="petrol">Petrol</SelectItem>
                                        <SelectItem value="diesel">Diesel</SelectItem>
                                        <SelectItem value="electric">Electric</SelectItem>
                                        <SelectItem value="hybrid">Hybrid</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="vin">VIN</Label>
                                  <Input
                                    id="vin"
                                    value={newVehicle.vin || ""}
                                    onChange={(e) => updateNewVehicleField("vin", e.target.value)}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="odometer">Odometer Reading</Label>
                                  <Input
                                    id="odometer"
                                    value={newVehicle.odometer || ""}
                                    onChange={(e) => updateNewVehicleField("odometer", e.target.value)}
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label htmlFor="notes">Notes</Label>
                                  <Textarea
                                    id="notes"
                                    value={newVehicle.notes || ""}
                                    onChange={(e) => updateNewVehicleField("notes", e.target.value)}
                                    placeholder="Any additional information about the vehicle"
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <Button type="button" variant="outline" onClick={() => setShowAddVehicleDialog(false)}>
                                  Cancel
                                </Button>
                                <Button type="submit" disabled={isAddingVehicle}>
                                  {isAddingVehicle ? "Adding..." : "Add Vehicle"}
                                </Button>
                              </DialogFooter>
                            </form>
                          </DialogContent>
                        </Dialog>
                      </div>

                      {selectedVehicle && (
                        <div className="mt-2 p-3 bg-muted/50 rounded-md">
                          <div className="flex items-center gap-3">
                            <div className="h-8 w-8 bg-primary/10 rounded-full flex items-center justify-center">
                              <Car className="h-4 w-4 text-primary" />
                            </div>
                            <div>
                              <div className="font-medium">
                                {selectedVehicle.make} {selectedVehicle.model} ({selectedVehicle.year})
                              </div>
                              <div className="text-sm text-muted-foreground flex gap-2">
                                <span>Reg: {selectedVehicle.registration}</span>
                                {selectedVehicle.color && (
                                  <>
                                    <span>•</span>
                                    <span>Color: {selectedVehicle.color}</span>
                                  </>
                                )}
                                {selectedVehicle.fuelType && (
                                  <>
                                    <span>•</span>
                                    <span>Fuel: {selectedVehicle.fuelType}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {invoiceData.customerId && filteredVehicles.length === 0 && (
                        <div className="mt-2 p-3 bg-yellow-50 dark:bg-yellow-950/20 text-yellow-800 dark:text-yellow-300 rounded-md text-sm">
                          No vehicles found for this customer. Add a vehicle using the + button.
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="date">Invoice Date</Label>
                      <Input
                        id="date"
                        type="date"
                        value={invoiceData.date}
                        onChange={(e) => updateFormField("date", e.target.value)}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dueDate">Due Date</Label>
                      <Input
                        id="dueDate"
                        type="date"
                        value={invoiceData.dueDate}
                        onChange={(e) => updateFormField("dueDate", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="status">Status</Label>
                      <Select value={invoiceData.status} onValueChange={(value) => updateFormField("status", value)}>
                        <SelectTrigger id="status">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="overdue">Overdue</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="paymentMethod">Payment Method</Label>
                      <Select
                        value={invoiceData.paymentMethod}
                        onValueChange={(value) => updateFormField("paymentMethod", value)}
                      >
                        <SelectTrigger id="paymentMethod">
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="credit">Credit Card</SelectItem>
                          <SelectItem value="debit">Debit Card</SelectItem>
                          <SelectItem value="cash">Cash</SelectItem>
                          <SelectItem value="bank">Bank Transfer</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      placeholder="Additional notes or comments"
                      value={invoiceData.notes || ""}
                      onChange={(e) => updateFormField("notes", e.target.value)}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle>Services</CardTitle>
                  <Button type="button" variant="outline" size="sm" onClick={addService}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Service
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {(invoiceData.services || []).map((service, index) => (
                      <div key={index} className="grid grid-cols-12 gap-2 items-end">
                        <div className="col-span-5 space-y-2">
                          <Label htmlFor={`service-${index}-desc`}>Description</Label>
                          <Input
                            id={`service-${index}-desc`}
                            value={service.description}
                            onChange={(e) => updateService(index, "description", e.target.value)}
                            placeholder="Oil Change"
                            required
                          />
                        </div>
                        <div className="col-span-2 space-y-2">
                          <Label htmlFor={`service-${index}-qty`}>Qty</Label>
                          <Input
                            id={`service-${index}-qty`}
                            type="number"
                            min="1"
                            value={service.quantity}
                            onChange={(e) => updateService(index, "quantity", e.target.value)}
                            required
                          />
                        </div>
                        <div className="col-span-2 space-y-2">
                          <Label htmlFor={`service-${index}-price`}>Price</Label>
                          <Input
                            id={`service-${index}-price`}
                            type="number"
                            min="0"
                            step="0.01"
                            value={service.unitPrice}
                            onChange={(e) => updateService(index, "unitPrice", e.target.value)}
                            required
                          />
                        </div>
                        <div className="col-span-2 space-y-2">
                          <Label htmlFor={`service-${index}-total`}>Total</Label>
                          <Input id={`service-${index}-total`} value={service.total?.toFixed(2) || "0.00"} readOnly />
                        </div>
                        <div className="col-span-1">
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={() => removeService(index)}
                            disabled={(invoiceData.services || []).length === 1}
                          >
                            <Trash2 className="h-4 w-4" />
                            <span className="sr-only">Remove</span>
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium">Subtotal:</span>
                      <span>${subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Tax (7.5%):</span>
                      <span>${tax.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold">
                      <span>Total:</span>
                      <span>${total.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="mt-6 flex justify-end gap-4">
            <Button variant="outline" type="button" asChild>
              <Link href="/invoices">Cancel</Link>
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Creating..." : "Create Invoice"}
            </Button>
          </div>
        </form>
      )}
    </div>
  )
}
