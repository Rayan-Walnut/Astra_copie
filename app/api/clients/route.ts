import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import connectDB from "@/lib/mongodb"
import Client from "@/models/Client"
import User from "@/models/User"
import Activity from "@/models/Activity"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

// GET - Récupérer tous les clients d'un coach
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

    // Récupérer tous les clients du coach
    const clients = await Client.find({ coach: user._id }).sort({ createdAt: -1 })

    return NextResponse.json({
      success: true,
      clients: clients,
      count: clients.length,
    })
  } catch (error: any) {
    console.error("Get clients error:", error)
    return NextResponse.json({ success: false, message: "Erreur lors de la récupération des clients" }, { status: 500 })
  }
}

// POST - Ajouter un nouveau client
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

    if (!user || user.role !== "coach") {
      return NextResponse.json({ success: false, message: "Accès refusé - Coach uniquement" }, { status: 403 })
    }

    const { firstName, lastName, email, plan, phone, age, goals } = await request.json()

    // Validation
    if (!firstName || !lastName || !email || !plan) {
      return NextResponse.json({ success: false, message: "Prénom, nom, email et plan sont requis" }, { status: 400 })
    }

    // Vérifier si l'email existe déjà
    const existingClient = await Client.findOne({ email: email.toLowerCase() })
    if (existingClient) {
      return NextResponse.json({ success: false, message: "Un client avec cet email existe déjà" }, { status: 409 })
    }

    // Calculer le prix selon le plan
    const planPrices = { Basic: 9.99, Premium: 29.99, Pro: 49.99 }
    const revenue = planPrices[plan as keyof typeof planPrices] || 0

    // Créer le nouveau client
    const newClient = new Client({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      phone: phone?.trim(),
      age: age ? Number.parseInt(age) : undefined,
      plan,
      coach: user._id,
      coachName: user.name,
      revenue,
      goals: goals || ["Fitness"],
      status: "pending",
    })

    await newClient.save()

    // Créer une activité
    const activity = new Activity({
      userId: user._id,
      userName: user.name,
      userRole: "coach",
      action: "Client ajouté",
      details: `${firstName} ${lastName} - Plan ${plan}`,
      metadata: {
        clientId: newClient._id,
        amount: `$${revenue}`,
      },
    })

    await activity.save()

    return NextResponse.json({
      success: true,
      message: "Client ajouté avec succès",
      client: newClient,
    })
  } catch (error: any) {
    console.error("Add client error:", error)
    return NextResponse.json({ success: false, message: "Erreur lors de l'ajout du client" }, { status: 500 })
  }
}