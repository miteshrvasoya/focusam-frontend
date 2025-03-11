"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Search, Filter, Edit, Trash2, Eye, Plus, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { LoadingSpinner } from "@/components/loading-spinner"
import { ErrorMessage } from "@/components/error-message"
import { vehiclesApi } from "@/lib/api"
import type { PaginatedResponse, Vehicle } from "@/types/api"

export default function VehiclesPage() {
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [vehiclesData, setVehiclesData] = useState<PaginatedResponse<Vehicle> | null>(null)
  const [isDeleting, setIsDeleting] = useState<string | null>(null)

  const itemsPerPage = 5

  const fetchVehicles = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await vehiclesApi.getAll(currentPage, itemsPerPage, statusFilter, searchTerm)
      setVehiclesData(response.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load vehicles")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchVehicles()
  }, [currentPage, statusFilter, searchTerm])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  const handleStatusChange = (value: string) => {
    setStatusFilter(value)
    setCurrentPage(1)
  }

  const handleDeleteVehicle = async (id: string) => {
    if (window.confirm("Are you sure you want to delete this vehicle?")) {
      setIsDeleting(id)
      try {
        await vehiclesApi.delete(id)
        fetchVehicles()
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to delete vehicle")
      } finally {
        setIsDeleting(null)
      }
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-600">Active</Badge>
      case "maintenance":
        return <Badge className="bg-yellow-600">Maintenance</Badge>
      case "inactive":
        return <Badge className="bg-red-600">Inactive</Badge>
      default:
        return <Badge>Unknown</Badge>
    }
  }

  if (isLoading && !vehiclesData) {
    return <LoadingSpinner />
  }

  if (error && !vehiclesData) {
    return <ErrorMessage message={error} onRetry={fetchVehicles} />
  }

  return (
    <div className="p-6">
      <div className="flex flex-col gap-4">
        <h1 className="text-3xl font-bold">Vehicles</h1>
        <p className="text-muted-foreground">Manage your vehicle database</p>
      </div>

      <div className="flex justify-end mt-6">
        <Button asChild>
          <Link href="/vehicles/create">
            <Plus className="h-4 w-4 mr-2" />
            Add Vehicle
          </Link>
        </Button>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Vehicle List</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search vehicles..."
                className="pl-8"
                value={searchTerm}
                onChange={handleSearchChange}
              />
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

          {isLoading && <LoadingSpinner size={24} />}

          {error && vehiclesData && (
            <div className="mb-4">
              <ErrorMessage message={error} onRetry={fetchVehicles} />
            </div>
          )}

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Vehicle ID</TableHead>
                  <TableHead>Make & Model</TableHead>
                  <TableHead>Registration</TableHead>
                  <TableHead>Owner</TableHead>
                  <TableHead>Last Service</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vehiclesData && vehiclesData.items.length > 0 ? (
                  vehiclesData.items.map((vehicle) => (
                    <TableRow key={vehicle.id}>
                      <TableCell className="font-medium">{vehicle.id}</TableCell>
                      <TableCell>
                        {vehicle.make} {vehicle.model} ({vehicle.year})
                      </TableCell>
                      <TableCell>{vehicle.registration}</TableCell>
                      <TableCell>{vehicle.owner.name}</TableCell>
                      <TableCell>{new Date(vehicle.lastService).toLocaleDateString()}</TableCell>
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
                    <TableCell colSpan={7} className="text-center py-4">
                      {isLoading ? "Loading..." : "No vehicles found"}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {vehiclesData && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                {Math.min(currentPage * itemsPerPage, vehiclesData.totalItems)} of {vehiclesData.totalItems} vehicles
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, vehiclesData.totalPages))}
                  disabled={currentPage === vehiclesData.totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

