import mongoose, { type Document, Schema } from "mongoose"

export interface IInvoice extends Document {
  _id: string
  userId: string
  invoiceNumber: string
  amount: number
  currency: string
  status: "paid" | "pending" | "failed" | "cancelled"
  plan: string
  period: string
  dueDate: Date
  paidDate?: Date
  paymentMethodId?: string
  description: string
  items: Array<{
    description: string
    amount: number
    quantity: number
  }>
  createdAt: Date
  updatedAt: Date
}

const InvoiceSchema = new Schema<IInvoice>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User ID is required"],
    },
    invoiceNumber: {
      type: String,
      required: [true, "Invoice number is required"],
      unique: true,
    },
    amount: {
      type: Number,
      required: [true, "Amount is required"],
      min: 0,
    },
    currency: {
      type: String,
      default: "USD",
      uppercase: true,
    },
    status: {
      type: String,
      enum: ["paid", "pending", "failed", "cancelled"],
      default: "pending",
    },
    plan: {
      type: String,
      required: [true, "Plan is required"],
    },
    period: {
      type: String,
      required: [true, "Period is required"],
    },
    dueDate: {
      type: Date,
      required: [true, "Due date is required"],
    },
    paidDate: {
      type: Date,
    },
    paymentMethodId: {
      type: Schema.Types.ObjectId,
      ref: "PaymentMethod",
    },
    description: {
      type: String,
      required: [true, "Description is required"],
    },
    items: [
      {
        description: {
          type: String,
          required: true,
        },
        amount: {
          type: Number,
          required: true,
          min: 0,
        },
        quantity: {
          type: Number,
          required: true,
          min: 1,
        },
      },
    ],
  },
  {
    timestamps: true,
  },
)

// Index pour améliorer les performances
InvoiceSchema.index({ userId: 1, status: 1 })
InvoiceSchema.index({ invoiceNumber: 1 })
InvoiceSchema.index({ createdAt: -1 })

const Invoice = mongoose.models.Invoice || mongoose.model<IInvoice>("Invoice", InvoiceSchema)

export default Invoice