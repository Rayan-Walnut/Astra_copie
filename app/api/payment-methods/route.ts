import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import connectDB from "@/lib/mongodb"
import PaymentMethod from "@/models/PaymentMethod"
import User from "@/models/User"
import Activity from "@/models/Activity"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

// GET - Récupérer les méthodes de paiement de l'utilisateur
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

    const paymentMethods = await PaymentMethod.find({ 
      userId: user._id, 
      isActive: true 
    }).sort({ isDefault: -1, createdAt: -1 })

    return NextResponse.json({
      success: true,
      paymentMethods: paymentMethods,
    })
  } catch (error: any) {
    console.error("Get payment methods error:", error)
    return NextResponse.json(
      { success: false, message: "Erreur lors de la récupération des méthodes de paiement" },
      { status: 500 }
    )
  }
}

// POST - Ajouter une nouvelle méthode de paiement
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

    const { type, cardNumber, expiryMonth, expiryYear, name, email } = await request.json()

    if (!type || !name) {
      return NextResponse.json({ 
        success: false, 
        message: "Type et nom sont requis" 
      }, { status: 400 })
    }

    // Validation pour les cartes
    if (type !== "paypal" && (!cardNumber || !expiryMonth || !expiryYear)) {
      return NextResponse.json({ 
        success: false, 
        message: "Détails de carte requis" 
      }, { status: 400 })
    }

    // Validation pour PayPal
    if (type === "paypal" && !email) {
      return NextResponse.json({ 
        success: false, 
        message: "Email PayPal requis" 
      }, { status: 400 })
    }

    // Vérifier s'il s'agit de la première méthode de paiement
    const existingMethods = await PaymentMethod.countDocuments({ 
      userId: user._id, 
      isActive: true 
    })
    const isFirstMethod = existingMethods === 0

    // Si c'est la première méthode ou si on veut la définir par défaut
    if (isFirstMethod) {
      // Retirer le statut par défaut des autres méthodes
      await PaymentMethod.updateMany(
        { userId: user._id },
        { isDefault: false }
      )
    }

    const newPaymentMethod = new PaymentMethod({
      userId: user._id,
      type,
      last4: type !== "paypal" ? cardNumber.slice(-4) : undefined,
      expiryMonth: type !== "paypal" ? expiryMonth : undefined,
      expiryYear: type !== "paypal" ? expiryYear : undefined,
      name,
      email: type === "paypal" ? email : undefined,
      isDefault: isFirstMethod,
    })

    await newPaymentMethod.save()

    // Créer une activité
    const activity = new Activity({
      userId: user._id,
      userName: user.name,
      userRole: user.role,
      action: "Méthode de paiement ajoutée",
      details: `${type.charAt(0).toUpperCase() + type.slice(1)} ${type !== "paypal" ? `•••• ${cardNumber.slice(-4)}` : email}`,
      type: "payment",
      metadata: {
        paymentType: type,
      },
    })

    await activity.save()

    return NextResponse.json({
      success: true,
      message: "Méthode de paiement ajoutée avec succès",
      paymentMethod: newPaymentMethod,
    })
  } catch (error: any) {
    console.error("Add payment method error:", error)
    return NextResponse.json(
      { success: false, message: "Erreur lors de l'ajout de la méthode de paiement" },
      { status: 500 }
    )
  }
}