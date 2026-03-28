import mongoose, { Document, Model, Schema } from "mongoose";

export interface ISyllabusUnit {
  title: string;
  objectives: string[];
  recommendedWeeks: number;
}

export interface ISyllabus extends Document {
  grade: string;
  subject: mongoose.Types.ObjectId;
  academicYear: string;
  units: ISyllabusUnit[];
  referenceBooks: string[];
  assessmentPattern: string;
  createdAt: Date;
  updatedAt: Date;
}

const SyllabusUnitSchema = new Schema<ISyllabusUnit>(
  {
    title: { type: String, required: true, trim: true },
    objectives: [{ type: String, trim: true }],
    recommendedWeeks: { type: Number, default: 2, min: 1 },
  },
  { _id: false }
);

const SyllabusSchema = new Schema<ISyllabus>(
  {
    grade: { type: String, required: true, trim: true },
    subject: { type: Schema.Types.ObjectId, ref: "Subject", required: true },
    academicYear: { type: String, required: true, trim: true },
    units: [SyllabusUnitSchema],
    referenceBooks: [{ type: String, trim: true }],
    assessmentPattern: { type: String, default: "" },
  },
  { timestamps: true }
);

SyllabusSchema.index({ grade: 1, subject: 1, academicYear: 1 }, { unique: true });

const Syllabus: Model<ISyllabus> =
  mongoose.models.Syllabus || mongoose.model<ISyllabus>("Syllabus", SyllabusSchema);

export default Syllabus;
