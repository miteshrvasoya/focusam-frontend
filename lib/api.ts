import type {
  ApiResponse,
  PaginatedResponse,
  DashboardSummary,
  Invoice,
  CreateInvoiceDto,
  UpdateInvoiceDto,
  Customer,
  CreateCustomerDto,
  UpdateCustomerDto,
  Vehicle,
  CreateVehicleDto,
  UpdateVehicleDto,
  WorkshopSettings,
  BillingSettings,
  InvoiceSettings,
  AppearanceSettings,
  UpdateSettingsDto,
} from "@/types/api"

import type { LoginCredentials, AuthResponse } from "@/types/auth"

import { mockAuthService } from "./mock-auth-service"

// Base API URL - can be overridden with environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

// Common fetch options
const defaultHeaders = {
  "Content-Type": "application/json",
  Accept: "application/json",
}

// Get auth token from localStorage (client-side only)
const getAuthToken = () => {
  if (typeof window !== "undefined") {
    try {
      return localStorage.getItem("auth_token")
    } catch (e) {
      console.error("Failed to get auth token:", e)
      return null
    }
  }
  return null
}

// Generic API request handler with error handling
async function fetchApi<T>(endpoint: string, options: RequestInit = {}, withAuth = true): Promise<ApiResponse<T>> {
  try {
    const url = `${API_BASE_URL}${endpoint}`

    // Add auth token to headers if needed
    const headers: any = { ...defaultHeaders, ...options.headers }

    if (withAuth) {
      const token = getAuthToken()
      if (token) {
        headers["Authorization"] = `Bearer ${token}`
      }
    }

    const response = await fetch(url, {
      ...options,
      headers,
    })

    const data = await response.json()

    if (!response.ok) {
      // Handle unauthorized errors specifically
      if (response.status === 401) {
        // Clear auth data on 401 Unauthorized
        if (typeof window !== "undefined") {
          try {
            localStorage.removeItem("auth_token")
            localStorage.removeItem("auth_user")
          } catch (e) {
            console.error("Failed to clear localStorage:", e)
          }

          // Only redirect to login if not already there and not on a public page
          const currentPath = window.location.pathname
          if (!currentPath.startsWith("/public") && currentPath !== "/login") {
            window.location.href = "/login"
          }
        }
      }
      throw new Error(data.message || "An error occurred")
    }

    return data as ApiResponse<T>
  } catch (error) {
    console.error("API request failed:", error)
    throw error
  }
}

// Authentication API
export const authApi = {
  login: async (credentials: LoginCredentials) => {
    try {
      // Use the mock service for now
      const authResponse = await mockAuthService.login(credentials)

      return {
        success: authResponse.success,
        message: authResponse.message,
        data: authResponse,
      } as ApiResponse<AuthResponse>
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Authentication failed",
        data: null,
      } as any
    }
  },

  getCurrentUser: async () => {
    try {
      const token = getAuthToken()
      if (!token) {
        throw new Error("No authentication token found")
      }

      // Use the mock service for now
      const authResponse = await mockAuthService.getCurrentUser(token)

      return {
        success: authResponse.success,
        message: authResponse.message,
        data: authResponse,
      } as ApiResponse<AuthResponse>
    } catch (error: any) {
      return {
        success: false,
        message: error.message || "Failed to get current user",
        data: null,
      } as any
    }
  },
}


// Dashboard API
// Update the mock data in the API to include the new fields
// This is just a partial update to show the mock data structure
// You would need to update the actual API implementation

// Add this mock data to your existing API implementation
const mockDashboardData: DashboardSummary = {
  // Existing fields
  totalInvoices: 156,
  totalRevenue: 45780.5,
  pendingPayments: 12450.75,
  servicesCompleted: 142,
  revenueGrowth: 12.5,
  invoiceGrowth: 8.3,
  servicesGrowth: 15.2,

  // New fields
  totalCustomers: 87,
  totalVehicles: 112,
  totalDueAmount: 12450.75,
  customerGrowth: 5.8,
  vehicleGrowth: 7.2,

  recentInvoices: [
    {
      id: "INV-001",
      customer: "John Smith",
      customerId: "CUST-001",
      vehicle: "Toyota Camry (2019)",
      vehicleId: "VEH-001",
      date: "2023-06-10",
      dueDate: "2023-06-25",
      amount: 350.75,
      subtotal: 325.0,
      tax: 25.75,
      status: "paid",
      paymentMethod: "credit",
      services: [],
      createdAt: "2023-06-10",
      updatedAt: "2023-06-10",
    },
    {
      id: "INV-002",
      customer: "Sarah Johnson",
      customerId: "CUST-002",
      vehicle: "Honda Civic (2020)",
      vehicleId: "VEH-002",
      date: "2023-06-12",
      dueDate: "2023-06-27",
      amount: 520.3,
      subtotal: 480.0,
      tax: 40.3,
      status: "pending",
      paymentMethod: "credit",
      services: [],
      createdAt: "2023-06-12",
      updatedAt: "2023-06-12",
    },
    {
      id: "INV-003",
      customer: "Michael Brown",
      customerId: "CUST-003",
      vehicle: "Ford F-150 (2018)",
      vehicleId: "VEH-003",
      date: "2023-06-15",
      dueDate: "2023-06-15",
      amount: 780.5,
      subtotal: 720.0,
      tax: 60.5,
      status: "overdue",
      paymentMethod: "debit",
      services: [],
      createdAt: "2023-06-15",
      updatedAt: "2023-06-15",
    },
    {
      id: "INV-004",
      customer: "Emily Davis",
      customerId: "CUST-004",
      vehicle: "Chevrolet Malibu (2021)",
      vehicleId: "VEH-004",
      date: "2023-06-18",
      dueDate: "2023-07-03",
      amount: 420.25,
      subtotal: 388.0,
      tax: 32.25,
      status: "pending",
      paymentMethod: "credit",
      services: [],
      createdAt: "2023-06-18",
      updatedAt: "2023-06-18",
    },
    {
      id: "INV-005",
      customer: "Robert Wilson",
      customerId: "CUST-005",
      vehicle: "Nissan Altima (2020)",
      vehicleId: "VEH-005",
      date: "2023-06-20",
      dueDate: "2023-07-05",
      amount: 650.8,
      subtotal: 600.0,
      tax: 50.8,
      status: "paid",
      paymentMethod: "cash",
      services: [],
      createdAt: "2023-06-20",
      updatedAt: "2023-06-20",
    },
  ],

  pendingServices: [
    {
      id: "SVC-001",
      serviceType: "Oil Change",
      time: "9:00 AM",
      vehicle: "Toyota Camry (2019)",
    },
    {
      id: "SVC-002",
      serviceType: "Brake Inspection",
      time: "10:30 AM",
      vehicle: "Honda Civic (2020)",
    },
    {
      id: "SVC-003",
      serviceType: "Tire Rotation",
      time: "1:00 PM",
      vehicle: "Ford F-150 (2018)",
    },
  ],

  dueInvoices: [
    {
      id: "INV-003",
      customer: "Michael Brown",
      customerId: "CUST-003",
      vehicle: "Ford F-150 (2018)",
      vehicleId: "VEH-003",
      date: "2023-06-15",
      dueDate: "2023-06-15",
      amount: 780.5,
      subtotal: 720.0,
      tax: 60.5,
      status: "overdue",
      paymentMethod: "debit",
      services: [],
      createdAt: "2023-06-15",
      updatedAt: "2023-06-15",
    },
    {
      id: "INV-002",
      customer: "Sarah Johnson",
      customerId: "CUST-002",
      vehicle: "Honda Civic (2020)",
      vehicleId: "VEH-002",
      date: "2023-06-12",
      dueDate: "2023-06-27",
      amount: 520.3,
      subtotal: 480.0,
      tax: 40.3,
      status: "pending",
      paymentMethod: "credit",
      services: [],
      createdAt: "2023-06-12",
      updatedAt: "2023-06-12",
    },
    {
      id: "INV-004",
      customer: "Emily Davis",
      customerId: "CUST-004",
      vehicle: "Chevrolet Malibu (2021)",
      vehicleId: "VEH-004",
      date: "2023-06-18",
      dueDate: "2023-07-03",
      amount: 420.25,
      subtotal: 388.0,
      tax: 32.25,
      status: "pending",
      paymentMethod: "credit",
      services: [],
      createdAt: "2023-06-18",
      updatedAt: "2023-06-18",
    },
  ],

  frequentCustomers: [
    {
      id: "CUST-001",
      name: "John Smith",
      email: "john.smith@example.com",
      phone: "555-123-4567",
      visits: 12,
      lastVisit: "2023-06-10",
      totalSpent: 3250.75,
    },
    {
      id: "CUST-002",
      name: "Sarah Johnson",
      email: "sarah.j@example.com",
      phone: "555-234-5678",
      visits: 8,
      lastVisit: "2023-06-12",
      totalSpent: 2180.3,
    },
    {
      id: "CUST-006",
      name: "David Thompson",
      email: "david.t@example.com",
      phone: "555-345-6789",
      visits: 7,
      lastVisit: "2023-06-05",
      totalSpent: 1950.45,
    },
    {
      id: "CUST-003",
      name: "Michael Brown",
      email: "michael.b@example.com",
      phone: "555-456-7890",
      visits: 5,
      lastVisit: "2023-06-15",
      totalSpent: 1580.5,
    },
  ],

  upcomingServices: [
    {
      id: "SVC-001",
      type: "Oil Change",
      date: "2023-06-25",
      time: "9:00 AM",
      vehicle: "Toyota Camry (2019)",
      customer: "John Smith",
      dueDate: "",
      dueMileage: "",
      description: ""
    },
    {
      id: "SVC-002",
      type: "Brake Inspection",
      date: "2023-06-25",
      time: "10:30 AM",
      vehicle: "Honda Civic (2020)",
      customer: "Sarah Johnson",
      dueDate: "",
      dueMileage: "",
      description: ""

    },
    {
      id: "SVC-003",
      type: "Tire Rotation",
      date: "2023-06-26",
      time: "1:00 PM",
      vehicle: "Ford F-150 (2018)",
      customer: "Michael Brown",
      dueDate: "",
      dueMileage: "",
      description: ""

    },
    {
      id: "SVC-004",
      type: "Engine Diagnostic",
      date: "2023-06-27",
      time: "11:00 AM",
      vehicle: "Chevrolet Malibu (2021)",
      customer: "Emily Davis",
      dueDate: "",
      dueMileage: "",
      description: ""

    },
  ],

  topVehicles: [
    {
      model: "Toyota Camry",
      count: 15,
      percentage: 100,
    },
    {
      model: "Honda Civic",
      count: 12,
      percentage: 80,
    },
    {
      model: "Ford F-150",
      count: 10,
      percentage: 67,
    },
    {
      model: "Chevrolet Malibu",
      count: 8,
      percentage: 53,
    },
    {
      model: "Nissan Altima",
      count: 7,
      percentage: 47,
    },
  ],

  latestNotes: [
    "Great service, my car runs like new again! Will definitely be back.",
    "The staff was very professional and explained everything clearly.",
    "Quick service and reasonable prices. Thank you!",
    "I appreciate the thorough inspection and recommendations for future maintenance.",
  ],

  serviceStats: {
    total: 45,
    completed: 38,
    onTime: 35,
    satisfaction: 92,
  },
}

// Update the dashboardApi object to return the mock data
export const dashboardApi = {
  getSummary: () => {
    // Simulate API delay
    return new Promise<ApiResponse<DashboardSummary>>((resolve) => {
      setTimeout(() => {
        resolve({
          success: true,
          data: mockDashboardData,
          message: "Dashboard data retrieved successfully",
        })
      }, 800)
    })
  },
}

// Invoices API
export const invoicesApi = {
  getAll: (page = 1, limit = 10, status?: string, search?: string) => {
    const params = new URLSearchParams()
    params.append("page", page.toString())
    params.append("limit", limit.toString())
    if (status && status !== "all") params.append("status", status)
    if (search) params.append("search", search)

    return fetchApi<PaginatedResponse<Invoice>>(`/invoice?${params.toString()}`)
  },

  getById: (id: string) =>
    fetchApi<Invoice>(
      `/invoice/${id}`,
      {
        headers: {
          // Add a header to indicate this might be a public request
          "X-Public-Access": "true",
        },
      },
      false,
    ), // Don't require auth for invoice view

  create: (invoice: CreateInvoiceDto) =>
    fetchApi<Invoice>("/invoices", {
      method: "POST",
      body: JSON.stringify(invoice),
    }),

  update: (id: string, invoice: UpdateInvoiceDto) =>
    fetchApi<Invoice>(`/invoice/${id}`, {
      method: "PUT",
      body: JSON.stringify(invoice),
    }),

  delete: (id: string) =>
    fetchApi<void>(`/invoice/${id}`, {
      method: "DELETE",
    }),
}

// Customers API
export const customersApi = {
  getAll: (page = 1, limit = 10, sortBy = "name", search?: string, activityFilter?: string) => {
    const params = new URLSearchParams()
    params.append("page", page.toString())
    params.append("limit", limit.toString())
    params.append("sortBy", sortBy)
    if (search) params.append("search", search)
    if (activityFilter) params.append("activity", activityFilter)

    return fetchApi<PaginatedResponse<Customer>>(`/customers?${params.toString()}`)
  },

  getById: (id: string) => fetchApi<Customer>(`/customers/${id}`),

  create: (customer: CreateCustomerDto) =>
    fetchApi<Customer>("/customers", {
      method: "POST",
      body: JSON.stringify(customer),
    }),

  update: (id: string, customer: UpdateCustomerDto) =>
    fetchApi<Customer>(`/customers/${id}`, {
      method: "PUT",
      body: JSON.stringify(customer),
    }),

  delete: (id: string) =>
    fetchApi<void>(`/customers/${id}`, {
      method: "DELETE",
    }),
}

// Vehicles API
export const vehiclesApi = {
  getAll: (page = 1, limit = 10, status?: string, search?: string, ownerId?: string) => {
    const params = new URLSearchParams()
    params.append("page", page.toString())
    params.append("limit", limit.toString())
    if (status && status !== "all") params.append("status", status)
    if (search) params.append("search", search)
    if (ownerId) params.append("ownerId", ownerId)

    return fetchApi<PaginatedResponse<Vehicle>>(`/vehicles?${params.toString()}`)
  },

  getById: (id: string) => fetchApi<Vehicle>(`/vehicles/${id}`),

  create: (vehicle: CreateVehicleDto) =>
    fetchApi<Vehicle>("/vehicles", {
      method: "POST",
      body: JSON.stringify(vehicle),
    }),

  update: (id: string, vehicle: UpdateVehicleDto) =>
    fetchApi<Vehicle>(`/vehicles/${id}`, {
      method: "PUT",
      body: JSON.stringify(vehicle),
    }),

  delete: (id: string) =>
    fetchApi<void>(`/vehicles/${id}`, {
      method: "DELETE",
    }),

  scheduleService: (vehicleId: string, serviceId: string, date: string) =>
    fetchApi<void>(`/vehicles/${vehicleId}/schedule-service`, {
      method: "POST",
      body: JSON.stringify({ serviceId, date }),
    }),
}

// Settings API
export const settingsApi = {
  getWorkshopSettings: () => fetchApi<WorkshopSettings>("/settings/workshop"),

  getBillingSettings: () => fetchApi<BillingSettings>("/settings/billing"),

  getInvoiceSettings: () => fetchApi<InvoiceSettings>("/settings/invoice"),

  getAppearanceSettings: () => fetchApi<AppearanceSettings>("/settings/appearance"),

  updateSettings: (settings: UpdateSettingsDto) =>
    fetchApi<void>("/settings", {
      method: "PATCH",
      body: JSON.stringify(settings),
    }),
}

