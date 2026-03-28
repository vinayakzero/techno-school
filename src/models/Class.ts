import mongoose, { Schema, Document, Model } from "mongoose";

export interface IClass extends Document {
  grade: string;
  section: string;
  capacity: number;
  classTeacher?: mongoose.Types.ObjectId;
  subject?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ClassSchema = new Schema<IClass>(
  {
    grade: { type: String, required: true },
    section: { type: String, required: true },
    capacity: { type: Number, default: 40 },
    classTeacher: { type: Schema.Types.ObjectId, ref: "Teacher" },
  },
  { timestamps: true }
);

// Ensure a grade+section combo is unique
ClassSchema.index({ grade: 1, section: 1 }, { unique: true });

const ClassModel: Model<IClass> =
  mongoose.models.Class || mongoose.model<IClass>("Class", ClassSchema);

export default ClassModel;
