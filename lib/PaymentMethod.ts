import mongoose, { type Document, Schema } from "mongoose"

export interface IPaymentMethod extends Document {
  _id: string
  userId: string
  type: "visa" | "mastercard" | "amex" | "paypal"
  last4?: string
  expiryMonth?: string
  expiryYear?: string
  name: string
  email?: string
  isDefault: boolean
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

const PaymentMethodSchema = new Schema<IPaymentMethod>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    type: {
      type: String,
      enum: ["visa", "mastercard", "amex", "paypal"],
      required: [true, "Payment type is required"],
    },
    last4: {
      type: String,
      maxlength: 4,
    },
    expiryMonth: {
      type: String,
      maxlength: 2,
    },
    expiryYear: {
      type: String,
      maxlength: 4,
    },
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
)

// Index pour améliorer les performances
PaymentMethodSchema.index({ userId: 1, isActive: 1 })
PaymentMethodSchema.index({ userId: 1, isDefault: 1 })

const PaymentMethod = mongoose.models.PaymentMethod || mongoose.model<IPaymentMethod>("PaymentMethod", PaymentMethodSchema)

export default PaymentMethod