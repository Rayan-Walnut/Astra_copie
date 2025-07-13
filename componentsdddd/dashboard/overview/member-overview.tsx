"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, Building, UserCheck, CreditCard, Activity, MapPin, Star, Target, Zap, Award } from 'lucide-react'
import { getPlanPrice } from "@/lib/dashboard-utils"
import type { DashboardUser } from "@/types/dashboard"

interface MemberOverviewProps {
  user: DashboardUser
  onChangePlan: () => void
}

export function MemberOverview({ user, onChangePlan }: MemberOverviewProps) {
  if (!user) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse">
          <div className="h-8 bg-zinc-200 dark:bg-zinc-800 rounded w-48 mb-4"></div>
          <div className="h-64 bg-zinc-200 dark:bg-zinc-800 rounded"></div>
        </div>
      </div>
    );
  }

  return (
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
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">{user?.gym || 'Loading...'}</p>
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
                  <p className="font-medium text-zinc-900 dark:text-zinc-100">{user?.coach || 'Loading...'}</p>
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
                    <p className="font-medium text-zinc-900 dark:text-zinc-100">{user?.currentPlan || 'Loading...'}</p>
                    <Button variant="outline" size="sm" onClick={onChangePlan} className="h-6 px-2 text-xs">
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
                    Member since {user?.joinDate ? new Date(user.joinDate).toLocaleDateString() : 'N/A'}
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
}
