import mongoose, { Schema, Document, Model } from "mongoose";

export interface ITeacher extends Document {
  name: string;
  email: string;
  phone: string;
  subject: string;
  qualification: string;
  experience: number;
  status: "Active" | "On Leave" | "Inactive";
  joinDate: Date;
  salary: number;
  gender: "Male" | "Female" | "Other";
  address: string;
  avatar?: string;
  classes: string[];
  createdAt: Date;
  updatedAt: Date;
}

const TeacherSchema = new Schema<ITeacher>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    phone: { type: String, required: true },
    subject: { type: String, required: true },
    qualification: { type: String, required: true },
    experience: { type: Number, required: true, default: 0 },
    status: {
      type: String,
      enum: ["Active", "On Leave", "Inactive"],
      default: "Active",
    },
    joinDate: { type: Date, default: Date.now },
    salary: { type: Number, required: true },
    gender: { type: String, enum: ["Male", "Female", "Other"], required: true },
    address: { type: String, default: "" },
    avatar: { type: String, default: "" },
    classes: [{ type: String }],
  },
  { timestamps: true }
);

const Teacher: Model<ITeacher> =
  mongoose.models.Teacher || mongoose.model<ITeacher>("Teacher", TeacherSchema);

export default Teacher;
