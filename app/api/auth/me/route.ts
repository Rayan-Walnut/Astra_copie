import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

export async function GET(request: NextRequest) {
  try {
    // Connect to database
    await connectDB()

    const cookieStore = await cookies()
    const token = cookieStore.get("auth-token")?.value

    if (!token) {
      return NextResponse.json(
        {
          success: false,
          message: "Non authentifié",
        },
        { status: 401 },
      )
    }

    // Vérification du token JWT
    const decoded = jwt.verify(token, JWT_SECRET) as any

    // Recherche de l'utilisateur
    const user = await User.findById(decoded.userId).select("-password")

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Utilisateur non trouvé",
        },
        { status: 404 },
      )
    }

    // Retourner les données utilisateur
    const userResponse = {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
    }

    return NextResponse.json({
      success: true,
      user: userResponse,
    })
  } catch (error: any) {
    console.error("Auth verification error:", error)

    if (error.name === "JsonWebTokenError") {
      return NextResponse.json(
        {
          success: false,
          message: "Token invalide",
        },
        { status: 401 },
      )
    }

    return NextResponse.json(
      {
        success: false,
        message: "Erreur serveur lors de la vérification",
      },
      { status: 500 },
    )
  }
}