import mongoose, { Document, Model, Schema } from "mongoose";

export interface IPayment extends Document {
  studentId: mongoose.Types.ObjectId;
  feeStructureId?: mongoose.Types.ObjectId | null;
  grade: string;
  amount: number;
  date: Date;
  mode: "Cash" | "Online" | "Bank Transfer" | "Cheque";
  receiptNo: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    feeStructureId: { type: Schema.Types.ObjectId, ref: "FeeStructure", default: null },
    grade: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    date: { type: Date, required: true, default: Date.now },
    mode: {
      type: String,
      enum: ["Cash", "Online", "Bank Transfer", "Cheque"],
      default: "Cash",
    },
    receiptNo: { type: String, required: true, unique: true, trim: true },
    notes: { type: String, default: "" },
  },
  { timestamps: true }
);

PaymentSchema.index({ studentId: 1, date: -1 });

const Payment: Model<IPayment> =
  mongoose.models.Payment || mongoose.model<IPayment>("Payment", PaymentSchema);

export default Payment;
