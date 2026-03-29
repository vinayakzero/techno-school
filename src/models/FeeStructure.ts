import mongoose, { Document, Model, Schema } from "mongoose";

export interface IFeeStructure extends Document {
  title: string;
  grade: string;
  amount: number;
  dueDate: Date;
  category: "Tuition" | "Transport" | "Library" | "Examination" | "Miscellaneous";
  description?: string;
  lateFeeAmount?: number;
  installmentAllowed: boolean;
  installmentCount: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const FeeStructureSchema = new Schema<IFeeStructure>(
  {
    title: { type: String, required: true, trim: true },
    grade: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
    dueDate: { type: Date, required: true },
    category: {
      type: String,
      enum: ["Tuition", "Transport", "Library", "Examination", "Miscellaneous"],
      default: "Tuition",
    },
    description: { type: String, default: "" },
    lateFeeAmount: { type: Number, default: 0, min: 0 },
    installmentAllowed: { type: Boolean, default: false },
    installmentCount: { type: Number, default: 1, min: 1 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

FeeStructureSchema.index({ grade: 1, title: 1, category: 1 }, { unique: true });

const FeeStructure: Model<IFeeStructure> =
  mongoose.models.FeeStructure ||
  mongoose.model<IFeeStructure>("FeeStructure", FeeStructureSchema);

export default FeeStructure;
