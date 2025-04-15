"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import {
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  Plus,
  ChevronLeft,
  ChevronRight,
  Calendar,
  User,
  Clock,
  AlertCircle,
  Fuel,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ErrorMessage } from "@/components/error-message"
import { vehiclesApi, customersApi } from "@/lib/api"
import type { PaginatedResponse, Vehicle, Customer } from "@/types/api"
import { useDebounce } from "@/hooks/use-debounce"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "@/components/ui/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

export default function VehiclesPage() {
  // State management
  const [searchTerm, setSearchTerm] = useState("")
  const debouncedSearchTerm = useDebounce(searchTerm, 500)
  const [statusFilter, setStatusFilter] = useState("all")
  const [customerFilter, setCustomerFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [vehiclesData, setVehiclesData] = useState<PaginatedResponse<Vehicle> | null>(null)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"table" | "cards">("table")
  const [showAddVehicleDialog, setShowAddVehicleDialog] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  // New vehicle form state
  const [newVehicle, setNewVehicle] = useState({
    make: "",
    model: "",
    year: "",
    registration: "",
    vin: "",
    color: "",
    fuelType: "petrol",
    odometer: "",
    ownerId: "",
    status: "active",
    notes: "",
    customerId: "",
  })

  const itemsPerPage = 8

  // Fetch vehicles with useCallback to prevent unnecessary re-renders
  const fetchVehicles = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await vehiclesApi.getAll(
        currentPage,
        itemsPerPage,
        statusFilter !== "all" ? statusFilter : undefined,
        debouncedSearchTerm,
        customerFilter !== "all" ? customerFilter : undefined,
      )
      setVehiclesData(response.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load vehicles")
      console.error("Error fetching vehicles:", err)
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, statusFilter, debouncedSearchTerm, customerFilter])

  // Fetch customers for the dropdown
  const fetchCustomers = useCallback(async () => {
    setIsLoadingCustomers(true)
    try {
      const response = await customersApi.getAll(1, 100) // Get all customers for dropdown
      setCustomers(response.data.items)
    } catch (err) {
      console.error("Failed to load customers:", err)
      // Don't set error state here as it's not critical for the main page functionality
    } finally {
      setIsLoadingCustomers(false)
    }
  }, [])

  // Effect to fetch vehicles when dependencies change
  useEffect(() => {
    fetchVehicles()
  }, [fetchVehicles, retryCount])

  // Effect to fetch customers on initial load
  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  // Handle status filter change
  const handleStatusChange = (value: string) => {
    setStatusFilter(value)
    setCurrentPage(1)
  }

  // Handle customer filter change
  const handleCustomerChange = (value: string) => {
    setCustomerFilter(value)
    setCurrentPage(1)
  }

  // Handle vehicle deletion
  const handleDeleteVehicle = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this vehicle?")) {
      setIsDeleting(id)
      try {
        await vehiclesApi.delete(id)
        fetchVehicles()
        toast({
          title: "Vehicle deleted",
          description: "The vehicle has been successfully deleted.",
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete vehicle")
        toast({
          title: "Error",
          description: err instanceof Error ? err.message : "Failed to delete vehicle",
          variant: "destructive",
        })
      } finally {
        setIsDeleting(null)
      }
    }
  }

  // Handle new vehicle form input change
  const handleNewVehicleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setNewVehicle((prev) => ({ ...prev, [name]: value }))
  }

  // Handle new vehicle form submission
  const handleAddVehicle = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validate required fields
      if (
        !newVehicle.make ||
        !newVehicle.model ||
        !newVehicle.year ||
        !newVehicle.registration ||
        !newVehicle.ownerId
      ) {
        throw new Error("Please fill in all required fields")
      }

      await vehiclesApi.create(newVehicle)
      setShowAddVehicleDialog(false)

      // Reset form
      setNewVehicle({
        make: "",
        model: "",
        year: "",
        registration: "",
        vin: "",
        color: "",
        fuelType: "petrol",
        odometer: "",
        ownerId: "",
        status: "active",
        notes: "",
        customerId: ""
      })

      // Refresh vehicle list
      fetchVehicles()

      toast({
        title: "Vehicle added",
        description: "The new vehicle has been successfully added.",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to add vehicle",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  // Get status badge component based on status
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { className: "bg-green-600", label: "Active" },
      maintenance: { className: "bg-yellow-600", label: "Maintenance" },
      inactive: { className: "bg-red-600", label: "Inactive" },
      default: { className: "", label: "Unknown" },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.default
    return <Badge className={config.className}>{config.label}</Badge>
  }

  // Get fuel type badge
  const getFuelTypeBadge = (fuelType: string) => {
    const fuelTypeConfig = {
      petrol: { className: "bg-blue-600", label: "Petrol" },
      diesel: { className: "bg-gray-600", label: "Diesel" },
      electric: { className: "bg-green-600", label: "Electric" },
      hybrid: { className: "bg-purple-600", label: "Hybrid" },
      default: { className: "", label: fuelType || "Unknown" },
    }

    const config = fuelTypeConfig[fuelType as keyof typeof fuelTypeConfig] || fuelTypeConfig.default
    return <Badge className={config.className}>{config.label}</Badge>
  }

  // Render loading skeleton
  const renderLoadingSkeleton = () => (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-md" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-[250px]" />
            <Skeleton className="h-4 w-[200px]" />
          </div>
        </div>
      ))}
    </div>
  )

  // Render empty state
  const renderEmptyState = () => (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="rounded-full bg-muted p-3 mb-4">
        <AlertCircle className="h-6 w-6 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-medium mb-2">No vehicles found</h3>
      <p className="text-muted-foreground mb-4 max-w-md">
        {searchTerm || statusFilter !== "all" || customerFilter !== "all"
          ? "Try adjusting your search or filters to find what you're looking for."
          : "Get started by adding your first vehicle to the system."}
      </p>
      <Dialog open={showAddVehicleDialog} onOpenChange={setShowAddVehicleDialog}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Vehicle
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[550px]">
          <form onSubmit={handleAddVehicle}>
            <DialogHeader>
              <DialogTitle>Add New Vehicle</DialogTitle>
              <DialogDescription>
                Fill in the vehicle details below. Fields marked with * are required.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="ownerId">Owner *</Label>
                <Select
                  name="ownerId"
                  value={newVehicle.ownerId}
                  onValueChange={(value) => setNewVehicle((prev) => ({ ...prev, ownerId: value }))}
                  required
                >
                  <SelectTrigger id="ownerId">
                    <SelectValue placeholder={isLoadingCustomers ? "Loading customers..." : "Select owner"} />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="make">Make *</Label>
                  <Input id="make" name="make" value={newVehicle.make} onChange={handleNewVehicleChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Model *</Label>
                  <Input id="model" name="model" value={newVehicle.model} onChange={handleNewVehicleChange} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="year">Year *</Label>
                  <Input id="year" name="year" value={newVehicle.year} onChange={handleNewVehicleChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="registration">Registration *</Label>
                  <Input
                    id="registration"
                    name="registration"
                    value={newVehicle.registration}
                    onChange={handleNewVehicleChange}
                    required
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="color">Color</Label>
                  <Input id="color" name="color" value={newVehicle.color} onChange={handleNewVehicleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="fuelType">Fuel Type</Label>
                  <Select
                    name="fuelType"
                    value={newVehicle.fuelType}
                    onValueChange={(value) => setNewVehicle((prev) => ({ ...prev, fuelType: value }))}
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="odometer">Odometer</Label>
                  <Input id="odometer" name="odometer" value={newVehicle.odometer} onChange={handleNewVehicleChange} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select
                    name="status"
                    value={newVehicle.status}
                    onValueChange={(value) => setNewVehicle((prev) => ({ ...prev, status: value }))}
                  >
                    <SelectTrigger id="status">
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="maintenance">Maintenance</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="vin">VIN</Label>
                <Input id="vin" name="vin" value={newVehicle.vin} onChange={handleNewVehicleChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={newVehicle.notes}
                  onChange={handleNewVehicleChange}
                  placeholder="Any additional information about the vehicle"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddVehicleDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Vehicle"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )

  return (
    <div className="p-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Vehicles</h1>
            <p className="text-muted-foreground">Manage your vehicle database</p>
          </div>
          <Dialog open={showAddVehicleDialog} onOpenChange={setShowAddVehicleDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Vehicle
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <form onSubmit={handleAddVehicle}>
                <DialogHeader>
                  <DialogTitle>Add New Vehicle</DialogTitle>
                  <DialogDescription>
                    Fill in the vehicle details below. Fields marked with * are required.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="ownerId">Owner *</Label>
                    <Select
                      name="ownerId"
                      value={newVehicle.ownerId}
                      onValueChange={(value) => setNewVehicle((prev) => ({ ...prev, ownerId: value }))}
                      required
                    >
                      <SelectTrigger id="ownerId">
                        <SelectValue placeholder={isLoadingCustomers ? "Loading customers..." : "Select owner"} />
                      </SelectTrigger>
                      <SelectContent>
                        {customers.map((customer) => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="make">Make *</Label>
                      <Input id="make" name="make" value={newVehicle.make} onChange={handleNewVehicleChange} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="model">Model *</Label>
                      <Input
                        id="model"
                        name="model"
                        value={newVehicle.model}
                        onChange={handleNewVehicleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="year">Year *</Label>
                      <Input id="year" name="year" value={newVehicle.year} onChange={handleNewVehicleChange} required />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="registration">Registration *</Label>
                      <Input
                        id="registration"
                        name="registration"
                        value={newVehicle.registration}
                        onChange={handleNewVehicleChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="color">Color</Label>
                      <Input id="color" name="color" value={newVehicle.color} onChange={handleNewVehicleChange} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="fuelType">Fuel Type</Label>
                      <Select
                        name="fuelType"
                        value={newVehicle.fuelType}
                        onValueChange={(value) => setNewVehicle((prev) => ({ ...prev, fuelType: value }))}
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
                    <Label htmlFor="odometer">Odometer</Label>
                    <Input
                      id="odometer"
                      name="odometer"
                      value={newVehicle.odometer}
                      onChange={handleNewVehicleChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vin">VIN</Label>
                    <Input id="vin" name="vin" value={newVehicle.vin} onChange={handleNewVehicleChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      value={newVehicle.notes}
                      onChange={handleNewVehicleChange}
                      placeholder="Any additional information about the vehicle"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setShowAddVehicleDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Adding..." : "Add Vehicle"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Card className="mt-6">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Vehicle List</CardTitle>
            <div className="flex items-center gap-2">
              <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "table" | "cards")}>
                <TabsList className="grid w-[180px] grid-cols-2">
                  <TabsTrigger value="table">Table View</TabsTrigger>
                  <TabsTrigger value="cards">Card View</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* Search and filter controls */}
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search vehicles by make, model, or registration..."
                className="pl-8"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <Select value={customerFilter} onValueChange={handleCustomerChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by owner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Owners</SelectItem>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={statusFilter} onValueChange={handleStatusChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Loading indicator for initial load */}
          {isLoading && !vehiclesData && <div className="p-6">{renderLoadingSkeleton()}</div>}

          {/* Error message with retry button */}
          {error && !vehiclesData && (
            <div className="mb-4">
              <ErrorMessage message={error} onRetry={() => setRetryCount((prev) => prev + 1)} />
            </div>
          )}

          {/* Content when data is loaded */}
          {!isLoading && !error && vehiclesData && (
            <>
              <TabsContent value="table" className="mt-0">
                {/* Vehicles table */}
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Vehicle</TableHead>
                        <TableHead>Registration</TableHead>
                        <TableHead>Fuel Type</TableHead>
                        <TableHead>Owner</TableHead>
                        <TableHead>Last Service</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {vehiclesData.items.length > 0 ? (
                        vehiclesData.items.map((vehicle) => (
                          <TableRow key={vehicle.id}>
                            <TableCell>
                              <div className="font-medium">
                                {vehicle.make} {vehicle.model}
                              </div>
                              <div className="text-sm text-muted-foreground">{vehicle.year}</div>
                            </TableCell>
                            <TableCell>{vehicle.registration}</TableCell>
                            <TableCell>{getFuelTypeBadge(vehicle.fuelType || "petrol")}</TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <User className="h-4 w-4 text-muted-foreground" />
                                <Link href={`/customers/${vehicle.ownerId}`} className="hover:underline">
                                  {vehicle.owner.name}
                                </Link>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span>{formatDate(vehicle.lastService)}</span>
                              </div>
                            </TableCell>
                            <TableCell>{getStatusBadge(vehicle.status)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="icon" asChild>
                                  <Link href={`/vehicles/${vehicle.id}`}>
                                    <Eye className="h-4 w-4" />
                                    <span className="sr-only">View</span>
                                  </Link>
                                </Button>
                                <Button variant="ghost" size="icon" asChild>
                                  <Link href={`/vehicles/${vehicle.id}/edit`}>
                                    <Edit className="h-4 w-4" />
                                    <span className="sr-only">Edit</span>
                                  </Link>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteVehicle(vehicle.id)}
                                  disabled={isDeleting === vehicle.id}
                                >
                                  <Trash2 className={`h-4 w-4 ${isDeleting === vehicle.id ? "animate-spin" : ""}`} />
                                  <span className="sr-only">Delete</span>
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={7} className="h-24 text-center">
                            {renderEmptyState()}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="cards" className="mt-0">
                {/* Vehicles cards */}
                {vehiclesData.items.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {vehiclesData.items.map((vehicle) => (
                      <Card key={vehicle.id} className="overflow-hidden">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <CardTitle className="text-lg">
                              {vehicle.make} {vehicle.model} ({vehicle.year})
                            </CardTitle>
                            {getStatusBadge(vehicle.status)}
                          </div>
                        </CardHeader>
                        <CardContent className="pb-3">
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center gap-1">
                              <span className="text-muted-foreground">Registration:</span>
                              <span>{vehicle.registration}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Fuel className="h-4 w-4 text-muted-foreground" />
                              <span>{vehicle.fuelType || "Petrol"}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <User className="h-4 w-4 text-muted-foreground" />
                              <Link href={`/customers/${vehicle.ownerId}`} className="hover:underline">
                                {vehicle.owner.name}
                              </Link>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>{formatDate(vehicle.lastService)}</span>
                            </div>
                            {vehicle.upcomingServices && vehicle.upcomingServices.length > 0 ? (
                              <div className="flex items-center gap-1 col-span-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span>Next service: {formatDate(vehicle.upcomingServices[0].dueDate)}</span>
                              </div>
                            ) : null}
                          </div>
                        </CardContent>
                        <div className="bg-muted/50 px-4 py-2 flex justify-between">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/vehicles/${vehicle.id}`}>View Details</Link>
                          </Button>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" asChild>
                              <Link href={`/vehicles/${vehicle.id}/edit`}>
                                <Edit className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteVehicle(vehicle.id)}
                              disabled={isDeleting === vehicle.id}
                            >
                              <Trash2 className={`h-4 w-4 ${isDeleting === vehicle.id ? "animate-spin" : ""}`} />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="py-4">{renderEmptyState()}</div>
                )}
              </TabsContent>

              {/* Pagination controls */}
              {vehiclesData.items.length > 0 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                    {Math.min(currentPage * itemsPerPage, vehiclesData.totalItems)} of {vehiclesData.totalItems}{" "}
                    vehicles
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1 || isLoading}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, vehiclesData.totalPages))}
                      disabled={currentPage === vehiclesData.totalPages || isLoading}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
