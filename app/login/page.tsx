"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import Image from "next/image"
import { ErrorBoundary } from "@/components/error-boundary"

export default function LoginPage() {
  const [mobile, setMobile] = useState("")
  const [password, setPassword] = useState("")
  const [errors, setErrors] = useState({
    mobile: "",
    password: "",
  })
  const [mounted, setMounted] = useState(false)
  const { login, isLoading } = useAuth()
  const router = useRouter()

  // Only run on client
  useEffect(() => {
    setMounted(true)
  }, [])

  const validateForm = () => {
    let isValid = true
    const newErrors = {
      mobile: "",
      password: "",
    }

    // Validate mobile
    if (!mobile.trim()) {
      newErrors.mobile = "Mobile number is required"
      isValid = false
    } else if (!/^\d{10}$/.test(mobile)) {
      newErrors.mobile = "Enter a valid 10-digit mobile number"
      isValid = false
    }

    // Validate password
    if (!password) {
      newErrors.password = "Password is required"
      isValid = false
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters"
      isValid = false
    }

    setErrors(newErrors)
    return isValid
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm() || !mounted) {
      return
    }

    const success = await login({ mobile, password })
    if (success) {
      router.push("/")
    }
  }

  // Don't render anything on server
  if (!mounted) {
    return null
  }

  return (
    <ErrorBoundary>
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="w-full max-w-md p-4">
          <Card className="shadow-lg">
            <CardHeader className="space-y-1 text-center">
              <div className="flex justify-center mb-4">
                <Image src="/logo.svg" alt="AutoFix Workshop" width={60} height={60} className="h-16 w-16" />
              </div>
              <CardTitle className="text-2xl font-bold">AutoFix Workshop</CardTitle>
              <CardDescription>Enter your credentials to access the admin panel</CardDescription>
            </CardHeader>
            <form onSubmit={handleSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="mobile">Mobile Number</Label>
                  <Input
                    id="mobile"
                    type="tel"
                    placeholder="Enter your 10-digit mobile number"
                    value={mobile}
                    onChange={(e) => setMobile(e.target.value)}
                    className={errors.mobile ? "border-red-500" : ""}
                  />
                  {errors.mobile && <p className="text-sm text-red-500">{errors.mobile}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={errors.password ? "border-red-500" : ""}
                  />
                  {errors.password && <p className="text-sm text-red-500">{errors.password}</p>}
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    "Log In"
                  )}
                </Button>
              </CardFooter>
            </form>
          </Card>
          <div className="mt-4 text-center text-sm text-gray-500">
            <p>* For demo purposes, use mobile: 9876543210 and password: password123</p>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}

