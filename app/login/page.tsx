"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowRight, Eye, EyeOff, Loader2, CheckCircle, AlertCircle } from 'lucide-react'
import Link from "next/link"

// Icône Google SVG
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
    />
  </svg>
)

type LoginState = "idle" | "loading" | "success" | "error"

export default function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [role, setRole] = useState("")
  const [state, setState] = useState<LoginState>("idle")
  const [error, setError] = useState("")
  const [user, setUser] = useState<any>(null)
  const router = useRouter()

  const handleLogin = async () => {
    setState("loading")
    setError("")

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          email,
          password,
          role,
        }),
      })

      const data = await response.json()

      if (data.success) {
        setState("success")
        setUser(data.user)
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          router.push("/dashboard")
        }, 1500)
      } else {
        setState("error")
        setError(data.message || "Login failed")
      }
    } catch (err) {
      setState("error")
      setError("Network error. Please try again.")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!role) {
      setError("Please select your role")
      return
    }
    await handleLogin()
  }

  const reset = () => {
    setState("idle")
    setError("")
  }

  const getButtonContent = () => {
    switch (state) {
      case "loading":
        return (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Signing in...
          </>
        )
      case "success":
        return (
          <>
            <CheckCircle className="mr-2 h-4 w-4" />
            Success! Redirecting...
          </>
        )
      default:
        return (
          <>
            Sign in
            <ArrowRight className="ml-2 h-4 w-4" />
          </>
        )
    }
  }

  const isLoading = state === "loading"
  const isSuccess = state === "success"
  const isError = state === "error"

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div
            className="w-8 h-8 bg-emerald-400 mx-auto mb-6"
            style={{ clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }}
          />
          <h1 className="text-2xl font-semibold text-white mb-2">
            {isSuccess ? `Welcome back, ${user?.name}` : "Welcome back"}
          </h1>
          <p className="text-zinc-400">
            {isSuccess ? "Successfully signed in! Redirecting..." : "Sign in to your account to continue"}
          </p>
        </div>

        {/* Form */}
        <Card className="border-0 shadow-none bg-transparent">
          <CardContent className="p-0">
            {/* Alerts */}
            {isError && (
              <Alert variant="destructive" className="mb-6 border-red-800 bg-red-950/50 text-red-200">
                <AlertCircle className="h-4 w-4 text-red-400" />
                <AlertDescription className="text-red-200">{error}</AlertDescription>
              </Alert>
            )}

            {isSuccess && (
              <Alert className="mb-6 border-emerald-800 bg-emerald-950/50 text-emerald-200">
                <CheckCircle className="h-4 w-4 text-emerald-400" />
                <AlertDescription className="text-emerald-200">
                  Successfully signed in! Redirecting to dashboard...
                </AlertDescription>
              </Alert>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Role Selection */}
              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm font-medium text-zinc-200">
                  I am a
                </Label>
                <Select value={role} onValueChange={setRole} disabled={isLoading || isSuccess}>
                  <SelectTrigger className="h-12 text-base border-zinc-700/50 bg-zinc-900 text-white focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 rounded-md hover:bg-zinc-800 transition-colors">
                    <SelectValue placeholder="Select your role" className="text-zinc-400" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border-zinc-700/50">
                    <SelectItem value="coach" className="text-white hover:bg-zinc-800 focus:bg-zinc-800">
                      Coach / Trainer
                    </SelectItem>
                    <SelectItem value="member" className="text-white hover:bg-zinc-800 focus:bg-zinc-800">
                      Gym Member
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-zinc-200">
                  Email
                </Label>
                <div className="relative">
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading || isSuccess}
                    className="h-12 text-base border-zinc-700/50 bg-zinc-900 text-white placeholder:text-zinc-500 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 rounded-md transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-zinc-200">
                  Password
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading || isSuccess}
                    className="h-12 text-base border-zinc-700/50 bg-zinc-900 text-white placeholder:text-zinc-500 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 rounded-md pr-12 transition-colors"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-1 top-1 h-10 w-10 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading || isSuccess}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                className={`w-full h-12 text-base font-medium rounded-md transition-all ${
                  isSuccess
                    ? "bg-emerald-600 hover:bg-emerald-600 text-white"
                    : isError
                      ? "bg-red-600 hover:bg-red-700 text-white"
                      : "bg-white hover:bg-zinc-100 text-black"
                }`}
                type="submit"
                disabled={isLoading || isSuccess || !role}
              >
                {getButtonContent()}
              </Button>
            </form>

            {/* Retry button */}
            {isError && (
              <Button
                variant="outline"
                className="w-full mt-4 h-12 border-zinc-700/50 bg-transparent text-zinc-200 hover:bg-zinc-800 hover:text-white transition-colors"
                onClick={reset}
              >
                Try again
              </Button>
            )}

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-zinc-700/50" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-zinc-950 px-3 text-zinc-500 font-medium">Or continue with</span>
              </div>
            </div>

            {/* Social Login */}
            <Button
              variant="outline"
              className="w-full h-12 border-zinc-700/50 bg-transparent text-zinc-200 hover:bg-zinc-800 hover:text-white transition-colors"
              disabled={isLoading || isSuccess}
            >
              <GoogleIcon />
              <span className="ml-2">Continue with Google</span>
            </Button>

            {/* Forgot Password */}
            <div className="text-center mt-6">
              <Link href="#" className="text-sm text-zinc-400 hover:text-emerald-400 transition-colors">
                Forgot your password?
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Demo Section */}
        <Card className="mt-8 border border-zinc-800/50 bg-zinc-900/30 backdrop-blur-sm">
          <CardContent className="p-4">
            <div className="text-center mb-3">
              <h3 className="text-sm font-medium text-zinc-200">New to our platform?</h3>
              <p className="text-xs text-zinc-400">Create an account to get started</p>
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-zinc-300">
                <CheckCircle className="h-3 w-3 text-emerald-400" />
                <span>Access to premium fitness equipment</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-300">
                <CheckCircle className="h-3 w-3 text-emerald-400" />
                <span>Personal training sessions</span>
              </div>
              <div className="flex items-center gap-2 text-zinc-300">
                <CheckCircle className="h-3 w-3 text-emerald-400" />
                <span>Progress tracking and analytics</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sign up link */}
        <p className="text-center text-sm text-zinc-400 mt-8">
          Don't have an account?{" "}
          <Link
            href="/register"
            className="text-white hover:text-emerald-400 hover:underline font-medium transition-colors"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  )
}
