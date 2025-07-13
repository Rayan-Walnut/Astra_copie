import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

export async function POST(request: NextRequest) {
  try {
    // Connect to database
    await connectDB()

    const { email, password, role } = await request.json()

    // Validation des champs
    if (!email || !password || !role) {
      return NextResponse.json(
        {
          success: false,
          message: "Email, mot de passe et rôle sont requis",
        },
        { status: 400 },
      )
    }

    // Recherche de l'utilisateur
    const user = await User.findOne({
      email: email.toLowerCase(),
      role: role,
    })

    if (!user) {
      return NextResponse.json(
        {
          success: false,
          message: "Email ou mot de passe incorrect",
        },
        { status: 401 },
      )
    }

    // Vérification du mot de passe
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      return NextResponse.json(
        {
          success: false,
          message: "Email ou mot de passe incorrect",
        },
        { status: 401 },
      )
    }

    // Création du token JWT
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "7d" },
    )

    // Création de la session
    const cookieStore = await cookies()
    cookieStore.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 jours
      sameSite: "lax",
    })

    // Retourner les données utilisateur (sans le mot de passe)
    const userResponse = {
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
    }

    return NextResponse.json({
      success: true,
      message: "Connexion réussie",
      user: userResponse,
    })
  } catch (error: any) {
    console.error("Login error:", error)
    return NextResponse.json(
      {
        success: false,
        message: "Erreur serveur lors de la connexion",
      },
      { status: 500 },
    )
  }
}