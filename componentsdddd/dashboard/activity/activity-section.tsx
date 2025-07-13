"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Activity,
  Search,
  Filter,
  Calendar,
  User,
  CreditCard,
  UserPlus,
  Settings,
  Award,
  Zap,
  Clock,
  TrendingUp,
  RefreshCw,
  Download,
  Eye,
  DollarSign,
  Loader2,
} from "lucide-react"
import { toast } from "@/hooks/use-toast"
import type { DashboardUser, ActivityType } from "@/types/dashboard"

interface ActivitySectionProps {
  user: DashboardUser
}

export function ActivitySection({ user }: ActivitySectionProps) {
  const [activities, setActivities] = useState<ActivityType[]>([])
  const [filteredActivities, setFilteredActivities] = useState<ActivityType[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [filterDate, setFilterDate] = useState("all")
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    workouts: 0,
    achievements: 0,
    today: 0,
  })

  useEffect(() => {
    loadActivities()
  }, [])

  useEffect(() => {
    filterActivities()
  }, [searchTerm, filterType, filterDate, activities])

  const loadActivities = async () => {
    setLoadingData(true)
    try {
      const params = new URLSearchParams({
        limit: "50",
        ...(filterType !== "all" && { type: filterType }),
        ...(filterDate !== "all" && { date: filterDate }),
        ...(searchTerm && { search: searchTerm }),
      })

      const response = await fetch(`/api/activities?${params}`, {
        credentials: "include",
      })

      if (response.ok) {
        const data = await response.json()
        setActivities(data.activities || [])
        setStats(data.stats || { total: 0, workouts: 0, achievements: 0, today: 0 })
      } else {
        console.error("Failed to load activities")
        toast({
          title: "Error",
          description: "Failed to load activities",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Load activities error:", error)
      toast({
        title: "Error",
        description: "Network error occurred",
        variant: "destructive",
      })
    } finally {
      setLoadingData(false)
    }
  }

  const filterActivities = () => {
    let filtered = activities

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (activity) =>
          activity.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
          activity.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
          activity.userName.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Type filter
    if (filterType !== "all") {
      filtered = filtered.filter((activity) => activity.type === filterType)
    }

    // Date filter
    if (filterDate !== "all") {
      const now = new Date()
      filtered = filtered.filter((activity) => {
        const date = new Date(activity.date)
        switch (filterDate) {
          case "today":
            return date.toDateString() === now.toDateString()
          case "week":
            const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
            return date >= weekAgo
          case "month":
            const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
            return date >= monthAgo
          default:
            return true
        }
      })
    }

    setFilteredActivities(filtered)
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case "workout":
      case "session":
        return <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
      case "payment":
      case "plan":
        return <CreditCard className="h-5 w-5 text-green-600 dark:text-green-400" />
      case "achievement":
        return <Award className="h-5 w-5 text-purple-600 dark:text-purple-400" />
      case "client":
        return <UserPlus className="h-5 w-5 text-orange-600 dark:text-orange-400" />
      case "profile":
        return <Settings className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
      default:
        return <Activity className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case "workout":
      case "session":
        return "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800"
      case "payment":
      case "plan":
        return "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800"
      case "achievement":
        return "bg-purple-50 dark:bg-purple-950 border-purple-200 dark:border-purple-800"
      case "client":
        return "bg-orange-50 dark:bg-orange-950 border-orange-200 dark:border-orange-800"
      default:
        return "bg-zinc-50 dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800"
    }
  }

  const handleRefresh = async () => {
    setLoading(true)
    try {
      await loadActivities()
      toast({
        title: "Success",
        description: "Activity feed refreshed",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to refresh activity feed",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleExport = () => {
    // Simulate export
    toast({
      title: "Export Started",
      description: "Your activity data is being exported",
    })
  }

  const formatTimeAgo = (date: string) => {
    const now = new Date()
    const activityDate = new Date(date)
    const diffInSeconds = Math.floor((now.getTime() - activityDate.getTime()) / 1000)

    if (diffInSeconds < 60) return "Just now"
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`
    return activityDate.toLocaleDateString()
  }

  if (loadingData) {
    return (
      <div className="space-y-8">
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-zinc-600 dark:text-zinc-400" />
          <p className="text-zinc-600 dark:text-zinc-400">Loading activities...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 mb-4">Activity Feed</h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Track all your activities, achievements, and account changes.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport} className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="border-zinc-200/50 dark:border-zinc-800/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-50 dark:bg-blue-950 rounded-full">
                <Zap className="h-5 w-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{stats.workouts}</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Workouts</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200/50 dark:border-zinc-800/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-50 dark:bg-purple-950 rounded-full">
                <Award className="h-5 w-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{stats.achievements}</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Achievements</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200/50 dark:border-zinc-800/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-50 dark:bg-green-950 rounded-full">
                <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">7</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Day Streak</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-zinc-200/50 dark:border-zinc-800/50">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-orange-50 dark:bg-orange-950 rounded-full">
                <Clock className="h-5 w-5 text-orange-600 dark:text-orange-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{stats.today}</p>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Today</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card className="border-zinc-200/50 dark:border-zinc-800/50">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
                <Input
                  placeholder="Search activities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 border-zinc-200/50 dark:border-zinc-800/50 focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[150px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="workout">Workouts</SelectItem>
                  <SelectItem value="payment">Payments</SelectItem>
                  <SelectItem value="achievement">Achievements</SelectItem>
                  <SelectItem value="profile">Profile</SelectItem>
                  <SelectItem value="client">Clients</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterDate} onValueChange={setFilterDate}>
                <SelectTrigger className="w-[150px]">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Date" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This Week</SelectItem>
                  <SelectItem value="month">This Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Activity Feed */}
      <Card className="border-zinc-200/50 dark:border-zinc-800/50">
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Activity className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            Recent Activity ({filteredActivities.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredActivities.length === 0 ? (
              <div className="text-center py-12">
                <Activity className="h-12 w-12 text-zinc-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100 mb-2">No activities found</h3>
                <p className="text-zinc-600 dark:text-zinc-400">
                  {searchTerm || filterType !== "all" || filterDate !== "all"
                    ? "Try adjusting your filters to see more activities."
                    : "Start using the platform to see your activity here."}
                </p>
              </div>
            ) : (
              filteredActivities.map((activity) => (
                <div
                  key={activity._id}
                  className={`p-4 rounded-lg border transition-colors hover:shadow-sm ${getActivityColor(activity.type || "default")}`}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0 mt-1">{getActivityIcon(activity.type || "default")}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium text-zinc-900 dark:text-zinc-100">{activity.action}</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-zinc-500 dark:text-zinc-500">
                            {formatTimeAgo(activity.date)}
                          </span>
                          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                            <Eye className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-2">{activity.details}</p>

                      {/* Metadata */}
                      {activity.metadata && (
                        <div className="flex flex-wrap gap-2">
                          {activity.metadata.duration && (
                            <Badge variant="outline" className="text-xs">
                              <Clock className="h-3 w-3 mr-1" />
                              {activity.metadata.duration}
                            </Badge>
                          )}
                          {activity.metadata.amount && (
                            <Badge variant="outline" className="text-xs">
                              <DollarSign className="h-3 w-3 mr-1" />
                              {activity.metadata.amount}
                            </Badge>
                          )}
                          {activity.metadata.badge && (
                            <Badge className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-100 text-xs">
                              <Award className="h-3 w-3 mr-1" />
                              {activity.metadata.badge}
                            </Badge>
                          )}
                          {activity.metadata.planFrom && activity.metadata.planTo && (
                            <Badge variant="outline" className="text-xs">
                              {activity.metadata.planFrom} → {activity.metadata.planTo}
                            </Badge>
                          )}
                        </div>
                      )}

                      {/* User info */}
                      <div className="flex items-center gap-2 mt-2 text-xs text-zinc-500 dark:text-zinc-500">
                        <User className="h-3 w-3" />
                        <span>{activity.userName}</span>
                        <Badge variant="outline" className="text-xs capitalize">
                          {activity.userRole}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}