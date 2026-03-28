import mongoose, { Schema, Document, Model } from "mongoose";

export interface ISetting extends Document {
  schoolName: string;
  schoolAddress: string;
  contactEmail: string;
  contactPhone: string;
  academicYear: string;
  currencySymbol: string;
  timezone: string;
  createdAt: Date;
  updatedAt: Date;
}

const SettingSchema = new Schema<ISetting>(
  {
    schoolName: { type: String, required: true, default: "My School" },
    schoolAddress: { type: String, default: "" },
    contactEmail: { type: String, default: "" },
    contactPhone: { type: String, default: "" },
    academicYear: { type: String, default: "2024-2025" },
    currencySymbol: { type: String, default: "$" },
    timezone: { type: String, default: "UTC" },
  },
  { timestamps: true }
);

const Setting: Model<ISetting> =
  mongoose.models.Setting || mongoose.model<ISetting>("Setting", SettingSchema);

export default Setting;
