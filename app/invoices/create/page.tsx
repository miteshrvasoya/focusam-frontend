"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LoadingSpinner } from "@/components/loading-spinner"
import { ErrorMessage } from "@/components/error-message"
import { invoicesApi, customersApi, vehiclesApi } from "@/lib/api"
import type { Customer, Vehicle, CreateInvoiceDto } from "@/types/api"

export default function CreateInvoicePage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Form data
  const [invoiceData, setInvoiceData] = useState<Partial<CreateInvoiceDto>>({
    services: [{ description: "", quantity: 1, unitPrice: 0, total: 0 }],
    date: new Date().toISOString().split("T")[0],
    status: "pending",
    paymentMethod: "credit",
  })

  // API data
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false)
  const [isLoadingVehicles, setIsLoadingVehicles] = useState(false)
  const [customers, setCustomers] = useState<any>({})
  const [selectedCustomer, setSelectedCustomer] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState("");
  const [vehicles, setVehicles] = useState<any>([])
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([])
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");
  const [showAddCustomerModal, setShowAddCustomerModal] = useState(false);
  const [newCustomer, setNewCustomer] = useState({ name: "", phone: "", email: "" });
  const [showAddVehicleModal, setShowAddVehicleModal] = useState(false);
  const [newVehicle, setNewVehicle] = useState({ make: "", model: "", year: "", plateNumber: "" });


  // Fetch customers and vehicles
  // useEffect(() => {
  //   const fetchInitialData = async () => {
  //     try {
  //       const customersRes = await customersApi.getAll(1, 100)
  //       setCustomers(customersRes.data.items)
  //       setIsLoadingCustomers(false)

  //       const vehiclesRes = await vehiclesApi.getAll(1, 100)
  //       setVehicles(vehiclesRes.data.items)
  //       setIsLoadingVehicles(false)
  //     } catch (err) {
  //       setError(err instanceof Error ? err.message : "Failed to load initial data")
  //       setIsLoadingCustomers(false)
  //       setIsLoadingVehicles(false)
  //     }
  //   }

  //   fetchInitialData()
  // }, [])

  // Filter vehicles by selected customer
  useEffect(() => {
    if (invoiceData.customerId) {
      const filtered = vehicles.filter((v) => v.ownerId === invoiceData.customerId)
      setFilteredVehicles(filtered)
    } else {
      setFilteredVehicles([])
    }
  }, [invoiceData.customerId, vehicles])

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
    console.log("Value:", value);

    if (field == 'customerId') setSelectedCustomer(value);
    if (field == 'vehicleId') setSelectedVehicle(value);

    setInvoiceData({ ...invoiceData, [field]: value });
    console.log("Selected Customer:", selectedCustomer);
    console.log("Selected Vehicle:", selectedVehicle);
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
        amount: total
      }

      await invoicesApi.create(payload)
      router.push("/invoices")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create invoice")
      setIsSubmitting(false)
    }
  }

  // Debounce Effect: Calls API 500ms after user stops typing
  useEffect(() => {
    if (customerSearchTerm.length >= 4) {
      const fetchCustomers = async () => {
        setIsLoadingCustomers(true);
        try {
          const response = await customersApi.searchByMobileNo(customerSearchTerm);
          const data: any = response.data;

          console.log("Response: ", response);

          console.log("data :", data);
          if (response.success) {
            setCustomers({ ...data });
            console.log("Customers :", customers);
          }
        } catch (error) {
          console.error("Error fetching customers:", error);
        }
        setIsLoadingCustomers(false);
      };

      const timer = setTimeout(fetchCustomers, 500);
      return () => clearTimeout(timer);
    }
  }, [customerSearchTerm]);

  // Debounce Effect: Calls API 500ms after user stops typing
  useEffect(() => {
    if (selectedCustomer != "") {
      const fetchVehicles = async () => {
        setIsLoadingVehicles(true);
        try {
          const response = await vehiclesApi.getByCustomerId(selectedCustomer);
          const data: any = response.data;

          console.log("Response: ", response);

          console.log("data :", data);
          if (response.success) {
            setVehicles([...data]);
            console.log("Vehicles :", vehicles);
          }
          setIsLoadingVehicles(false);
        } catch (error) {
          console.error("Error fetching Vehicles:", error);
        }
        setIsLoadingVehicles(false);
      };

      const timer = setTimeout(fetchVehicles, 500);
      return () => clearTimeout(timer);
    }
  }, [selectedCustomer]);

  useEffect(() => {
    console.log("New Vehicles: ", vehicles)
  }, [vehicles])

  // Function to add new customer
  const handleAddCustomer = async () => {
    const response = await customersApi.create(newCustomer);

    if (response.success) {
      let data = response.data;
      setCustomers({ ...data });
      updateFormField("customerId", data.id); // Auto-select new customer
      setShowAddCustomerModal(false);
    }
  };

  // Function to add new vehicle
  const handleAddVehicle = async () => {
    fetch("/api/vehicles", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...newVehicle, customerId: invoiceData.customerId }),
    })
      .then((res) => res.json())
      .then((data) => {
        setVehicles([...vehicles, data]);
        updateFormField("vehicleId", data.id); // Auto-select new vehicle
        setShowAddVehicleModal(false);
      });

      const response = await customersApi.create(newCustomer);

    if (response.success) {
      let data = response.data;
      setVehicles([...vehicles, data]);
        updateFormField("vehicleId", data.id); // Auto-select new vehicle
        setShowAddVehicleModal(false);
    }
  };

  const subtotal = calculateSubtotal()
  const tax = calculateTax(subtotal)
  const total = subtotal + tax

  if (isLoadingVehicles) {
    return (
      <div className="p-6">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" size="icon" asChild>
            <Link href="/invoices">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">Create New Invoice</h1>
        </div>
        <LoadingSpinner />
      </div>
    )
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
          <h1 className="text-3xl font-bold">Create New Invoice</h1>
        </div>
        <p className="text-muted-foreground">Fill in the details to create a new invoice</p>
      </div>

      {error && (
        <div className="mb-6">
          <ErrorMessage message={error} />
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Invoice Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="customerSearch">Search Customer by Mobile No.</Label>
                    <Input
                      id="customerSearch"
                      placeholder="Enter mobile number..."
                      value={customerSearchTerm}
                      onChange={(e) => setCustomerSearchTerm(e.target.value)}
                    />

                    <Label htmlFor="customerId">Select Customer</Label>
                    <Select value={invoiceData.customerId} onValueChange={(value) => updateFormField("customerId", value)} required>
                      <SelectTrigger id="customerId">
                        <SelectValue placeholder={isLoadingCustomers ? "Loading..." : "Select customer"} />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.keys(customers).length ? (
                          <SelectItem key={customers.id} value={customers.id}>
                            {customers.name}
                          </SelectItem>
                        ) : (
                          <div className="p-2 text-gray-500">
                            No customers found
                            <Button variant="link" className="text-blue-500" onClick={() => setShowAddCustomerModal(true)}>
                              Add New Customer
                            </Button>
                          </div>
                        )}
                      </SelectContent>
                    </Select>

                    {/* Add Customer Modal */}
                    <Dialog open={showAddCustomerModal} onOpenChange={setShowAddCustomerModal}>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add New Customer</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-3">
                          <Input placeholder="Name" value={newCustomer.name} onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })} />
                          <Input placeholder="Phone" value={newCustomer.phone} onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })} />
                          <Input placeholder="Email" value={newCustomer.email} onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })} />
                        </div>
                        <DialogFooter>
                          <Button onClick={handleAddCustomer}>Save</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vehicleId">Vehicle</Label>
                    <Select
                      value={invoiceData.vehicleId || ""}
                      onValueChange={(value) => updateFormField("vehicleId", value)}
                      required
                    >
                      <SelectTrigger id="vehicleId">
                        <SelectValue placeholder={invoiceData.customerId ? "Select vehicle" : "Select customer first"} />
                      </SelectTrigger>
                      <SelectContent>
                        {vehicles.length > 0 ? (
                          vehicles.map((vehicle: any) => (
                            <SelectItem key={vehicle.id} value={vehicle.id}>
                              {vehicle.make} {vehicle.model} ({vehicle.year})
                            </SelectItem>
                          ))
                        ) : (
                          <div className="p-2 text-gray-500">
                            No Vehicles found
                            <Button variant="link" className="text-blue-500" onClick={() => setShowAddVehicleModal(true)}>
                              Add New Vehicle
                            </Button>
                          </div>
                        )}
                      </SelectContent>
                    </Select>

                    {/* Add Vehicle Modal */}
                    <Dialog open={showAddVehicleModal} onOpenChange={setShowAddVehicleModal}>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Add New Vehicle</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-3">
                          <Input placeholder="Make" value={newVehicle.make} onChange={(e) => setNewVehicle({ ...newVehicle, make: e.target.value })} />
                          <Input placeholder="Model" value={newVehicle.model} onChange={(e) => setNewVehicle({ ...newVehicle, model: e.target.value })} />
                          <Input placeholder="Year" value={newVehicle.year} onChange={(e) => setNewVehicle({ ...newVehicle, year: e.target.value })} />
                          <Input placeholder="Plate Number" value={newVehicle.plateNumber} onChange={(e) => setNewVehicle({ ...newVehicle, plateNumber: e.target.value })} />
                        </div>
                        <DialogFooter>
                          <Button onClick={handleAddVehicle}>Save</Button>
                        </DialogFooter>
                      </DialogContent>
                    </Dialog>
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
    </div>
  )
}

