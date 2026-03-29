import mongoose, { Schema, Document, Model } from "mongoose";

export interface IStudent extends Document {
  name: string;
  email: string;
  phone: string;
  admissionNumber?: string;
  rollNumber?: string;
  admissionSource?: string;
  previousSchool?: string;
  guardianRelation?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
  bloodGroup?: string;
  house?: string;
  grade: string;
  section: string;
  status: "Active" | "Pending" | "Inactive";
  lifecycleStatus: "Enrolled" | "Promoted" | "Transferred" | "Withdrawn" | "Archived";
  academicSession?: string;
  lastTransitionDate?: Date;
  lifecycleNote?: string;
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
    waived?: number;
    fine?: number;
    collected?: number;
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
    admissionNumber: { type: String, trim: true, uppercase: true, sparse: true, unique: true },
    rollNumber: { type: String, trim: true, uppercase: true, sparse: true, unique: true },
    admissionSource: { type: String, default: "" },
    previousSchool: { type: String, default: "" },
    guardianRelation: { type: String, default: "" },
    emergencyContactName: { type: String, default: "" },
    emergencyContactPhone: { type: String, default: "" },
    bloodGroup: { type: String, default: "" },
    house: { type: String, default: "" },
    grade: { type: String, required: true },
    section: { type: String, required: true, default: "A" },
    status: {
      type: String,
      enum: ["Active", "Pending", "Inactive"],
      default: "Active",
    },
    lifecycleStatus: {
      type: String,
      enum: ["Enrolled", "Promoted", "Transferred", "Withdrawn", "Archived"],
      default: "Enrolled",
    },
    academicSession: { type: String, default: "" },
    lastTransitionDate: { type: Date, default: null },
    lifecycleNote: { type: String, default: "" },
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
      waived: { type: Number, default: 0 },
      fine: { type: Number, default: 0 },
      collected: { type: Number, default: 0 },
    },
    avatar: { type: String, default: "" },
  },
  { timestamps: true }
);

const Student: Model<IStudent> =
  mongoose.models.Student || mongoose.model<IStudent>("Student", StudentSchema);

export default Student;
