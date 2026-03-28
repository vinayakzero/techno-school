import mongoose, { Schema, Document, Model } from "mongoose";

export interface IExam extends Document {
  name: string;
  subject: mongoose.Types.ObjectId;
  grade: string;
  date: Date;
  totalMarks: number;
  createdAt: Date;
  updatedAt: Date;
}

const ExamSchema = new Schema<IExam>(
  {
    name: { type: String, required: true, trim: true },
    subject: { type: Schema.Types.ObjectId, ref: "Subject", required: true },
    grade: { type: String, required: true, trim: true },
    date: { type: Date, required: true },
    totalMarks: { type: Number, required: true, default: 100 },
  },
  { timestamps: true }
);

// Optional: ensure an exam name is unique per subject per date
ExamSchema.index({ name: 1, subject: 1, date: 1 }, { unique: true });

const Exam: Model<IExam> =
  mongoose.models.Exam || mongoose.model<IExam>("Exam", ExamSchema);

export default Exam;
