"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import {
  Search,
  Activity,
  CreditCard,
  Building,
  UserCheck,
  TrendingUp,
  TrendingDown,
  Target,
  Award,
  Zap,
  Heart,
  MapPin,
  Star,
  RefreshCw,
} from "lucide-react"
import { useAuth } from "@/hooks/use-auth"
import { useTheme } from "next-themes"

// Components
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { CoachOverview } from "@/components/dashboard/overview/coach-overview"
import { MemberOverview } from "@/components/dashboard/overview/member-overview"
import { ClientsTable } from "@/components/dashboard/clients/clients-table"
import { AddClientDialog } from "@/components/dashboard/clients/add-client-dialog"
import { PricingSection } from "@/components/dashboard/pricing/pricing-section"
import { useClientManagement } from "@/hooks/dashboard/use-client-management"
import { BillingSection } from "@/components/dashboard/billing/billing-section"
import { ActivitySection } from "@/components/dashboard/activity/activity-section"

// UI Components
// import { Button } from "@/components/ui/button" // Already imported
// import { Input } from "@/components/ui/input" // Already imported
// import { Label } from "@/components/ui/label" // Already imported
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog" // Already imported
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select" // Already imported
// import { Search, RefreshCw } from 'lucide-react' // Already imported
// import { toast } from "@/hooks/use-toast" // Already imported
import { getPlanPrice } from "@/lib/dashboard-utils"

type DashboardUser = {
  id: string
  email: string
  name: string
  role: "coach" | "member"
  gym?: string
  coach?: string
  currentPlan?: string
  joinDate?: string
  lastLogin?: string
  totalSessions?: number
  streak?: number
}

type Client = {
  _id: string
  firstName: string
  lastName: string
  email: string
  plan: string
  status: "active" | "inactive" | "pending"
  joinDate: string
  lastActive: string
  revenue: number
  coach: string
  coachName: string
  gym: string
  phone?: string
  age?: number
  goals?: string[]
  sessions?: number
  progress?: number
  createdAt: string
  updatedAt: string
}

type ActivityType = {
  _id: string
  userId: string
  userName: string
  userRole: "coach" | "member"
  action: string
  details: string
  metadata?: {
    duration?: string
    amount?: string
    time?: string
    badge?: string
    clientId?: string
    planFrom?: string
    planTo?: string
  }
  date: string
  createdAt: string
}

type Stats = {
  totalClients: { value: number; change: string; trend: "up" | "down" | "neutral" }
  activeClients: { value: number; change: string; trend: "up" | "down" | "neutral" }
  monthlyRevenue: { value: number; change: string; trend: "up" | "down" | "neutral" }
  pendingClients: { value: number; change: string; trend: "up" | "down" | "neutral" }
}

// Simulation d'une carte enregistrée
const mockPaymentMethod = {
  type: "Visa",
  last4: "4242",
  expiryMonth: "12",
  expiryYear: "2027",
  name: "John Doe",
}

export default function Dashboard() {
  const [loading, setLoading] = useState(true)
  const [loadingClients, setLoadingClients] = useState(false)
  const [loadingStats, setLoadingStats] = useState(false)
  const [clients, setClients] = useState<Client[]>([])
  const [activities, setActivities] = useState<ActivityType[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [user, setUser] = useState<DashboardUser | null>(null)
  const [activeTab, setActiveTab] = useState("overview")
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState<string>("all")
  const [isChangePlanOpen, setIsChangePlanOpen] = useState(false)
  const [selectedPlan, setSelectedPlan] = useState("")

  const { isAddClientOpen, setIsAddClientOpen, newClient, setNewClient } = useClientManagement(
    clients,
    setClients,
    stats,
    setStats,
    activities,
    setActivities,
  )

  const { logout } = useAuth()
  const router = useRouter()
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          credentials: "include",
        })

        if (response.ok) {
          const data = await response.json()
          if (data.user) {
            const userData = {
              ...data.user,
              gym: data.user.role === "member" ? "FitGym Center" : undefined,
              coach: data.user.role === "member" ? "Coach Martin" : undefined,
              currentPlan: data.user.role === "member" ? "Premium" : undefined,
              joinDate: "2024-01-15",
              lastLogin: "2024-01-25 14:30",
              totalSessions: data.user.role === "member" ? 24 : undefined,
              streak: data.user.role === "member" ? 7 : undefined,
            }
            setUser(userData)

            // Charger les données selon le rôle
            if (data.user.role === "coach") {
              await Promise.all([loadClients(), loadStats(), loadActivities()])
            } else {
              await loadActivities()
            }
          } else {
            router.push("/login")
          }
        } else {
          router.push("/login")
        }
      } catch (error) {
        console.error("Authentication check failed:", error)
        router.push("/login")
      } finally {
        setLoading(false)
      }
    }

    checkAuth()
  }, [router])

  const loadClients = async () => {
    setLoadingClients(true)
    try {
      const response = await fetch("/api/clients", {
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        setClients(data.clients || [])
      } else {
        console.error("Failed to load clients")
        toast({
          title: "Erreur",
          description: "Impossible de charger les clients",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Load clients error:", error)
      toast({
        title: "Erreur",
        description: "Erreur de connexion",
        variant: "destructive",
      })
    } finally {
      setLoadingClients(false)
    }
  }

  const loadStats = async () => {
    setLoadingStats(true)
    try {
      const response = await fetch("/api/stats", {
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
      } else {
        console.error("Failed to load stats")
      }
    } catch (error) {
      console.error("Load stats error:", error)
    } finally {
      setLoadingStats(false)
    }
  }

  const loadActivities = async () => {
    try {
      const response = await fetch("/api/activities?limit=10", {
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        setActivities(data.activities || [])
      } else {
        console.error("Failed to load activities")
      }
    } catch (error) {
      console.error("Load activities error:", error)
    }
  }

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId)

    // Mettre à jour la position de la bordure avec CSS
    const tabElement = document.querySelector(`[data-tab="${tabId}"]`) as HTMLElement
    const navElement = document.querySelector(".nav-container") as HTMLElement

    if (tabElement && navElement) {
      const tabRect = tabElement.getBoundingClientRect()
      const navRect = navElement.getBoundingClientRect()

      const left = tabRect.left - navRect.left
      const width = tabRect.width

      navElement.style.setProperty("--border-left", `${left}px`)
      navElement.style.setProperty("--border-width", `${width}px`)
    }
  }

  useEffect(() => {
    // Initialiser la position de la bordure
    if (user) {
      setTimeout(() => handleTabChange(activeTab), 100)
    }
  }, [user, activeTab])

  const handleDeleteClient = async (clientId: string) => {
    try {
      const response = await fetch(`/api/clients/${clientId}`, {
        method: "DELETE",
        credentials: "include",
      })

      if (response.ok) {
        setClients(clients.filter((client) => client._id !== clientId))
        toast({
          title: "Succès",
          description: "Client supprimé avec succès",
        })
        // Recharger les stats
        await loadStats()
      } else {
        const data = await response.json()
        toast({
          title: "Erreur",
          description: data.message || "Erreur lors de la suppression",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Delete client error:", error)
      toast({
        title: "Erreur",
        description: "Erreur de connexion",
        variant: "destructive",
      })
    }
  }

  const handleAddClient = async () => {
    if (!newClient.firstName || !newClient.lastName || !newClient.email || !newClient.plan) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("/api/clients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(newClient),
      })

      const data = await response.json()

      if (response.ok) {
        setClients([data.client, ...clients])
        setNewClient({
          firstName: "",
          lastName: "",
          email: "",
          plan: "",
          phone: "",
          age: "",
          goals: ["Fitness"],
        })
        setIsAddClientOpen(false)
        toast({
          title: "Succès",
          description: "Client ajouté avec succès",
        })
        // Recharger les stats
        await loadStats()
      } else {
        toast({
          title: "Erreur",
          description: data.message || "Erreur lors de l'ajout",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Add client error:", error)
      toast({
        title: "Erreur",
        description: "Erreur de connexion",
        variant: "destructive",
      })
    }
  }

  const handleChangePlan = async () => {
    if (selectedPlan && user) {
      // Créer une activité pour le changement de plan
      try {
        await fetch("/api/activities", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
          body: JSON.stringify({
            action: "Plan modifié",
            details: `${user.currentPlan} → ${selectedPlan}`,
            metadata: {
              planFrom: user.currentPlan,
              planTo: selectedPlan,
              amount: `$${getPlanPrice(selectedPlan).toFixed(2)}`,
            },
          }),
        })

        setUser({ ...user, currentPlan: selectedPlan })
        setIsChangePlanOpen(false)
        setSelectedPlan("")
        toast({
          title: "Succès",
          description: "Plan modifié avec succès",
        })
        await loadActivities()
      } catch (error) {
        console.error("Change plan error:", error)
        toast({
          title: "Erreur",
          description: "Erreur lors du changement de plan",
          variant: "destructive",
        })
      }
    }
  }

  const handlePlanChangeFromPricing = (plan: string) => {
    setUser((prev) => (prev ? { ...prev, currentPlan: plan } : null))
    // Optionally create activity log here too
    loadActivities()
  }

  const filteredClients = clients.filter((client) => {
    const matchesSearch =
      client.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.email.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesFilter = filterStatus === "all" || client.status === filterStatus

    return matchesSearch && matchesFilter
  })

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return (
          <Badge className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 hover:bg-green-100 dark:hover:bg-green-900 border-0">
            Active
          </Badge>
        )
      case "inactive":
        return (
          <Badge className="bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-100 hover:bg-red-100 dark:hover:bg-red-900 border-0">
            Inactive
          </Badge>
        )
      case "pending":
        return (
          <Badge className="bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100 hover:bg-yellow-100 dark:hover:bg-yellow-900 border-0">
            Pending
          </Badge>
        )
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getPlanBadge = (plan: string) => {
    const colors = {
      Basic: "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100 border-blue-200 dark:border-blue-800",
      Premium:
        "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-100 border-purple-200 dark:border-purple-800",
      Pro: "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-100 border-orange-200 dark:border-orange-800",
    }
    return (
      <Badge
        className={`${colors[plan as keyof typeof colors] || "bg-zinc-100/50 dark:bg-zinc-800/50 text-zinc-900 dark:text-zinc-100 border-zinc-200/50 dark:border-zinc-800/50"} hover:bg-opacity-80 transition-colors`}
      >
        {plan}
      </Badge>
    )
  }

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "clients", label: user?.role === "coach" ? "Clients" : "My Membership" },
    { id: "pricing", label: "Pricing" },
    { id: "billing", label: "Billing" },
    { id: "activity", label: "Activity" },
  ]

  const renderMemberView = () => (
    <div className="space-y-8">
      {/* Member Info */}
      <Card className="border-zinc-200/50 dark:border-zinc-800/50">
        <CardHeader>
          <CardTitle className="text-lg font-medium text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Heart className="h-5 w-5 text-red-500 dark:text-red-400" />
            Your Membership
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Building className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                <div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">Gym Location</p>
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">{user?.gym || "Loading..."}</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-500 flex items-center gap-1">
                    <MapPin className="h-3 w-3" />
                    123 Fitness Street, Paris
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <UserCheck className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                <div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">Your Coach</p>
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">{user?.coach || "Loading..."}</p>
                  <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-500">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    <span>4.9 rating • 5 years exp.</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <CreditCard className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                <div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">Current Plan</p>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">{user?.currentPlan || "Loading..."}</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setIsChangePlanOpen(true)}
                      className="h-6 px-2 text-xs"
                    >
                      Change
                    </Button>
                  </div>
                  <p className="text-xs text-zinc-500 dark:text-zinc-500">
                    ${getPlanPrice(user?.currentPlan || "").toFixed(2)}/month • Next billing: Feb 15
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Activity className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                <div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">Membership Status</p>
                  <Badge className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 hover:bg-green-100 dark:hover:bg-green-900 border-0">
                    Active
                  </Badge>
                  <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
                    Member since {user?.joinDate ? new Date(user.joinDate).toLocaleDateString() : "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Progress Section */}
          <div className="mt-6 pt-6 border-t border-zinc-200/50 dark:border-zinc-800/50">
            <h4 className="font-medium text-zinc-900 dark:text-zinc-100 mb-4">Your Progress</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                <Target className="h-8 w-8 text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">78%</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Goal Progress</p>
              </div>
              <div className="text-center p-4 bg-green-50 dark:bg-green-950 rounded-lg">
                <Zap className="h-8 w-8 text-green-600 dark:text-green-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">{user?.streak || 0}</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Day Streak</p>
              </div>
              <div className="text-center p-4 bg-purple-50 dark:bg-purple-950 rounded-lg">
                <Award className="h-8 w-8 text-purple-600 dark:text-purple-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{user?.totalSessions || 0}</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Total Sessions</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const renderCoachView = () => (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {loadingStats
          ? Array.from({ length: 4 }).map((_, index) => (
              <Card key={index} className="border-zinc-200/50 dark:border-zinc-800/50">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="space-y-2 flex-1">
                      <div className="h-4 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                      <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse" />
                      <div className="h-3 bg-zinc-200 dark:bg-zinc-800 rounded animate-pulse w-20" />
                    </div>
                    <div className="w-12 h-12 bg-zinc-200 dark:bg-zinc-800 rounded-full animate-pulse" />
                  </div>
                </CardContent>
              </Card>
            ))
          : stats?.map((stat, index) => {
              const IconComponent = stat.icon
              return (
                <Card
                  key={index}
                  className="border-zinc-200/50 dark:border-zinc-800/50 hover:shadow-md transition-shadow"
                >
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="space-y-2">
                        <p className="text-sm text-zinc-600 dark:text-zinc-400">{stat.label}</p>
                        <p className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">{stat.value}</p>
                        <div className="flex items-center gap-1">
                          {stat.trend === "up" ? (
                            <TrendingUp className="h-3 w-3 text-green-600 dark:text-green-400" />
                          ) : stat.trend === "down" ? (
                            <TrendingDown className="h-3 w-3 text-red-600 dark:text-red-400" />
                          ) : null}
                          <span
                            className={`text-xs ${
                              stat.trend === "up"
                                ? "text-green-600 dark:text-green-400"
                                : stat.trend === "down"
                                  ? "text-red-600 dark:text-red-400"
                                  : "text-zinc-600 dark:text-zinc-400"
                            }`}
                          >
                            {stat.change}
                          </span>
                        </div>
                      </div>
                      <div className={`p-3 rounded-full bg-zinc-50/50 dark:bg-zinc-900/50`}>
                        <IconComponent className={`h-6 w-6 ${stat.color}`} />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="border-zinc-200/50 dark:border-zinc-800/50">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-zinc-900 dark:text-zinc-100 flex items-center justify-between">
              Recent Activity
              <Button
                variant="ghost"
                size="sm"
                onClick={loadActivities}
                className="h-8 w-8 p-0"
                title="Refresh activities"
              >
                <RefreshCw className="h-4 w-4" />
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activities.length === 0 ? (
                <p className="text-sm text-zinc-500 dark:text-zinc-500 text-center py-4">Aucune activité récente</p>
              ) : (
                activities.slice(0, 3).map((activity, index) => (
                  <div
                    key={activity._id}
                    className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors"
                  >
                    <div className="w-2 h-2 bg-blue-600 dark:bg-blue-400 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100">{activity.action}</p>
                      <p className="text-xs text-zinc-600 dark:text-zinc-400">{activity.details}</p>
                    </div>
                    <span className="text-xs text-zinc-500 dark:text-zinc-500">
                      {new Date(activity.date).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200/50 dark:border-zinc-800/50">
          <CardHeader>
            <CardTitle className="text-lg font-medium text-zinc-900 dark:text-zinc-100">Performance</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-zinc-600 dark:text-zinc-400">Client Retention</span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">94%</span>
                </div>
                <Progress value={94} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-zinc-600 dark:text-zinc-400">Monthly Goal</span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">78%</span>
                </div>
                <Progress value={78} className="h-2" />
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-zinc-600 dark:text-zinc-400">Session Completion</span>
                  <span className="font-medium text-zinc-900 dark:text-zinc-100">89%</span>
                </div>
                <Progress value={89} className="h-2" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )

  const renderClients = () => {
    if (user?.role !== "coach") {
      return <MemberOverview user={user} onChangePlan={() => setIsChangePlanOpen(true)} />
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">Client Management</h1>
            <p className="text-zinc-600 dark:text-zinc-400 mt-1">Manage your members and track their progress</p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={loadClients}
              disabled={loadingClients}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`h-4 w-4 ${loadingClients ? "animate-spin" : ""}`} />
              Refresh
            </Button>
            <AddClientDialog
              isOpen={isAddClientOpen}
              onOpenChange={setIsAddClientOpen}
              newClient={newClient}
              onClientChange={setNewClient}
              onAddClient={handleAddClient}
            />
          </div>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <Input
                placeholder="Search clients by name, email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 border-zinc-200/50 dark:border-zinc-800/50 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20 focus:ring-0 transition-colors"
              />
            </div>
          </div>
          <div className="flex gap-2">
            {["all", "active", "inactive", "pending"].map((status) => (
              <Button
                key={status}
                variant={filterStatus === status ? "default" : "outline"}
                onClick={() => setFilterStatus(status)}
                className={
                  filterStatus === status
                    ? "bg-emerald-500 hover:bg-emerald-500/90 text-zinc-50 dark:text-zinc-900 transition-colors"
                    : "transition-colors"
                }
              >
                {status.charAt(0).toUpperCase() + status.slice(1)} (
                {status === "all" ? clients.length : clients.filter((c) => c.status === status).length})
              </Button>
            ))}
          </div>
        </div>

        <ClientsTable
          clients={clients}
          filteredClients={filteredClients}
          loadingClients={loadingClients}
          onDeleteClient={handleDeleteClient}
        />
      </div>
    )
  }

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center">
        <div className="text-center">
          <div
            className="w-8 h-8 bg-emerald-400 mx-auto mb-4 animate-pulse"
            style={{ clipPath: "polygon(50% 0%, 0% 100%, 100% 100%)" }}
          />
          <p className="text-zinc-600 dark:text-zinc-400">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <DashboardHeader user={user} tabs={tabs} activeTab={activeTab} onTabChange={handleTabChange} />

      {/* Change Plan Dialog */}
      <Dialog open={isChangePlanOpen} onOpenChange={setIsChangePlanOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Change Your Plan</DialogTitle>
            <DialogDescription>
              Select a new plan. Changes will take effect at your next billing cycle.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="newPlan">Select Plan</Label>
              <Select value={selectedPlan} onValueChange={setSelectedPlan}>
                <SelectTrigger className="focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20">
                  <SelectValue placeholder="Choose a plan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Basic">Basic - $9.99/month</SelectItem>
                  <SelectItem value="Premium">Premium - $29.99/month</SelectItem>
                  <SelectItem value="Pro">Pro - $49.99/month</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {selectedPlan && (
              <div className="p-4 bg-zinc-50/50 dark:bg-zinc-900/50 rounded-lg">
                <h4 className="font-medium text-zinc-900 dark:text-zinc-100 mb-2">Plan Change Summary</h4>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-600 dark:text-zinc-400">Current plan:</span>
                    <span className="text-zinc-900 dark:text-zinc-100">{user?.currentPlan}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-600 dark:text-zinc-400">New plan:</span>
                    <span className="text-zinc-900 dark:text-zinc-100">{selectedPlan}</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span className="text-zinc-600 dark:text-zinc-400">New monthly cost:</span>
                    <span className="text-zinc-900 dark:text-zinc-100">${getPlanPrice(selectedPlan).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsChangePlanOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleChangePlan}
              className="bg-emerald-500 hover:bg-emerald-500/90 text-zinc-50 dark:text-zinc-900 transition-colors"
              disabled={!selectedPlan}
            >
              Confirm Change
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Main Content */}
      <main className="p-6">
        <div className="max-w-7xl mx-auto">
          {activeTab === "overview" &&
            (user?.role === "coach" ? (
              <CoachOverview
                stats={stats}
                activities={activities}
                loadingStats={loadingStats}
                loadActivities={loadActivities}
              />
            ) : (
              <MemberOverview user={user} onChangePlan={() => setIsChangePlanOpen(true)} />
            ))}
          {activeTab === "clients" && renderClients()}
          {activeTab === "pricing" && user && <PricingSection user={user} onPlanChange={handlePlanChangeFromPricing} />}
          {activeTab === "billing" && user && <BillingSection user={user} />}
          {activeTab === "activity" && user && <ActivitySection user={user} />}
        </div>
      </main>
    </div>
  )
}