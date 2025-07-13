import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import connectDB from "@/lib/mongodb"
import Invoice from "@/models/Invoice"
import User from "@/models/User"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

// GET - Récupérer les factures de l'utilisateur
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
    const status = searchParams.get("status")

    let query: any = { userId: user._id }
    if (status && status !== "all") {
      query.status = status
    }

    const invoices = await Invoice.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("paymentMethodId", "type last4 email")

    return NextResponse.json({
      success: true,
      invoices: invoices,
    })
  } catch (error: any) {
    console.error("Get invoices error:", error)
    return NextResponse.json(
      { success: false, message: "Erreur lors de la récupération des factures" },
      { status: 500 }
    )
  }
}

// POST - Créer une nouvelle facture (pour simulation)
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

    const { amount, plan, period, description, items } = await request.json()

    if (!amount || !plan || !period || !description) {
      return NextResponse.json({ 
        success: false, 
        message: "Données de facture incomplètes" 
      }, { status: 400 })
    }

    // Générer un numéro de facture unique
    const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    const newInvoice = new Invoice({
      userId: user._id,
      invoiceNumber,
      amount,
      plan,
      period,
      description,
      items: items || [{ description, amount, quantity: 1 }],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
      status: "pending",
    })

    await newInvoice.save()

    return NextResponse.json({
      success: true,
      message: "Facture créée avec succès",
      invoice: newInvoice,
    })
  } catch (error: any) {
    console.error("Create invoice error:", error)
    return NextResponse.json(
      { success: false, message: "Erreur lors de la création de la facture" },
      { status: 500 }
    )
  }
}