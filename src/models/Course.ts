import mongoose, { Document, Model, Schema } from "mongoose";

export interface ICourse extends Document {
  name: string;
  code: string;
  grade: string;
  description?: string;
  coreSubjects: string[];
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CourseSchema = new Schema<ICourse>(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, trim: true, uppercase: true },
    grade: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    coreSubjects: [{ type: String, trim: true }],
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

CourseSchema.index({ grade: 1, code: 1 }, { unique: true });

const Course: Model<ICourse> =
  mongoose.models.Course || mongoose.model<ICourse>("Course", CourseSchema);

export default Course;
