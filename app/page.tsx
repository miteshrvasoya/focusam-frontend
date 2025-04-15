"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, AlertCircle, Users, Car, ArrowUpRight, ArrowDownRight, Send } from "lucide-react"
import { LoadingSpinner } from "@/components/loading-spinner"
import { ErrorMessage } from "@/components/error-message"
import { dashboardApi } from "@/lib/api"
import type { DashboardSummary } from "@/types/api"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { toast } from "@/components/ui/use-toast"
import Link from "next/link"

export default function Dashboard() {
  const [dashboardData, setDashboardData] = useState<DashboardSummary | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("overview")

  const fetchDashboardData = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const response = await dashboardApi.getSummary()
      setDashboardData(response.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load dashboard data")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

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

  const getDaysRemaining = (dueDate: string) => {
    const today = new Date()
    const due = new Date(dueDate)
    const diffTime = due.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) {
      return <span className="text-red-600">{Math.abs(diffDays)} days overdue</span>
    } else if (diffDays === 0) {
      return <span className="text-orange-600">Due today</span>
    } else {
      return <span className="text-blue-600">{diffDays} days remaining</span>
    }
  }

  const sendPaymentReminder = (invoiceId: string, customerName: string) => {
    // In a real app, this would call an API to send a reminder
    toast({
      title: "Payment reminder sent",
      description: `Reminder sent to ${customerName} for invoice #${invoiceId}`,
    })
  }

  // Get today's date in a nice format
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchDashboardData} />
  }

  if (!dashboardData) {
    return null
  }

  return (
    <div className="p-6 space-y-6">
      {/* Greeting Header */}
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold">Welcome to FocusAM Workshop</h1>
        <p className="text-muted-foreground">{today}</p>
      </div>

      {/* Key Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-700 dark:text-blue-300">
              {formatCurrency(dashboardData.totalRevenue)}
            </div>
            <div className="flex items-center mt-1">
              {dashboardData.revenueGrowth >= 0 ? (
                <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-600 mr-1" />
              )}
              <p className="text-xs text-muted-foreground">
                {dashboardData.revenueGrowth >= 0 ? "+" : ""}
                {dashboardData.revenueGrowth}% from last month
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950 dark:to-red-900">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Due Amount</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-700 dark:text-red-300">
              {formatCurrency(dashboardData.totalDueAmount)}
            </div>
            <div className="flex items-center mt-1">
              <p className="text-xs text-muted-foreground">
                {dashboardData.dueInvoices.length} invoices pending payment
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
            <Users className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-700 dark:text-green-300">{dashboardData.totalCustomers}</div>
            <div className="flex items-center mt-1">
              {dashboardData.customerGrowth >= 0 ? (
                <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-600 mr-1" />
              )}
              <p className="text-xs text-muted-foreground">
                {dashboardData.customerGrowth >= 0 ? "+" : ""}
                {dashboardData.customerGrowth}% from last month
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950 dark:to-purple-900">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
            <Car className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-700 dark:text-purple-300">{dashboardData.totalVehicles}</div>
            <div className="flex items-center mt-1">
              {dashboardData.vehicleGrowth >= 0 ? (
                <ArrowUpRight className="h-4 w-4 text-green-600 mr-1" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-600 mr-1" />
              )}
              <p className="text-xs text-muted-foreground">
                {dashboardData.vehicleGrowth >= 0 ? "+" : ""}
                {dashboardData.vehicleGrowth}% from last month
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabbed Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid grid-cols-4 md:w-[600px]">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Recent Invoices */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Invoices</CardTitle>
                <CardDescription>Latest invoices created</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.recentInvoices.map((invoice) => (
                    <div key={invoice.id} className="flex items-center justify-between border-b border-border pb-2">
                      <div>
                        <p className="font-medium">{invoice.id}</p>
                        <p className="text-sm text-muted-foreground">
                          {invoice.customer} - {invoice.vehicle}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(invoice.amount)}</p>
                        <div className="flex items-center justify-end gap-2">
                          <p className="text-sm text-muted-foreground">{formatDate(invoice.date)}</p>
                          {getStatusBadge(invoice.status)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4" asChild>
                  <Link href="/invoices">View All Invoices</Link>
                </Button>
              </CardContent>
            </Card>

            {/* Upcoming Services */}
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Services</CardTitle>
                <CardDescription>Services scheduled for the next 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.upcomingServices.map((service) => (
                    <div key={service.id} className="flex items-center justify-between border-b border-border pb-2">
                      <div>
                        <p className="font-medium">{service.type}</p>
                        <p className="text-sm text-muted-foreground">{service.vehicle}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatDate(service.date)}</p>
                        <p className="text-sm text-muted-foreground">{service.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <Button variant="outline" className="w-full mt-4">
                  View All Services
                </Button>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Top Vehicle Models */}
            <Card>
              <CardHeader>
                <CardTitle>Most Serviced Vehicle Models</CardTitle>
                <CardDescription>Top models by service frequency</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.topVehicles.map((vehicle, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{vehicle.model}</span>
                        <span className="text-sm text-muted-foreground">{vehicle.count} services</span>
                      </div>
                      <Progress value={(vehicle.count / dashboardData.topVehicles[0].count) * 100} />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Latest Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Latest Notes & Feedback</CardTitle>
                <CardDescription>Recent customer notes and feedback</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.latestNotes.map((note, index) => (
                    <div key={index} className="border-b border-border pb-2">
                      <p className="text-sm italic">"{note}"</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Invoices Tab */}
        <TabsContent value="invoices" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Due Invoices</CardTitle>
              <CardDescription>Invoices pending payment or overdue</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="p-3 text-left font-medium">Invoice #</th>
                      <th className="p-3 text-left font-medium">Customer</th>
                      <th className="p-3 text-left font-medium">Amount</th>
                      <th className="p-3 text-left font-medium">Due Date</th>
                      <th className="p-3 text-left font-medium">Status</th>
                      <th className="p-3 text-right font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dashboardData.dueInvoices.length > 0 ? (
                      dashboardData.dueInvoices.map((invoice) => (
                        <tr
                          key={invoice.id}
                          className={`border-b hover:bg-muted/50 ${
                            invoice.status === "overdue" ? "bg-red-50 dark:bg-red-950/20" : ""
                          }`}
                        >
                          <td className="p-3 font-medium">
                            <Link href={`/invoices/${invoice.id}`} className="hover:underline">
                              {invoice.id}
                            </Link>
                          </td>
                          <td className="p-3">{invoice.customer}</td>
                          <td className="p-3">{formatCurrency(invoice.amount)}</td>
                          <td className="p-3">
                            <div className="flex flex-col">
                              <span>{formatDate(invoice.dueDate)}</span>
                              <span className="text-xs">{getDaysRemaining(invoice.dueDate)}</span>
                            </div>
                          </td>
                          <td className="p-3">{getStatusBadge(invoice.status)}</td>
                          <td className="p-3 text-right">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => sendPaymentReminder(invoice.id, invoice.customer)}
                              title="Send payment reminder"
                            >
                              <Send className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={6} className="p-3 text-center text-muted-foreground">
                          No due invoices found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              <Button variant="outline" className="w-full mt-4" asChild>
                <Link href="/invoices">View All Invoices</Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Customers Tab */}
        <TabsContent value="customers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Frequent Customers</CardTitle>
              <CardDescription>Customers with most visits</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {dashboardData.frequentCustomers.map((customer) => (
                  <div key={customer.id} className="flex items-center space-x-4 border-b border-border pb-4">
                    <Avatar>
                      <AvatarFallback>{customer.name.substring(0, 2).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                      <p className="font-medium leading-none">{customer.name}</p>
                      <p className="text-sm text-muted-foreground">{customer.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">{customer.visits} visits</p>
                      <p className="text-sm text-muted-foreground">Last: {formatDate(customer.lastVisit)}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4" asChild>
                <Link href="/customers">View All Customers</Link>
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Services Tab */}
        <TabsContent value="services" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Upcoming Services</CardTitle>
                <CardDescription>Services scheduled for the next 7 days</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {dashboardData.upcomingServices.map((service) => (
                    <div key={service.id} className="flex items-center justify-between border-b border-border pb-2">
                      <div>
                        <p className="font-medium">{service.type}</p>
                        <p className="text-sm text-muted-foreground">{service.vehicle}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatDate(service.date)}</p>
                        <p className="text-sm text-muted-foreground">{service.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Service Completion Rate</CardTitle>
                <CardDescription>Monthly service completion statistics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">This Month</span>
                      <span className="text-sm text-muted-foreground">
                        {dashboardData.serviceStats.completed} / {dashboardData.serviceStats.total} services
                      </span>
                    </div>
                    <Progress
                      value={(dashboardData.serviceStats.completed / dashboardData.serviceStats.total) * 100}
                      className="h-2"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-lg border p-3">
                      <div className="text-sm font-medium text-muted-foreground">On-time</div>
                      <div className="text-2xl font-bold">
                        {Math.round((dashboardData.serviceStats.onTime / dashboardData.serviceStats.completed) * 100)}%
                      </div>
                    </div>
                    <div className="rounded-lg border p-3">
                      <div className="text-sm font-medium text-muted-foreground">Satisfaction</div>
                      <div className="text-2xl font-bold">{dashboardData.serviceStats.satisfaction}%</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
