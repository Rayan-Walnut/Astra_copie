import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import connectDB from "@/lib/mongodb"
import Invoice from "@/models/Invoice"
import User from "@/models/User"
import Activity from "@/models/Activity"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

// GET - Télécharger une facture
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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

    const invoiceId = params.id
    const invoice = await Invoice.findOne({ _id: invoiceId, userId: user._id })

    if (!invoice) {
      return NextResponse.json({ success: false, message: "Facture non trouvée" }, { status: 404 })
    }

    // Créer une activité pour le téléchargement
    const activity = new Activity({
      userId: user._id,
      userName: user.name,
      userRole: user.role,
      action: "Facture téléchargée",
      details: `Facture ${invoice.invoiceNumber} - ${invoice.plan}`,
      type: "payment",
      metadata: {
        amount: `$${invoice.amount}`,
      },
    })

    await activity.save()

    // Simuler le téléchargement en retournant les données de la facture
    // Dans un vrai système, vous généreriez un PDF ici
    return NextResponse.json({
      success: true,
      message: "Téléchargement de la facture initié",
      invoice: {
        invoiceNumber: invoice.invoiceNumber,
        amount: invoice.amount,
        plan: invoice.plan,
        period: invoice.period,
        status: invoice.status,
        createdAt: invoice.createdAt,
        dueDate: invoice.dueDate,
        items: invoice.items,
      },
    })
  } catch (error: any) {
    console.error("Download invoice error:", error)
    return NextResponse.json(
      { success: false, message: "Erreur lors du téléchargement de la facture" },
      { status: 500 }
    )
  }
}