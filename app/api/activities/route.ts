import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import connectDB from "@/lib/mongodb"
import Activity from "@/models/Activity"
import User from "@/models/User"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

// GET - Récupérer les activités de l'utilisateur
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

    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get("limit") || "20")
    const type = searchParams.get("type")
    const dateFilter = searchParams.get("date")
    const search = searchParams.get("search")

    let query: any = { userId: user._id }

    // Filtre par type
    if (type && type !== "all") {
      query.type = type
    }

    // Filtre par date
    if (dateFilter && dateFilter !== "all") {
      const now = new Date()
      let startDate: Date

      switch (dateFilter) {
        case "today":
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate())
          break
        case "week":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          break
        case "month":
          startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          break
        default:
          startDate = new Date(0)
      }

      query.date = { $gte: startDate }
    }

    // Filtre par recherche textuelle
    if (search) {
      query.$or = [
        { action: { $regex: search, $options: "i" } },
        { details: { $regex: search, $options: "i" } },
        { userName: { $regex: search, $options: "i" } },
      ]
    }

    const activities = await Activity.find(query)
      .sort({ date: -1 })
      .limit(limit)

    // Statistiques pour le dashboard
    const stats = {
      total: await Activity.countDocuments({ userId: user._id }),
      workouts: await Activity.countDocuments({ userId: user._id, type: "workout" }),
      achievements: await Activity.countDocuments({ userId: user._id, type: "achievement" }),
      today: await Activity.countDocuments({ 
        userId: user._id, 
        date: { 
          $gte: new Date(new Date().setHours(0, 0, 0, 0)) 
        } 
      }),
    }

    return NextResponse.json({
      success: true,
      activities: activities,
      stats: stats,
      count: activities.length,
    })
  } catch (error: any) {
    console.error("Get activities error:", error)
    return NextResponse.json(
      { success: false, message: "Erreur lors de la récupération des activités" },
      { status: 500 }
    )
  }
}

// POST - Créer une nouvelle activité
export async function POST(request: NextRequest) {
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

    const { action, details, type, metadata } = await request.json()

    if (!action || !details || !type) {
      return NextResponse.json({ 
        success: false, 
        message: "Action, détails et type sont requis" 
      }, { status: 400 })
    }

    const activity = new Activity({
      userId: user._id,
      userName: user.name,
      userRole: user.role,
      action,
      details,
      type,
      metadata: metadata || {},
    })

    await activity.save()

    return NextResponse.json({
      success: true,
      message: "Activité créée avec succès",
      activity: activity,
    })
  } catch (error: any) {
    console.error("Create activity error:", error)
    return NextResponse.json({ 
      success: false, 
      message: "Erreur lors de la création de l'activité" 
    }, { status: 500 })
  }
}