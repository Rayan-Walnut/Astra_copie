import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import connectDB from "@/lib/mongodb"
import Client from "@/models/Client"
import User from "@/models/User"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

// GET - Récupérer les statistiques du coach
export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")?.value

    if (!token) {
      return NextResponse.json({ success: false, message: "Non authentifié" }, { status: 401 })
    }

    const decoded = jwt.verify(token, JWT_SECRET) as any
    const user = await User.findById(decoded.userId).select("-password")

    if (!user) {
      return NextResponse.json({ success: false, message: "Utilisateur non trouvé" }, { status: 404 })
    }

    if (user.role !== "coach") {
      return NextResponse.json({ success: false, message: "Accès refusé - Coach uniquement" }, { status: 403 })
    }

    // Récupérer les statistiques
    const totalClients = await Client.countDocuments({ coach: user._id })
    const activeClients = await Client.countDocuments({ coach: user._id, status: "active" })
    const pendingClients = await Client.countDocuments({ coach: user._id, status: "pending" })

    // Calculer le revenu total
    const revenueResult = await Client.aggregate([
      { $match: { coach: user._id, status: "active" } },
      { $group: { _id: null, totalRevenue: { $sum: "$revenue" } } },
    ])

    const monthlyRevenue = revenueResult.length > 0 ? revenueResult[0].totalRevenue : 0

    // Calculer les pourcentages de changement (simulés pour l'instant)
    const stats = {
      totalClients: {
        value: totalClients,
        change: "+12%",
        trend: "up" as const,
      },
      activeClients: {
        value: activeClients,
        change: "+8%",
        trend: "up" as const,
      },
      monthlyRevenue: {
        value: monthlyRevenue,
        change: "+15%",
        trend: "up" as const,
      },
      pendingClients: {
        value: pendingClients,
        change: "-5%",
        trend: "down" as const,
      },
    }

    return NextResponse.json({
      success: true,
      stats: stats,
    })
  } catch (error: any) {
    console.error("Get stats error:", error)
    return NextResponse.json(
      { success: false, message: "Erreur lors de la récupération des statistiques" },
      { status: 500 },
    )
  }
}