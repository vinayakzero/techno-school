import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISubject extends Document {
  name: string;
  code: string;
  grade: string;
  assignedTeacher?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const SubjectSchema = new Schema<ISubject>(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    grade: { type: String, required: true, trim: true },
    assignedTeacher: { type: Schema.Types.ObjectId, ref: "Teacher" },
  },
  { timestamps: true }
);

// Optional: ensure unique combinations
SubjectSchema.index({ code: 1, grade: 1 }, { unique: true });

const Subject: Model<ISubject> =
  mongoose.models.Subject || mongoose.model<ISubject>("Subject", SubjectSchema);

export default Subject;
