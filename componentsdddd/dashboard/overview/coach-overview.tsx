"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { TrendingUp, TrendingDown, RefreshCw } from "lucide-react"
import type { Stats, ActivityType } from "@/types/dashboard"

interface CoachOverviewProps {
  stats: Stats | null
  activities: ActivityType[]
  loadingStats: boolean
  loadActivities: () => Promise<void>
}

export function CoachOverview({ stats, activities, loadingStats, loadActivities }: CoachOverviewProps) {
  const dashboardStats = stats
    ? [
        {
          label: "Total Clients",
          value: stats.totalClients.value.toString(),
          change: stats.totalClients.change,
          trend: stats.totalClients.trend,
          icon: "Users",
          color: "text-blue-600 dark:text-blue-400",
        },
        {
          label: "Active Members",
          value: stats.activeClients.value.toString(),
          change: stats.activeClients.change,
          trend: stats.activeClients.trend,
          icon: "UserCheck",
          color: "text-green-600 dark:text-green-400",
        },
        {
          label: "Monthly Revenue",
          value: `$${stats.monthlyRevenue.value.toFixed(2)}`,
          change: stats.monthlyRevenue.change,
          trend: stats.monthlyRevenue.trend,
          icon: "DollarSign",
          color: "text-emerald-600 dark:text-emerald-400",
        },
        {
          label: "Pending Reviews",
          value: stats.pendingClients.value.toString(),
          change: stats.pendingClients.change,
          trend: stats.pendingClients.trend,
          icon: "Clock",
          color: "text-orange-600 dark:text-orange-400",
        },
      ]
    : []

  return (
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
          : dashboardStats.map((stat, index) => (
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
                    <div className="p-3 rounded-full bg-zinc-50/50 dark:bg-zinc-900/50">
                      <div className={`h-6 w-6 ${stat.color} bg-current rounded`} />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
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
                activities.slice(0, 3).map((activity) => (
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
}