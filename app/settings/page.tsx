"use client"

import { useState, useEffect } from "react"
import { Building, CreditCard, Palette, FileText } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { LoadingSpinner } from "@/components/loading-spinner"
import { ErrorMessage } from "@/components/error-message"
import { settingsApi } from "@/lib/api"
import type {
  WorkshopSettings,
  BillingSettings,
  InvoiceSettings,
  AppearanceSettings,
  UpdateSettingsDto,
} from "@/types/api"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("workshop")
  const [isSaving, setIsSaving] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Settings states
  const [workshopSettings, setWorkshopSettings] = useState<WorkshopSettings | null>(null)
  const [billingSettings, setBillingSettings] = useState<BillingSettings | null>(null)
  const [invoiceSettings, setInvoiceSettings] = useState<InvoiceSettings | null>(null)
  const [appearanceSettings, setAppearanceSettings] = useState<AppearanceSettings | null>(null)

  // Fetch settings
  const fetchSettings = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const workshopRes = await settingsApi.getWorkshopSettings()
      setWorkshopSettings(workshopRes.data)

      const billingRes = await settingsApi.getBillingSettings()
      setBillingSettings(billingRes.data)

      const invoiceRes = await settingsApi.getInvoiceSettings()
      setInvoiceSettings(invoiceRes.data)

      const appearanceRes = await settingsApi.getAppearanceSettings()
      setAppearanceSettings(appearanceRes.data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load settings")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchSettings()
  }, [])

  // Update workshop settings fields
  const updateWorkshopField = (field: keyof WorkshopSettings, value: string) => {
    if (workshopSettings) {
      setWorkshopSettings({ ...workshopSettings, [field]: value })
    }
  }

  // Update billing settings fields
  const updateBillingField = (field: keyof BillingSettings, value: any) => {
    if (billingSettings) {
      if (field === "acceptedPaymentMethods") {
        setBillingSettings({
          ...billingSettings,
          acceptedPaymentMethods: {
            ...billingSettings.acceptedPaymentMethods,
            ...value,
          },
        })
      } else {
        setBillingSettings({ ...billingSettings, [field]: value })
      }
    }
  }

  // Update invoice settings fields
  const updateInvoiceField = (field: keyof InvoiceSettings, value: any) => {
    if (invoiceSettings) {
      setInvoiceSettings({ ...invoiceSettings, [field]: value })
    }
  }

  // Update appearance settings fields
  const updateAppearanceField = (field: keyof AppearanceSettings | string, value: any) => {
    if (appearanceSettings) {
      if (field === "sidebarOptions" || field === "accessibility") {
        setAppearanceSettings({
          ...appearanceSettings,
          [field]: {
            ...(appearanceSettings[field as keyof AppearanceSettings] as any),
            ...value,
          },
        })
      } else {
        setAppearanceSettings({ ...appearanceSettings, [field]: value })
      }
    }
  }

  // Save settings
  const handleSave = async () => {
    setIsSaving(true)
    setSaveError(null)
    setSaveSuccess(false)

    try {
      const settings: UpdateSettingsDto = {}

      if (workshopSettings) {
        settings.workshop = workshopSettings
      }

      if (billingSettings) {
        settings.billing = billingSettings
      }

      if (invoiceSettings) {
        settings.invoice = invoiceSettings
      }

      if (appearanceSettings) {
        settings.appearance = appearanceSettings
      }

      await settingsApi.updateSettings(settings)
      setSaveSuccess(true)

      // Hide success message after 3 seconds
      setTimeout(() => {
        setSaveSuccess(false)
      }, 3000)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : "Failed to save settings")
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchSettings} />
  }

  return (
    <div className="p-6">
      <div className="flex flex-col gap-4 mb-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your workshop settings and preferences</p>
      </div>

      {saveSuccess && (
        <div className="mb-6 p-4 bg-green-600/10 border border-green-600/20 rounded-md text-green-600">
          Settings saved successfully!
        </div>
      )}

      {saveError && (
        <div className="mb-6">
          <ErrorMessage message={saveError} />
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-5 w-full max-w-3xl mb-6">
          <TabsTrigger value="workshop">
            <Building className="h-4 w-4 mr-2" />
            Workshop
          </TabsTrigger>
          <TabsTrigger value="billing">
            <CreditCard className="h-4 w-4 mr-2" />
            Billing
          </TabsTrigger>
          <TabsTrigger value="invoices">
            <FileText className="h-4 w-4 mr-2" />
            Invoices
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <Palette className="h-4 w-4 mr-2" />
            Appearance
          </TabsTrigger>
        </TabsList>

        <TabsContent value="workshop">
          <Card>
            <CardHeader>
              <CardTitle>Workshop Information</CardTitle>
              <CardDescription>Update your workshop details and contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="workshopName">Workshop Name</Label>
                <Input
                  id="workshopName"
                  value={workshopSettings?.workshopName || ""}
                  onChange={(e) => updateWorkshopField("workshopName", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={workshopSettings?.email || ""}
                    onChange={(e) => updateWorkshopField("email", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={workshopSettings?.phone || ""}
                    onChange={(e) => updateWorkshopField("phone", e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={workshopSettings?.address || ""}
                  onChange={(e) => updateWorkshopField("address", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    value={workshopSettings?.city || ""}
                    onChange={(e) => updateWorkshopField("city", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State</Label>
                  <Input
                    id="state"
                    value={workshopSettings?.state || ""}
                    onChange={(e) => updateWorkshopField("state", e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="zip">ZIP Code</Label>
                  <Input
                    id="zip"
                    value={workshopSettings?.zip || ""}
                    onChange={(e) => updateWorkshopField("zip", e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                <Input
                  id="website"
                  value={workshopSettings?.website || ""}
                  onChange={(e) => updateWorkshopField("website", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="businessHours">Business Hours</Label>
                <Textarea
                  id="businessHours"
                  value={workshopSettings?.businessHours || ""}
                  onChange={(e) => updateWorkshopField("businessHours", e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <Card>
            <CardHeader>
              <CardTitle>Billing Settings</CardTitle>
              <CardDescription>Manage your payment methods and billing information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="taxId">Tax ID / EIN</Label>
                <Input
                  id="taxId"
                  value={billingSettings?.taxId || ""}
                  onChange={(e) => updateBillingField("taxId", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="defaultTaxRate">Default Tax Rate (%)</Label>
                <Input
                  id="defaultTaxRate"
                  type="number"
                  value={billingSettings?.defaultTaxRate || 0}
                  onChange={(e) => updateBillingField("defaultTaxRate", Number.parseFloat(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Currency</Label>
                <Select
                  value={billingSettings?.currency || "usd"}
                  onValueChange={(value) => updateBillingField("currency", value)}
                >
                  <SelectTrigger id="currency">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="usd">USD ($)</SelectItem>
                    <SelectItem value="eur">EUR (€)</SelectItem>
                    <SelectItem value="gbp">GBP (£)</SelectItem>
                    <SelectItem value="cad">CAD (C$)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentMethods">Accepted Payment Methods</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="creditCard"
                      checked={billingSettings?.acceptedPaymentMethods.creditCard || false}
                      onCheckedChange={(checked) =>
                        updateBillingField("acceptedPaymentMethods", { creditCard: checked })
                      }
                    />
                    <Label htmlFor="creditCard">Credit Card</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="debitCard"
                      checked={billingSettings?.acceptedPaymentMethods.debitCard || false}
                      onCheckedChange={(checked) =>
                        updateBillingField("acceptedPaymentMethods", { debitCard: checked })
                      }
                    />
                    <Label htmlFor="debitCard">Debit Card</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="cash"
                      checked={billingSettings?.acceptedPaymentMethods.cash || false}
                      onCheckedChange={(checked) => updateBillingField("acceptedPaymentMethods", { cash: checked })}
                    />
                    <Label htmlFor="cash">Cash</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="bankTransfer"
                      checked={billingSettings?.acceptedPaymentMethods.bankTransfer || false}
                      onCheckedChange={(checked) =>
                        updateBillingField("acceptedPaymentMethods", { bankTransfer: checked })
                      }
                    />
                    <Label htmlFor="bankTransfer">Bank Transfer</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="check"
                      checked={billingSettings?.acceptedPaymentMethods.check || false}
                      onCheckedChange={(checked) => updateBillingField("acceptedPaymentMethods", { check: checked })}
                    />
                    <Label htmlFor="check">Check</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="paypal"
                      checked={billingSettings?.acceptedPaymentMethods.paypal || false}
                      onCheckedChange={(checked) => updateBillingField("acceptedPaymentMethods", { paypal: checked })}
                    />
                    <Label htmlFor="paypal">PayPal</Label>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="invoices">
          <Card>
            <CardHeader>
              <CardTitle>Invoice Settings</CardTitle>
              <CardDescription>Configure your invoice templates and numbering system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="invoicePrefix">Invoice Number Prefix</Label>
                <Input
                  id="invoicePrefix"
                  value={invoiceSettings?.invoicePrefix || ""}
                  onChange={(e) => updateInvoiceField("invoicePrefix", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nextInvoiceNumber">Next Invoice Number</Label>
                <Input
                  id="nextInvoiceNumber"
                  type="number"
                  value={invoiceSettings?.nextInvoiceNumber || 1}
                  onChange={(e) => updateInvoiceField("nextInvoiceNumber", Number.parseInt(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invoiceTerms">Default Invoice Terms</Label>
                <Textarea
                  id="invoiceTerms"
                  value={invoiceSettings?.invoiceTerms || ""}
                  onChange={(e) => updateInvoiceField("invoiceTerms", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invoiceNotes">Default Invoice Notes</Label>
                <Textarea
                  id="invoiceNotes"
                  value={invoiceSettings?.invoiceNotes || ""}
                  onChange={(e) => updateInvoiceField("invoiceNotes", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Invoice Options</Label>
                <div className="grid grid-cols-1 gap-4 mt-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="showLogo"
                      checked={invoiceSettings?.showLogo || false}
                      onCheckedChange={(checked) => updateInvoiceField("showLogo", checked)}
                    />
                    <Label htmlFor="showLogo">Show logo on invoices</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="autoEmail"
                      checked={invoiceSettings?.autoEmail || false}
                      onCheckedChange={(checked) => updateInvoiceField("autoEmail", checked)}
                    />
                    <Label htmlFor="autoEmail">Auto-email invoices when created</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="includeTax"
                      checked={invoiceSettings?.includeTax || false}
                      onCheckedChange={(checked) => updateInvoiceField("includeTax", checked)}
                    />
                    <Label htmlFor="includeTax">Include tax breakdown</Label>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>Customize the look and feel of your workshop interface</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="theme">Theme</Label>
                <Select
                  value={appearanceSettings?.theme || "dark"}
                  onValueChange={(value) => updateAppearanceField("theme", value)}
                >
                  <SelectTrigger id="theme">
                    <SelectValue placeholder="Select theme" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dark">Dark</SelectItem>
                    <SelectItem value="light">Light</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="density">Interface Density</Label>
                <Select
                  value={appearanceSettings?.density || "comfortable"}
                  onValueChange={(value) => updateAppearanceField("density", value)}
                >
                  <SelectTrigger id="density">
                    <SelectValue placeholder="Select density" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="comfortable">Comfortable</SelectItem>
                    <SelectItem value="compact">Compact</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Sidebar Options</Label>
                <div className="grid grid-cols-1 gap-4 mt-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="collapseSidebar"
                      checked={appearanceSettings?.sidebarOptions.collapseSidebar || false}
                      onCheckedChange={(checked) =>
                        updateAppearanceField("sidebarOptions", { collapseSidebar: checked })
                      }
                    />
                    <Label htmlFor="collapseSidebar">Allow sidebar collapse</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="rememberSidebar"
                      checked={appearanceSettings?.sidebarOptions.rememberSidebar || false}
                      onCheckedChange={(checked) =>
                        updateAppearanceField("sidebarOptions", { rememberSidebar: checked })
                      }
                    />
                    <Label htmlFor="rememberSidebar">Remember sidebar state</Label>
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Accessibility</Label>
                <div className="grid grid-cols-1 gap-4 mt-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="reducedMotion"
                      checked={appearanceSettings?.accessibility.reducedMotion || false}
                      onCheckedChange={(checked) => updateAppearanceField("accessibility", { reducedMotion: checked })}
                    />
                    <Label htmlFor="reducedMotion">Reduce motion</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="highContrast"
                      checked={appearanceSettings?.accessibility.highContrast || false}
                      onCheckedChange={(checked) => updateAppearanceField("accessibility", { highContrast: checked })}
                    />
                    <Label htmlFor="highContrast">High contrast</Label>
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save Changes"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

