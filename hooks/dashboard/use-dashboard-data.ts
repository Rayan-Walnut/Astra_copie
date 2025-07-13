"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { toast } from "@/hooks/use-toast"
import type { DashboardUser, Client, ActivityType, Stats } from "@/types/dashboard"

export function useDashboardData() {
  const [user, setUser] = useState<DashboardUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [clients, setClients] = useState<Client[]>([])
  const [activities, setActivities] = useState<ActivityType[]>([])
  const [stats, setStats] = useState<Stats | null>(null)
  const [loadingClients, setLoadingClients] = useState(false)
  const [loadingStats, setLoadingStats] = useState(false)
  const router = useRouter()

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

  useEffect(() => {
    checkAuth()
  }, [])

  return {
    user,
    setUser,
    loading,
    clients,
    setClients,
    activities,
    stats,
    loadingClients,
    loadingStats,
    loadClients,
    loadStats,
    loadActivities,
  }
}
