import mongoose, { Schema, Document, Model } from "mongoose";

export interface IResult extends Document {
  student: mongoose.Types.ObjectId;
  exam: mongoose.Types.ObjectId;
  marksObtained: number;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ResultSchema = new Schema<IResult>(
  {
    student: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    exam: { type: Schema.Types.ObjectId, ref: "Exam", required: true },
    marksObtained: { type: Number, required: true },
    remarks: { type: String, trim: true },
  },
  { timestamps: true }
);

// Ensure a student only has one result per unique exam
ResultSchema.index({ student: 1, exam: 1 }, { unique: true });

const Result: Model<IResult> =
  mongoose.models.Result || mongoose.model<IResult>("Result", ResultSchema);

export default Result;
