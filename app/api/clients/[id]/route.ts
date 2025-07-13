import { type NextRequest, NextResponse } from "next/server"
import { cookies } from "next/headers"
import connectDB from "@/lib/mongodb"
import Client from "@/models/Client"
import User from "@/models/User"
import Activity from "@/models/Activity"
import jwt from "jsonwebtoken"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production"

// DELETE - Supprimer un client
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

    if (!user || user.role !== "coach") {
      return NextResponse.json({ success: false, message: "Accès refusé - Coach uniquement" }, { status: 403 })
    }

    const clientId = params.id

    // Vérifier que le client appartient au coach
    const client = await Client.findOne({ _id: clientId, coach: user._id })

    if (!client) {
      return NextResponse.json({ success: false, message: "Client non trouvé" }, { status: 404 })
    }

    // Supprimer le client
    await Client.findByIdAndDelete(clientId)

    // Créer une activité
    const activity = new Activity({
      userId: user._id,
      userName: user.name,
      userRole: "coach",
      action: "Client supprimé",
      details: `${client.firstName} ${client.lastName}`,
      metadata: {
        clientId: client._id,
      },
    })

    await activity.save()

    return NextResponse.json({
      success: true,
      message: "Client supprimé avec succès",
    })
  } catch (error: any) {
    console.error("Delete client error:", error)
    return NextResponse.json({ success: false, message: "Erreur lors de la suppression du client" }, { status: 500 })
  }
}

// PUT - Mettre à jour un client
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

    if (!user || user.role !== "coach") {
      return NextResponse.json({ success: false, message: "Accès refusé - Coach uniquement" }, { status: 403 })
    }

    const clientId = params.id
    const updates = await request.json()

    // Vérifier que le client appartient au coach
    const client = await Client.findOne({ _id: clientId, coach: user._id })

    if (!client) {
      return NextResponse.json({ success: false, message: "Client non trouvé" }, { status: 404 })
    }

    // Mettre à jour le client
    const updatedClient = await Client.findByIdAndUpdate(clientId, updates, { new: true })

    return NextResponse.json({
      success: true,
      message: "Client mis à jour avec succès",
      client: updatedClient,
    })
  } catch (error: any) {
    console.error("Update client error:", error)
    return NextResponse.json({ success: false, message: "Erreur lors de la mise à jour du client" }, { status: 500 })
  }
}
