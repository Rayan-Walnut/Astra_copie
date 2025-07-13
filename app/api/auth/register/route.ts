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

    const { email, password, confirmPassword, name, role } = await request.json()

    // Validation des champs
    if (!email || !password || !confirmPassword || !name || !role) {
      return NextResponse.json(
        {
          success: false,
          message: "Tous les champs sont requis",
        },
        { status: 400 },
      )
    }

    // Validation de l'email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          message: "Format d'email invalide",
        },
        { status: 400 },
      )
    }

    // Validation du mot de passe
    if (password.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: "Le mot de passe doit contenir au moins 6 caractères",
        },
        { status: 400 },
      )
    }

    // Vérification de la confirmation du mot de passe
    if (password !== confirmPassword) {
      return NextResponse.json(
        {
          success: false,
          message: "Les mots de passe ne correspondent pas",
        },
        { status: 400 },
      )
    }

    // Validation du rôle
    if (!["coach", "member"].includes(role)) {
      return NextResponse.json(
        {
          success: false,
          message: "Rôle invalide",
        },
        { status: 400 },
      )
    }

    // Vérification si l'utilisateur existe déjà
    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          message: "Un compte avec cet email existe déjà",
        },
        { status: 409 },
      )
    }

    // Création du nouvel utilisateur
    const newUser = new User({
      email: email.toLowerCase(),
      password, // Le mot de passe sera hashé automatiquement par le middleware
      name: name.trim(),
      role,
    })

    await newUser.save()

    // Création du token JWT
    const token = jwt.sign(
      {
        userId: newUser._id,
        email: newUser.email,
        role: newUser.role,
      },
      JWT_SECRET,
      { expiresIn: "7d" },
    )

    // Création de session automatique après inscription
    const cookieStore = await cookies()
    cookieStore.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7, // 7 jours
      sameSite: "lax",
    })

    // Retourner les données utilisateur (sans le mot de passe)
    const userResponse = {
      id: newUser._id,
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      createdAt: newUser.createdAt,
    }

    return NextResponse.json({
      success: true,
      message: "Compte créé avec succès",
      user: userResponse,
    })
  } catch (error: any) {
    console.error("Registration error:", error)

    // Gestion des erreurs de validation Mongoose
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err: any) => err.message)
      return NextResponse.json(
        {
          success: false,
          message: messages.join(", "),
        },
        { status: 400 },
      )
    }

    // Gestion des erreurs de duplication (email déjà existant)
    if (error.code === 11000) {
      return NextResponse.json(
        {
          success: false,
          message: "Un compte avec cet email existe déjà",
        },
        { status: 409 },
      )
    }

    return NextResponse.json(
      {
        success: false,
        message: "Erreur serveur lors de la création du compte",
      },
      { status: 500 },
    )
  }
}