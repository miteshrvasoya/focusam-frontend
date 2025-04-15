import Link from "next/link"
import { ArrowLeft, Edit, FileText, PenToolIcon as Tool, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Mock data for a single vehicle
const vehicle = {
  id: "VEH-001",
  make: "Toyota",
  model: "Camry",
  year: "2019",
  registration: "ABC-1234",
  vin: "1HGCM82633A123456",
  color: "Silver",
  odometer: "45,678 miles",
  owner: {
    id: "CUST-001",
    name: "John Smith",
    phone: "(555) 123-4567",
    email: "john.smith@example.com",
  },
  lastService: "2023-03-15",
  status: "active",
  serviceHistory: [
    {
      id: "SERV-001",
      date: "2023-03-15",
      type: "Oil Change",
      description: "Full synthetic oil change, replaced oil filter",
      odometer: "45,678 miles",
      technician: "Mike Johnson",
      invoiceId: "INV-2023",
    },
    {
      id: "SERV-002",
      date: "2023-01-10",
      type: "Brake Service",
      description: "Replaced front brake pads and rotors",
      odometer: "42,345 miles",
      technician: "Sarah Williams",
      invoiceId: "INV-2021",
    },
    {
      id: "SERV-003",
      date: "2022-11-05",
      type: "Tire Rotation",
      description: "Rotated and balanced all tires",
      odometer: "39,876 miles",
      technician: "Mike Johnson",
      invoiceId: "INV-2019",
    },
    {
      id: "SERV-004",
      date: "2022-08-20",
      type: "AC Service",
      description: "Recharged AC system, replaced cabin air filter",
      odometer: "36,543 miles",
      technician: "David Lee",
      invoiceId: "INV-2018",
    },
  ],
  upcomingServices: [
    {
      id: "UPSERV-001",
      dueDate: "2023-06-15",
      type: "Oil Change",
      description: "Regular maintenance",
      dueMileage: "50,000 miles",
    },
    {
      id: "UPSERV-002",
      dueDate: "2023-09-15",
      type: "Transmission Fluid",
      description: "Recommended service",
      dueMileage: "55,000 miles",
    },
  ],
  notes: "Customer prefers synthetic oil. Right front tire tends to lose pressure.",
}

export default function VehicleDetailPage({ params }: { params: { id: string } }) {
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

  return (
    <div className="p-6">
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/vehicles">
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">
            {vehicle.make} {vehicle.model} ({vehicle.year})
          </h1>
          {getStatusBadge(vehicle.status)}
        </div>
        <p className="text-muted-foreground">
          Vehicle ID: {vehicle.id} | Registration: {vehicle.registration}
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">VIN</h3>
                  <p className="text-lg font-medium">{vehicle.vin}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Color</h3>
                  <p className="text-lg font-medium">{vehicle.color}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Odometer</h3>
                  <p className="text-lg font-medium">{vehicle.odometer}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Last Service</h3>
                  <p className="text-lg font-medium">{new Date(vehicle.lastService).toLocaleDateString('en-UK')}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/vehicles/${vehicle.id}/edit`}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Vehicle
                </Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Owner Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Name</h3>
                  <p className="text-lg font-medium">{vehicle.owner.name}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Phone</h3>
                  <p className="text-lg font-medium">{vehicle.owner.phone}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                  <p className="text-lg font-medium">{vehicle.owner.email}</p>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/customers/${vehicle.owner.id}`}>View Customer</Link>
              </Button>
            </CardFooter>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm">{vehicle.notes}</p>
            </CardContent>
          </Card>
        </div>

        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Service History</CardTitle>
              <Button variant="outline" size="sm" asChild>
                <Link href="/invoices/create">
                  <Tool className="h-4 w-4 mr-2" />
                  New Service
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Service Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Odometer</TableHead>
                      <TableHead>Technician</TableHead>
                      <TableHead className="text-right">Invoice</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {vehicle.serviceHistory.map((service) => (
                      <TableRow key={service.id}>
                        <TableCell>{new Date(service.date).toLocaleDateString('en-UK')}</TableCell>
                        <TableCell className="font-medium">{service.type}</TableCell>
                        <TableCell>{service.description}</TableCell>
                        <TableCell>{service.odometer}</TableCell>
                        <TableCell>{service.technician}</TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" asChild>
                            <Link href={`/invoices/${service.invoiceId}`}>
                              <FileText className="h-4 w-4 mr-2" />
                              {service.invoiceId}
                            </Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Upcoming Services</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {vehicle.upcomingServices.map((service) => (
                  <div key={service.id} className="border rounded-md p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-semibold">{service.type}</h3>
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span className="text-sm">Due: {new Date(service.dueDate).toLocaleDateString('en-UK')}</span>
                      </div>
                    </div>
                    <div className="text-sm">
                      <p>{service.description}</p>
                      <p className="text-muted-foreground mt-1">Due at: {service.dueMileage}</p>
                    </div>
                    <div className="mt-2">
                      <Button variant="outline" size="sm">
                        Schedule Service
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

