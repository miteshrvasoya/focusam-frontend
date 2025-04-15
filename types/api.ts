// Common response type that wraps all API responses
export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
}

// Pagination response type
export interface PaginatedResponse<T> {
  items: T[]
  totalItems: number
  currentPage: number
  totalPages: number
  itemsPerPage: number
}

// Dashboard types
export interface DashboardSummary {
  totalInvoices: number
  totalRevenue: number
  pendingPayments: number
  servicesCompleted: number
  revenueGrowth: number
  invoiceGrowth: number
  servicesGrowth: number
  recentInvoices: Invoice[]
  pendingServices: PendingService[]

  // New fields
  totalCustomers: number
  totalVehicles: number
  totalDueAmount: number
  customerGrowth: number
  vehicleGrowth: number
  dueInvoices: Invoice[]
  frequentCustomers: FrequentCustomer[]
  upcomingServices: UpcomingService[]
  topVehicles: TopVehicle[]
  latestNotes: string[]
  serviceStats: ServiceStats
}

export interface FrequentCustomer {
  id: string
  name: string
  email: string
  phone: string
  visits: number
  lastVisit: string
  totalSpent: number
}

export interface TopVehicle {
  model: string
  count: number
  percentage: number
}

export interface ServiceStats {
  total: number
  completed: number
  onTime: number
  satisfaction: number
}

export interface PendingService {
  id: string
  serviceType: string
  time: string
  vehicle: string
}

// Invoice types
export interface Invoice {
  id: string
  customer: string
  customerId: string
  vehicle: any
  vehicleId: string
  date: string
  dueDate: string
  amount: number
  subtotal: number
  tax: number
  status: "paid" | "pending" | "overdue"
  paymentMethod: string
  notes?: string
  services: InvoiceService[]
  createdAt: string
  updatedAt: string
}

export interface InvoiceService {
  id: string
  description: string
  quantity: number
  unitPrice: number
  total: number
}

export interface CreateInvoiceDto {
  customerId: string
  vehicleId: string
  date: string
  dueDate: string
  paymentMethod: string
  notes?: string
  status: "paid" | "pending" | "overdue"
  services: Omit<InvoiceService, "id">[]
  amount: number
}

export interface UpdateInvoiceDto extends Partial<CreateInvoiceDto> {
  id: string
}

// Customer types
export interface Customer {
  id: string
  name: string
  email: string
  phone: string
  address: string
  vehicles: VehicleSummary[]
  lastVisit: string
  totalSpent: number
  invoices: InvoiceSummary[]
  notes?: string
  createdAt: string
  updatedAt: string
}

export interface VehicleSummary {
  id: string
  make: string
  model: string
  year: string
  registration: string
  lastService: string
}

export interface InvoiceSummary {
  id: string
  date: string
  amount: number
  status: "paid" | "pending" | "overdue"
  vehicle: string
}

export interface CreateCustomerDto {
  name: string
  email: string
  phone: string
  address?: string
  notes?: string
}

export interface UpdateCustomerDto extends Partial<CreateCustomerDto> {
  id: string
}

// Vehicle types
export interface Vehicle {
  id: string
  make: string
  model: string
  year: string
  registration: string
  vin: string
  color: string
  odometer: string
  ownerId: string
  owner: {
    id: string
    name: string
    phone: string
    email: string
  }
  lastService: string
  status: "active" | "maintenance" | "inactive"
  serviceHistory: ServiceRecord[]
  upcomingServices: UpcomingService[]
  notes?: string
  createdAt: string
  updatedAt: string
  fuelType?: string // Add this field
}

export interface ServiceRecord {
  id: string
  date: string
  type: string
  description: string
  odometer: string
  technician: string
  invoiceId: string
}

export interface UpcomingService {
  id: string
  type: string
  date: string
  time: string
  vehicle: string
  customer: string
  dueDate: string
  dueMileage: string
  description: string
}

export interface CreateVehicleDto {
  make: string
  model: string
  year?: string
  registration?: string
  vin?: string
  color?: string
  odometer?: string
  customerId: string
  status?: string
  notes?: string
  fuelType?: string // Add this field
}

export interface UpdateVehicleDto extends Partial<CreateVehicleDto> {
  id: string
}

// Settings types
export interface WorkshopSettings {
  workshopName: string
  email: string
  phone: string
  address: string
  city: string
  state: string
  zip: string
  website: string
  businessHours: string
}

export interface BillingSettings {
  taxId: string
  defaultTaxRate: number
  currency: string
  acceptedPaymentMethods: {
    creditCard: boolean
    debitCard: boolean
    cash: boolean
    bankTransfer: boolean
    check: boolean
    paypal: boolean
  }
}

export interface InvoiceSettings {
  invoicePrefix: string
  nextInvoiceNumber: number
  invoiceTerms: string
  invoiceNotes: string
  showLogo: boolean
  autoEmail: boolean
  includeTax: boolean
}

export interface AppearanceSettings {
  theme: "dark" | "light" | "system"
  density: "comfortable" | "compact"
  sidebarOptions: {
    collapseSidebar: boolean
    rememberSidebar: boolean
  }
  accessibility: {
    reducedMotion: boolean
    highContrast: boolean
  }
}

export interface UpdateSettingsDto {
  workshop?: Partial<WorkshopSettings>
  billing?: Partial<BillingSettings>
  invoice?: Partial<InvoiceSettings>
  appearance?: Partial<AppearanceSettings>
}

