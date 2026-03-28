import mongoose, { Document, Model, Schema } from "mongoose";

export interface IEvent extends Document {
  title: string;
  type: "Holiday" | "Exam" | "Meeting" | "Activity" | "Deadline";
  startDate: Date;
  endDate: Date;
  audience: "School" | "Teachers" | "Students" | "Parents" | "Admin";
  grade?: string;
  description?: string;
  isHoliday: boolean;
  linkedExam?: mongoose.Types.ObjectId | null;
  meetingDetails?: {
    hostTeacher?: mongoose.Types.ObjectId | null;
    venue?: string;
    slotLabel?: string;
    meetingMode?: "In Person" | "Online" | "Hybrid";
    parentInstructions?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["Holiday", "Exam", "Meeting", "Activity", "Deadline"],
      required: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    audience: {
      type: String,
      enum: ["School", "Teachers", "Students", "Parents", "Admin"],
      default: "School",
    },
    grade: { type: String, default: "" },
    description: { type: String, default: "" },
    isHoliday: { type: Boolean, default: false },
    linkedExam: { type: Schema.Types.ObjectId, ref: "Exam", default: null },
    meetingDetails: {
      hostTeacher: { type: Schema.Types.ObjectId, ref: "Teacher", default: null },
      venue: { type: String, default: "" },
      slotLabel: { type: String, default: "" },
      meetingMode: {
        type: String,
        enum: ["In Person", "Online", "Hybrid"],
        default: "In Person",
      },
      parentInstructions: { type: String, default: "" },
    },
  },
  { timestamps: true }
);

const Event: Model<IEvent> =
  mongoose.models.Event || mongoose.model<IEvent>("Event", EventSchema);

export default Event;
