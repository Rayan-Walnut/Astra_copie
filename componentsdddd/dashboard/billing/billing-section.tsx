"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { CreditCard, Download, Plus, Trash2, Calendar, DollarSign, CheckCircle, AlertCircle, Edit, Eye, FileText, Wallet, Shield, Clock, Loader2 } from 'lucide-react'
import { toast } from "@/hooks/use-toast"
import type { DashboardUser } from "@/types/dashboard"

interface BillingSectionProps {
  user: DashboardUser
}

type PaymentMethod = {
  _id: string
  type: "visa" | "mastercard" | "amex" | "paypal"
  last4?: string
  expiryMonth?: string
  expiryYear?: string
  name: string
  email?: string
  isDefault: boolean
}

type Invoice = {
  _id: string
  invoiceNumber: string
  amount: number
  status: "paid" | "pending" | "failed" | "cancelled"
  plan: string
  period: string
  createdAt: string
  dueDate: string
  paidDate?: string
}

export function BillingSection({ user }: BillingSectionProps) {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([])
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isAddPaymentOpen, setIsAddPaymentOpen] = useState(false)
  const [loading, setLoading] = useState<string | null>(null)
  const [loadingData, setLoadingData] = useState(true)

  const [newPaymentMethod, setNewPaymentMethod] = useState({
    type: "",
    cardNumber: "",
    expiryMonth: "",
    expiryYear: "",
    cvv: "",
    name: "",
    email: "",
  })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoadingData(true)
    try {
      await Promise.all([loadPaymentMethods(), loadInvoices()])
    } catch (error) {
      console.error("Error loading billing data:", error)
    } finally {
      setLoadingData(false)
    }
  }

  const loadPaymentMethods = async () => {
    try {
      const response = await fetch("/api/payment-methods", {
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        setPaymentMethods(data.paymentMethods || [])
      } else {
        console.error("Failed to load payment methods")
      }
    } catch (error) {
      console.error("Load payment methods error:", error)
    }
  }

  const loadInvoices = async () => {
    try {
      const response = await fetch("/api/invoices", {
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        setInvoices(data.invoices || [])
      } else {
        console.error("Failed to load invoices")
      }
    } catch (error) {
      console.error("Load invoices error:", error)
    }
  }

  const getCardIcon = (type: string) => {
    const icons = {
      visa: "💳",
      mastercard: "💳",
      amex: "💳",
      paypal: "🅿️",
    }
    return icons[type as keyof typeof icons] || "💳"
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <Badge className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 border-green-200 dark:border-green-800">
            <CheckCircle className="h-3 w-3 mr-1" />
            Paid
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100 border-yellow-200 dark:border-yellow-800">
            <Clock className="h-3 w-3 mr-1" />
            Pending
          </Badge>
        )
      case "failed":
        return (
          <Badge className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 border-red-200 dark:border-red-800">
            <AlertCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        )
      case "cancelled":
        return (
          <Badge className="bg-zinc-100 dark:bg-zinc-900 text-zinc-800 dark:text-zinc-100 border-zinc-200 dark:border-zinc-800">
            Cancelled
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const handleAddPaymentMethod = async () => {
    if (!newPaymentMethod.type || !newPaymentMethod.name) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      })
      return
    }

    if (
      newPaymentMethod.type !== "paypal" &&
      (!newPaymentMethod.cardNumber ||
        !newPaymentMethod.expiryMonth ||
        !newPaymentMethod.expiryYear ||
        !newPaymentMethod.cvv)
    ) {
      toast({
        title: "Error",
        description: "Please fill in all card details",
        variant: "destructive",
      })
      return
    }

    setLoading("add")

    try {
      const response = await fetch("/api/payment-methods", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(newPaymentMethod),
      })

      const data = await response.json()

      if (response.ok) {
        await loadPaymentMethods()
        setNewPaymentMethod({
          type: "",
          cardNumber: "",
          expiryMonth: "",
          expiryYear: "",
          cvv: "",
          name: "",
          email: "",
        })
        setIsAddPaymentOpen(false)

        toast({
          title: "Success",
          description: "Payment method added successfully",
        })
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to add payment method",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error occurred",
        variant: "destructive",
      })
    } finally {
      setLoading(null)
    }
  }

  const handleDeletePaymentMethod = async (id: string) => {
    setLoading(id)

    try {
      const response = await fetch(`/api/payment-methods/${id}`, {
        method: "DELETE",
        credentials: "include",
      })

      const data = await response.json()

      if (response.ok) {
        await loadPaymentMethods()
        toast({
          title: "Success",
          description: "Payment method removed successfully",
        })
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to remove payment method",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error occurred",
        variant: "destructive",
      })
    } finally {
      setLoading(null)
    }
  }

  const handleSetDefault = async (id: string) => {
    setLoading(id)

    try {
      const response = await fetch(`/api/payment-methods/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({ setAsDefault: true }),
      })

      const data = await response.json()

      if (response.ok) {
        await loadPaymentMethods()
        toast({
          title: "Success",
          description: "Default payment method updated",
        })
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to update default payment method",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error occurred",
        variant: "destructive",
      })
    } finally {
      setLoading(null)
    }
  }

  const handleDownloadInvoice = async (invoice: Invoice) => {
    try {
      const response = await fetch(`/api/invoices/${invoice._id}/download`, {
        credentials: "include",
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Download Started",
          description: `Downloading invoice ${invoice.invoiceNumber}`,
        })
      } else {
        toast({
          title: "Error",
          description: data.message || "Failed to download invoice",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Network error occurred",
        variant: "destructive",
      })
    }
  }

  if (loadingData) {
    return (
      <div className="space-y-8">
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-zinc-600 dark:text-zinc-400" />
          <p className="text-zinc-600 dark:text-zinc-400">Loading billing information...</p>
        </div>
      </div>
    )
  }

  // Calculer les statistiques de facturation
  const totalPaid = invoices
    .filter(inv => inv.status === "paid")
    .reduce((sum, inv) => sum + inv.amount, 0)

  const thisMonthPaid = invoices
    .filter(inv => {
      const invDate = new Date(inv.createdAt)
      const now = new Date()
      return inv.status === "paid" && 
             invDate.getMonth() === now.getMonth() && 
             invDate.getFullYear() === now.getFullYear()
    })
    .reduce((sum, inv) => sum + inv.amount, 0)

  const yearToDatePaid = invoices
    .filter(inv => {
      const invDate = new Date(inv.createdAt)
      const now = new Date()
      return inv.status === "paid" && invDate.getFullYear() === now.getFullYear()
    })
    .reduce((sum, inv) => sum + inv.amount, 0)

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">Billing & Payments</h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400">
          Manage your payment methods, view invoices, and update billing information.
        </p>
      </div>

      {/* Current Plan & Next Billing */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-zinc-200/50 dark:border-zinc-800/50">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-green-600 dark:text-green-400" />
              Current Subscription
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-zinc-900 dark:text-zinc-100">{user?.currentPlan || "Premium"} Plan</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Monthly billing</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">$29.99</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">per month</p>
              </div>
            </div>
            <div className="pt-4 border-t border-zinc-200/50 dark:border-zinc-800/50">
              <div className="flex items-center justify-between text-sm">
                <span className="text-zinc-600 dark:text-zinc-400">Next billing date:</span>
                <span className="font-medium text-zinc-900 dark:text-zinc-100">February 15, 2024</span>
              </div>
              <div className="flex items-center justify-between text-sm mt-1">
                <span className="text-zinc-600 dark:text-zinc-400">Amount:</span>
                <span className="font-medium text-zinc-900 dark:text-zinc-100">$29.99</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200/50 dark:border-zinc-800/50">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              Billing Summary
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-600 dark:text-zinc-400">This month:</span>
                <span className="font-medium text-zinc-900 dark:text-zinc-100">${thisMonthPaid.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-600 dark:text-zinc-400">Year to date:</span>
                <span className="font-medium text-zinc-900 dark:text-zinc-100">${yearToDatePaid.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-600 dark:text-zinc-400">Total paid:</span>
                <span className="font-medium text-zinc-900 dark:text-zinc-100">${totalPaid.toFixed(2)}</span>
              </div>
            </div>
            <div className="pt-4 border-t border-zinc-200/50 dark:border-zinc-800/50">
              <Badge className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 border-green-200 dark:border-green-800">
                <CheckCircle className="h-3 w-3 mr-1" />
                Account in good standing
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Payment Methods */}
      <Card className="border-zinc-200/50 dark:border-zinc-800/50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Wallet className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              Payment Methods
            </CardTitle>
            <Dialog open={isAddPaymentOpen} onOpenChange={setIsAddPaymentOpen}>
              <DialogTrigger asChild>
                <Button className="bg-emerald-500 hover:bg-emerald-500/90 text-zinc-50 dark:text-zinc-900">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Payment Method
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Add Payment Method</DialogTitle>
                  <DialogDescription>Add a new payment method to your account.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="paymentType">Payment Type</Label>
                    <Select
                      value={newPaymentMethod.type}
                      onValueChange={(value) => setNewPaymentMethod({ ...newPaymentMethod, type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select payment type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="visa">Visa</SelectItem>
                        <SelectItem value="mastercard">Mastercard</SelectItem>
                        <SelectItem value="amex">American Express</SelectItem>
                        <SelectItem value="paypal">PayPal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {newPaymentMethod.type === "paypal" ? (
                    <div className="space-y-2">
                      <Label htmlFor="email">PayPal Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="your@email.com"
                        value={newPaymentMethod.email}
                        onChange={(e) => setNewPaymentMethod({ ...newPaymentMethod, email: e.target.value })}
                      />
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="cardNumber">Card Number</Label>
                        <Input
                          id="cardNumber"
                          placeholder="1234 5678 9012 3456"
                          value={newPaymentMethod.cardNumber}
                          onChange={(e) =>
                            setNewPaymentMethod({ ...newPaymentMethod, cardNumber: e.target.value.replace(/\s/g, "") })
                          }
                          maxLength={16}
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="expiryMonth">Month</Label>
                          <Select
                            value={newPaymentMethod.expiryMonth}
                            onValueChange={(value) => setNewPaymentMethod({ ...newPaymentMethod, expiryMonth: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="MM" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 12 }, (_, i) => (
                                <SelectItem key={i + 1} value={String(i + 1).padStart(2, "0")}>
                                  {String(i + 1).padStart(2, "0")}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="expiryYear">Year</Label>
                          <Select
                            value={newPaymentMethod.expiryYear}
                            onValueChange={(value) => setNewPaymentMethod({ ...newPaymentMethod, expiryYear: value })}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="YYYY" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 10 }, (_, i) => (
                                <SelectItem key={2024 + i} value={String(2024 + i)}>
                                  {2024 + i}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="cvv">CVV</Label>
                          <Input
                            id="cvv"
                            placeholder="123"
                            value={newPaymentMethod.cvv}
                            onChange={(e) => setNewPaymentMethod({ ...newPaymentMethod, cvv: e.target.value })}
                            maxLength={4}
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="name">Cardholder Name</Label>
                    <Input
                      id="name"
                      placeholder="John Doe"
                      value={newPaymentMethod.name}
                      onChange={(e) => setNewPaymentMethod({ ...newPaymentMethod, name: e.target.value })}
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsAddPaymentOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleAddPaymentMethod}
                    disabled={loading === "add"}
                    className="bg-emerald-500 hover:bg-emerald-500/90 text-zinc-50 dark:text-zinc-900"
                  >
                    {loading === "add" ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Adding...
                      </div>
                    ) : (
                      "Add Payment Method"
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {paymentMethods.map((method) => (
              <div
                key={method._id}
                className="flex items-center justify-between p-4 border border-zinc-200/50 dark:border-zinc-800/50 rounded-lg hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className="text-2xl">{getCardIcon(method.type)}</div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-zinc-900 dark:text-zinc-100 capitalize">
                        {method.type} {method.last4 && `•••• ${method.last4}`}
                      </p>
                      {method.isDefault && (
                        <Badge className="bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 border-blue-200 dark:border-blue-800">
                          Default
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      {method.email || method.name}
                      {method.expiryMonth &&
                        method.expiryYear &&
                        ` • Expires ${method.expiryMonth}/${method.expiryYear}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {!method.isDefault && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSetDefault(method._id)}
                      disabled={loading === method._id}
                    >
                      {loading === method._id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        "Set Default"
                      )}
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeletePaymentMethod(method._id)}
                    disabled={loading === method._id || method.isDefault}
                    className="h-8 w-8 p-0 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                  >
                    {loading === method._id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            ))}
            {paymentMethods.length === 0 && (
              <div className="text-center py-8">
                <CreditCard className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">No payment methods</h3>
                <p className="text-zinc-600 dark:text-zinc-400">Add a payment method to continue your subscription.</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Billing History */}
      <Card className="border-zinc-200/50 dark:border-zinc-800/50">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <FileText className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            Billing History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">No invoices yet</h3>
              <p className="text-zinc-600 dark:text-zinc-400">Your billing history will appear here.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="border-b border-zinc-200/50 dark:border-zinc-800/50">
                  <TableHead className="font-medium text-zinc-900 dark:text-zinc-100">Invoice</TableHead>
                  <TableHead className="font-medium text-zinc-900 dark:text-zinc-100">Date</TableHead>
                  <TableHead className="font-medium text-zinc-900 dark:text-zinc-100">Plan</TableHead>
                  <TableHead className="font-medium text-zinc-900 dark:text-zinc-100">Amount</TableHead>
                  <TableHead className="font-medium text-zinc-900 dark:text-zinc-100">Status</TableHead>
                  <TableHead className="font-medium text-zinc-900 dark:text-zinc-100 text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoices.map((invoice) => (
                  <TableRow
                    key={invoice._id}
                    className="border-b border-zinc-100/50 dark:border-zinc-900/50 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors"
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium text-zinc-900 dark:text-zinc-100">{invoice.invoiceNumber}</p>
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">{invoice.period}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-zinc-400" />
                        <span className="text-zinc-900 dark:text-zinc-100">
                          {new Date(invoice.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="border-zinc-200 dark:border-zinc-800">
                        {invoice.plan}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium text-zinc-900 dark:text-zinc-100">${invoice.amount}</span>
                    </TableCell>
                    <TableCell>{getStatusBadge(invoice.status)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <Eye className="h-4 w-4" />
                        </Button>
                        {invoice.status === "paid" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDownloadInvoice(invoice)}
                            className="h-8 w-8 p-0"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}