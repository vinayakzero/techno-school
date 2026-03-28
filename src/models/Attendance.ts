import mongoose, { Schema, Document, Model } from "mongoose";

export interface IAttendanceRecord {
  studentId: mongoose.Types.ObjectId;
  status: "Present" | "Absent" | "Late" | "Excused";
  remarks?: string;
}

export interface IAttendance extends Document {
  date: Date;
  grade: string;
  section: string;
  records: IAttendanceRecord[];
  recordedBy?: mongoose.Types.ObjectId; // References the Admin/Teacher who recorded it
  createdAt: Date;
  updatedAt: Date;
}

const AttendanceRecordSchema = new Schema<IAttendanceRecord>(
  {
    studentId: { type: Schema.Types.ObjectId, ref: "Student", required: true },
    status: {
      type: String,
      enum: ["Present", "Absent", "Late", "Excused"],
      required: true,
      default: "Present",
    },
    remarks: { type: String, default: "" },
  },
  { _id: false } // Avoid generating unique ObjectIDs for sub-documents to save space
);

const AttendanceSchema = new Schema<IAttendance>(
  {
    date: { type: Date, required: true },
    grade: { type: String, required: true },
    section: { type: String, required: true },
    records: [AttendanceRecordSchema],
    recordedBy: { type: Schema.Types.ObjectId, ref: "Teacher" }, // Assuming a teacher or admin ID maps here later
  },
  { timestamps: true }
);

// Compound index to ensure only one attendance document per class per day
AttendanceSchema.index({ date: 1, grade: 1, section: 1 }, { unique: true });

const Attendance: Model<IAttendance> =
  mongoose.models.Attendance || mongoose.model<IAttendance>("Attendance", AttendanceSchema);

export default Attendance;
