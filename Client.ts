import mongoose, { type Document, Schema } from "mongoose"

export interface IClient extends Document {
  _id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  age?: number
  plan: "Basic" | "Premium" | "Pro"
  status: "active" | "inactive" | "pending"
  joinDate: Date
  lastActive: Date
  revenue: number
  coach: string // Coach's user ID
  coachName: string // Coach's name for display
  gym: string
  goals?: string[]
  sessions?: number
  progress?: number
  createdAt: Date
  updatedAt: Date
}

const ClientSchema = new Schema<IClient>(
  {
    firstName: {
      type: String,
      required: [true, "First name is required"],
      trim: true,
      maxlength: [50, "First name cannot exceed 50 characters"],
    },
    lastName: {
      type: String,
      required: [true, "Last name is required"],
      trim: true,
      maxlength: [50, "Last name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"],
    },
    phone: {
      type: String,
      trim: true,
    },
    age: {
      type: Number,
      min: [16, "Age must be at least 16"],
      max: [100, "Age cannot exceed 100"],
    },
    plan: {
      type: String,
      enum: ["Basic", "Premium", "Pro"],
      required: [true, "Plan is required"],
    },
    status: {
      type: String,
      enum: ["active", "inactive", "pending"],
      default: "pending",
    },
    joinDate: {
      type: Date,
      default: Date.now,
    },
    lastActive: {
      type: Date,
      default: Date.now,
    },
    revenue: {
      type: Number,
      required: true,
      min: 0,
    },
    coach: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Coach is required"],
    },
    coachName: {
      type: String,
      required: [true, "Coach name is required"],
    },
    gym: {
      type: String,
      default: "FitGym Center",
    },
    goals: [
      {
        type: String,
        trim: true,
      },
    ],
    sessions: {
      type: Number,
      default: 0,
      min: 0,
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  },
)

// Index pour améliorer les performances
ClientSchema.index({ coach: 1, status: 1 })
ClientSchema.index({ email: 1 })

const Client = mongoose.models.Client || mongoose.model<IClient>("Client", ClientSchema)

export default Client