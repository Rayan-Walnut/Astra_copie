import mongoose, { type Document, Schema } from "mongoose"

export interface IActivity extends Document {
  _id: string
  userId: string
  userName: string
  userRole: "coach" | "member"
  action: string
  details: string
  type: "workout" | "payment" | "achievement" | "profile" | "client" | "plan" | "session" | "booking"
  metadata?: {
    duration?: string
    amount?: string
    time?: string
    badge?: string
    clientId?: string
    planFrom?: string
    planTo?: string
    sessionType?: string
    location?: string
    equipment?: string
  }
  date: Date
  createdAt: Date
}

const ActivitySchema = new Schema<IActivity>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    userName: {
      type: String,
      required: [true, "User name is required"],
    },
    userRole: {
      type: String,
      enum: ["coach", "member"],
      required: [true, "User role is required"],
    },
    action: {
      type: String,
      required: [true, "Action is required"],
      trim: true,
    },
    details: {
      type: String,
      required: [true, "Details are required"],
      trim: true,
    },
    type: {
      type: String,
      enum: ["workout", "payment", "achievement", "profile", "client", "plan", "session", "booking"],
      required: [true, "Type is required"],
    },
    metadata: {
      duration: String,
      amount: String,
      time: String,
      badge: String,
      clientId: Schema.Types.ObjectId,
      planFrom: String,
      planTo: String,
      sessionType: String,
      location: String,
      equipment: String,
    },
    date: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  },
)

// Index pour améliorer les performances
ActivitySchema.index({ userId: 1, date: -1 })
ActivitySchema.index({ userRole: 1, date: -1 })
ActivitySchema.index({ type: 1, date: -1 })

const Activity = mongoose.models.Activity || mongoose.model<IActivity>("Activity", ActivitySchema)

export default Activity