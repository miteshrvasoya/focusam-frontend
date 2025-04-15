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
  Clock,
  DollarSign,
  Car,
  FileText,
  AlertCircle,
} from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ErrorMessage } from "@/components/error-message"
import { customersApi } from "@/lib/api"
import type { PaginatedResponse, Customer } from "@/types/api"
import { useDebounce } from "@/hooks/use-debounce"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
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

export default function CustomersPage() {
  // State management
  const [searchTerm, setSearchTerm] = useState("")
  const debouncedSearchTerm = useDebounce(searchTerm, 500)
  const [activityFilter, setActivityFilter] = useState("all")
  const [sortBy, setSortBy] = useState("name")
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [customersData, setCustomersData] = useState<PaginatedResponse<Customer> | null>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"table" | "cards">("table")
  const [showAddCustomerDialog, setShowAddCustomerDialog] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [retryCount, setRetryCount] = useState(0)

  // New customer form state
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    notes: "",
  })

  const itemsPerPage = 8

  // Fetch customers with useCallback to prevent unnecessary re-renders
  const fetchCustomers = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      // Add activity filter to API call
      const response = await customersApi.getAll(
        currentPage,
        itemsPerPage,
        sortBy,
        debouncedSearchTerm,
        activityFilter !== "all" ? activityFilter : undefined,
      )
      setCustomersData(response.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load customers")
      console.error("Error fetching customers:", err)
    } finally {
      setIsLoading(false)
    }
  }, [currentPage, sortBy, debouncedSearchTerm, activityFilter])

  // Effect to fetch customers when dependencies change
  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers, retryCount])

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  // Handle sort change
  const handleSortChange = (value: string) => {
    setSortBy(value)
    setCurrentPage(1)
  }

  // Handle activity filter change
  const handleActivityFilterChange = (value: string) => {
    setActivityFilter(value)
    setCurrentPage(1)
  }

  // Handle customer deletion
  const handleDeleteCustomer = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this customer?")) {
      setIsDeleting(id)
      try {
        await customersApi.delete(id)
        fetchCustomers()
        toast({
          title: "Customer deleted",
          description: "The customer has been successfully deleted.",
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete customer")
        toast({
          title: "Error",
          description: err instanceof Error ? err.message : "Failed to delete customer",
          variant: "destructive",
        })
      } finally {
        setIsDeleting(null)
      }
    }
  }

  // Handle new customer form input change
  const handleNewCustomerChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setNewCustomer((prev) => ({ ...prev, [name]: value }))
  }

  // Handle new customer form submission
  const handleAddCustomer = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validate required fields
      if (!newCustomer.name || !newCustomer.email || !newCustomer.phone) {
        throw new Error("Please fill in all required fields")
      }

      await customersApi.create(newCustomer)
      setShowAddCustomerDialog(false)

      // Reset form
      setNewCustomer({
        name: "",
        email: "",
        phone: "",
        address: "",
        notes: "",
      })

      // Refresh customer list
      fetchCustomers()

      toast({
        title: "Customer added",
        description: "The new customer has been successfully added.",
      })
    } catch (err) {
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : "Failed to add customer",
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

  // Format currency for display
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  // Get customer status badge
  const getCustomerStatusBadge = (customer: Customer) => {
    const daysSinceLastVisit = Math.floor(
      (new Date().getTime() - new Date(customer.lastVisit).getTime()) / (1000 * 60 * 60 * 24),
    )

    if (daysSinceLastVisit <= 30) {
      return <Badge className="bg-green-600">Active</Badge>
    } else if (daysSinceLastVisit <= 90) {
      return <Badge className="bg-yellow-600">Regular</Badge>
    } else {
      return <Badge className="bg-red-600">Inactive</Badge>
    }
  }

  // Render loading skeleton
  const renderLoadingSkeleton = () => (
    <div className="space-y-4">
      {Array.from({ length: 5 }).map((_, index) => (
        <div key={index} className="flex items-center space-x-4">
          <Skeleton className="h-12 w-12 rounded-full" />
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
      <h3 className="text-lg font-medium mb-2">No customers found</h3>
      <p className="text-muted-foreground mb-4 max-w-md">
        {searchTerm || activityFilter !== "all"
          ? "Try adjusting your search or filters to find what you're looking for."
          : "Get started by adding your first customer to the system."}
      </p>
      <Dialog open={showAddCustomerDialog} onOpenChange={setShowAddCustomerDialog}>
        <DialogTrigger asChild>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Customer
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[550px]">
          <form onSubmit={handleAddCustomer}>
            <DialogHeader>
              <DialogTitle>Add New Customer</DialogTitle>
              <DialogDescription>
                Fill in the customer details below. Fields marked with * are required.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input id="name" name="name" value={newCustomer.name} onChange={handleNewCustomerChange} required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    value={newCustomer.phone}
                    onChange={handleNewCustomerChange}
                    required
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={newCustomer.email}
                  onChange={handleNewCustomerChange}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Input id="address" name="address" value={newCustomer.address} onChange={handleNewCustomerChange} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  value={newCustomer.notes}
                  onChange={handleNewCustomerChange}
                  placeholder="Any additional information about the customer"
                />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowAddCustomerDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Adding..." : "Add Customer"}
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
            <h1 className="text-3xl font-bold">Customers</h1>
            <p className="text-muted-foreground">Manage your customer database</p>
          </div>
          <Dialog open={showAddCustomerDialog} onOpenChange={setShowAddCustomerDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Customer
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px]">
              <form onSubmit={handleAddCustomer}>
                <DialogHeader>
                  <DialogTitle>Add New Customer</DialogTitle>
                  <DialogDescription>
                    Fill in the customer details below. Fields marked with * are required.
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={newCustomer.name}
                        onChange={handleNewCustomerChange}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={newCustomer.phone}
                        onChange={handleNewCustomerChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={newCustomer.email}
                      onChange={handleNewCustomerChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="address">Address</Label>
                    <Input id="address" name="address" value={newCustomer.address} onChange={handleNewCustomerChange} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      name="notes"
                      value={newCustomer.notes}
                      onChange={handleNewCustomerChange}
                      placeholder="Any additional information about the customer"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setShowAddCustomerDialog(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Adding..." : "Add Customer"}
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
            <CardTitle>Customer List</CardTitle>
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
                placeholder="Search customers by name, email, or phone..."
                className="pl-8"
                value={searchTerm}
                onChange={handleSearchChange}
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select value={activityFilter} onValueChange={handleActivityFilterChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by activity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Customers</SelectItem>
                  <SelectItem value="active">Active (Last 30 days)</SelectItem>
                  <SelectItem value="regular">Regular (Last 90 days)</SelectItem>
                  <SelectItem value="inactive">Inactive (90+ days)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <Select value={sortBy} onValueChange={handleSortChange}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name (A-Z)</SelectItem>
                  <SelectItem value="lastVisit">Last Visit</SelectItem>
                  <SelectItem value="totalSpent">Total Spent</SelectItem>
                  <SelectItem value="vehicles">Vehicle Count</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Loading indicator for initial load */}
          {isLoading && !customersData && <div className="p-6">{renderLoadingSkeleton()}</div>}

          {/* Error message with retry button */}
          {error && !customersData && (
            <div className="mb-4">
              <ErrorMessage message={error} onRetry={() => setRetryCount((prev) => prev + 1)} />
            </div>
          )}

          {/* Content when data is loaded */}
          {!isLoading && !error && customersData && (
            <>
              <TabsContent value="table" className="mt-0">
                {/* Customers table */}
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Customer</TableHead>
                        <TableHead>Contact</TableHead>
                        <TableHead>Vehicles</TableHead>
                        <TableHead>Last Visit</TableHead>
                        <TableHead>Invoices</TableHead>
                        <TableHead>Total Spent</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {customersData.items.length > 0 ? (
                        customersData.items.map((customer) => (
                          <TableRow key={customer.id}>
                            <TableCell>
                              <div className="flex items-center gap-3">
                                <Avatar className="h-9 w-9">
                                  <AvatarFallback className="bg-primary text-primary-foreground">
                                    {customer.name.substring(0, 2).toUpperCase()}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="font-medium">{customer.name}</div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex flex-col">
                                <span className="text-sm">{customer.email}</span>
                                <span className="text-sm text-muted-foreground">{customer.phone}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Car className="h-4 w-4 text-muted-foreground" />
                                <span>{customer.vehicles.length}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span>{formatDate(customer.lastVisit)}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <FileText className="h-4 w-4 text-muted-foreground" />
                                <span>{customer.invoices.length}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                                <span>{formatCurrency(customer.totalSpent)}</span>
                              </div>
                            </TableCell>
                            <TableCell>{getCustomerStatusBadge(customer)}</TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="icon" asChild>
                                  <Link href={`/customers/${customer.id}`}>
                                    <Eye className="h-4 w-4" />
                                    <span className="sr-only">View</span>
                                  </Link>
                                </Button>
                                <Button variant="ghost" size="icon" asChild>
                                  <Link href={`/customers/${customer.id}/edit`}>
                                    <Edit className="h-4 w-4" />
                                    <span className="sr-only">Edit</span>
                                  </Link>
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => handleDeleteCustomer(customer.id)}
                                  disabled={isDeleting === customer.id}
                                >
                                  <Trash2 className={`h-4 w-4 ${isDeleting === customer.id ? "animate-spin" : ""}`} />
                                  <span className="sr-only">Delete</span>
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))
                      ) : (
                        <TableRow>
                          <TableCell colSpan={8} className="h-24 text-center">
                            {renderEmptyState()}
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </TabsContent>

              <TabsContent value="cards" className="mt-0">
                {/* Customers cards */}
                {customersData.items.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {customersData.items.map((customer) => (
                      <Card key={customer.id} className="overflow-hidden">
                        <CardHeader className="pb-2">
                          <div className="flex justify-between items-start">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-10 w-10">
                                <AvatarFallback className="bg-primary text-primary-foreground">
                                  {customer.name.substring(0, 2).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <CardTitle className="text-lg">{customer.name}</CardTitle>
                                <p className="text-sm text-muted-foreground">{customer.email}</p>
                              </div>
                            </div>
                            {getCustomerStatusBadge(customer)}
                          </div>
                        </CardHeader>
                        <CardContent className="pb-3">
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div className="flex items-center gap-1">
                              <Car className="h-4 w-4 text-muted-foreground" />
                              <span>{customer.vehicles.length} vehicles</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>{formatDate(customer.lastVisit)}</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <FileText className="h-4 w-4 text-muted-foreground" />
                              <span>{customer.invoices.length} invoices</span>
                            </div>
                            <div className="flex items-center gap-1">
                              <DollarSign className="h-4 w-4 text-muted-foreground" />
                              <span>{formatCurrency(customer.totalSpent)}</span>
                            </div>
                            <div className="col-span-2 text-muted-foreground">{customer.phone}</div>
                          </div>
                        </CardContent>
                        <div className="bg-muted/50 px-4 py-2 flex justify-between">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/customers/${customer.id}`}>View Details</Link>
                          </Button>
                          <div className="flex gap-1">
                            <Button variant="ghost" size="icon" asChild>
                              <Link href={`/customers/${customer.id}/edit`}>
                                <Edit className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDeleteCustomer(customer.id)}
                              disabled={isDeleting === customer.id}
                            >
                              <Trash2 className={`h-4 w-4 ${isDeleting === customer.id ? "animate-spin" : ""}`} />
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
              {customersData.items.length > 0 && (
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">
                    Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                    {Math.min(currentPage * itemsPerPage, customersData.totalItems)} of {customersData.totalItems}{" "}
                    customers
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
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, customersData.totalPages))}
                      disabled={currentPage === customersData.totalPages || isLoading}
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
