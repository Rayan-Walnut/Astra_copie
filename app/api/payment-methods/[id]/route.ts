import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import connectDB from "@/lib/mongodb"
import PaymentMethod from "@/models/PaymentMethod"
import User from "@/models/User"
import Activity from "@/models/Activity"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

// DELETE - Supprimer une méthode de paiement
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
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

    const paymentMethodId = params.id

    const paymentMethod = await PaymentMethod.findOne({ 
      _id: paymentMethodId, 
      userId: user._id,
      isActive: true 
    })

    if (!paymentMethod) {
      return NextResponse.json({ success: false, message: "Méthode de paiement non trouvée" }, { status: 404 })
    }

    // Ne pas permettre la suppression de la méthode par défaut s'il y en a d'autres
    if (paymentMethod.isDefault) {
      const otherMethods = await PaymentMethod.countDocuments({ 
        userId: user._id, 
        _id: { $ne: paymentMethodId },
        isActive: true 
      })
      
      if (otherMethods > 0) {
        return NextResponse.json({ 
          success: false, 
          message: "Impossible de supprimer la méthode de paiement par défaut. Définissez d'abord une autre méthode par défaut." 
        }, { status: 400 })
      }
    }

    // Marquer comme inactive au lieu de supprimer
    paymentMethod.isActive = false
    await paymentMethod.save()

    // Créer une activité
    const activity = new Activity({
      userId: user._id,
      userName: user.name,
      userRole: user.role,
      action: "Méthode de paiement supprimée",
      details: `${paymentMethod.type.charAt(0).toUpperCase() + paymentMethod.type.slice(1)} ${paymentMethod.last4 ? `•••• ${paymentMethod.last4}` : paymentMethod.email}`,
      type: "payment",
    })

    await activity.save()

    return NextResponse.json({
      success: true,
      message: "Méthode de paiement supprimée avec succès",
    })
  } catch (error: any) {
    console.error("Delete payment method error:", error)
    return NextResponse.json(
      { success: false, message: "Erreur lors de la suppression de la méthode de paiement" },
      { status: 500 }
    )
  }
}

// PUT - Mettre à jour une méthode de paiement (ex: définir par défaut)
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
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

    const paymentMethodId = params.id
    const { setAsDefault } = await request.json()

    const paymentMethod = await PaymentMethod.findOne({ 
      _id: paymentMethodId, 
      userId: user._id,
      isActive: true 
    })

    if (!paymentMethod) {
      return NextResponse.json({ success: false, message: "Méthode de paiement non trouvée" }, { status: 404 })
    }

    if (setAsDefault) {
      // Retirer le statut par défaut des autres méthodes
      await PaymentMethod.updateMany(
        { userId: user._id, _id: { $ne: paymentMethodId } },
        { isDefault: false }
      )

      // Définir cette méthode comme par défaut
      paymentMethod.isDefault = true
      await paymentMethod.save()

      // Créer une activité
      const activity = new Activity({
        userId: user._id,
        userName: user.name,
        userRole: user.role,
        action: "Méthode de paiement par défaut modifiée",
        details: `${paymentMethod.type.charAt(0).toUpperCase() + paymentMethod.type.slice(1)} ${paymentMethod.last4 ? `•••• ${paymentMethod.last4}` : paymentMethod.email}`,
        type: "payment",
      })

      await activity.save()
    }

    return NextResponse.json({
      success: true,
      message: "Méthode de paiement mise à jour avec succès",
      paymentMethod: paymentMethod,
    })
  } catch (error: any) {
    console.error("Update payment method error:", error)
    return NextResponse.json(
      { success: false, message: "Erreur lors de la mise à jour de la méthode de paiement" },
      { status: 500 }
    )
  }
}