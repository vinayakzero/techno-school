import mongoose, { Schema, Document, Model } from "mongoose";

export interface IStudent extends Document {
  name: string;
  email: string;
  phone: string;
  grade: string;
  section: string;
  status: "Active" | "Pending" | "Inactive";
  enrollmentDate: Date;
  parentName: string;
  parentPhone: string;
  address: string;
  dateOfBirth: Date;
  gender: "Male" | "Female" | "Other";
  fees: {
    total: number;
    paid: number;
    pending: number;
  };
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

const StudentSchema = new Schema<IStudent>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true },
    grade: { type: String, required: true },
    section: { type: String, required: true, default: "A" },
    status: {
      type: String,
      enum: ["Active", "Pending", "Inactive"],
      default: "Active",
    },
    enrollmentDate: { type: Date, default: Date.now },
    parentName: { type: String, required: true },
    parentPhone: { type: String, required: true },
    address: { type: String, default: "" },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
    fees: {
      total: { type: Number, default: 50000 },
      paid: { type: Number, default: 0 },
      pending: { type: Number, default: 50000 },
    },
    avatar: { type: String, default: "" },
  },
  { timestamps: true }
);

const Student: Model<IStudent> =
  mongoose.models.Student || mongoose.model<IStudent>("Student", StudentSchema);

export default Student;
