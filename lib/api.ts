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

// Base API URL - can be overridden with environment variable
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"

// Common fetch options
const defaultHeaders = {
  "Content-Type": "application/json",
  Accept: "application/json",
}

// Generic API request handler with error handling
async function fetchApi<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  try {
    const url = `${API_BASE_URL}${endpoint}`
    const response = await fetch(url, {
      ...options,
      headers: {
        ...defaultHeaders,
        ...options.headers,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || "An error occurred")
    }

    return data as ApiResponse<T>
  } catch (error) {
    console.error("API request failed:", error)
    throw error
  }
}

// Dashboard API
export const dashboardApi = {
  getSummary: () => fetchApi<DashboardSummary>("/dashboard/summary"),
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

  getById: (id: string) => fetchApi<Invoice>(`/invoice/${id}`),

  create: (invoice: CreateInvoiceDto) =>
    fetchApi<Invoice>("/invoice", {
      method: "POST",
      body: JSON.stringify(invoice),
    }),

  update: (id: string, invoice: UpdateInvoiceDto) =>
    fetchApi<Invoice>(`/invoices/${id}`, {
      method: "PUT",
      body: JSON.stringify(invoice),
    }),

  delete: (id: string) =>
    fetchApi<void>(`/invoices/${id}`, {
      method: "DELETE",
    }),
}

// Customers API
export const customersApi = {
  getAll: (page = 1, limit = 10, sortBy = "name", search?: string) => {
    const params = new URLSearchParams()
    params.append("page", page.toString())
    params.append("limit", limit.toString())
    params.append("sortBy", sortBy)
    if (search) params.append("search", search)

    return fetchApi<PaginatedResponse<Customer>>(`/customers?${params.toString()}`)
  },

  getById: (id: string) => fetchApi<Customer>(`/customers/${id}`),

  searchByMobileNo: (mo_no: string) => {
    console.log("Searching By Mobile Number")
    return fetchApi<Customer>(`/customer/search_by_phone/${mo_no}`);
  },

  create: (customer: CreateCustomerDto) =>
    fetchApi<Customer>("/customer", {
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
  getAll: (page = 1, limit = 10, status?: string, search?: string) => {
    const params = new URLSearchParams()
    params.append("page", page.toString())
    params.append("limit", limit.toString())
    if (status && status !== "all") params.append("status", status)
    if (search) params.append("search", search)

    return fetchApi<PaginatedResponse<Vehicle>>(`/vehicles?${params.toString()}`)
  },

  getById: (id: string) => fetchApi<Vehicle>(`/vehicles/${id}`),

  create: (vehicle: CreateVehicleDto) =>
    fetchApi<Vehicle>("/vehicle", {
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

  getByCustomerId: (customerId: string) =>
    fetchApi<void>(`/vehicle/get_by_customer_id/${customerId}`, {
      method: "GET",
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

