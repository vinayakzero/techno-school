import mongoose, { Document, Model, Schema } from "mongoose";

export interface ICertificateTemplate extends Document {
  name: string;
  slug: string;
  category: "Certificate" | "ID Card" | "Receipt" | "Report";
  audience: "Student" | "Teacher" | "Parent" | "School";
  description?: string;
  placeholders: string[];
  orientation: "portrait" | "landscape";
  paperSize: "A4" | "Letter" | "ID-1";
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CertificateTemplateSchema = new Schema<ICertificateTemplate>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, trim: true, lowercase: true },
    category: {
      type: String,
      enum: ["Certificate", "ID Card", "Receipt", "Report"],
      required: true,
    },
    audience: {
      type: String,
      enum: ["Student", "Teacher", "Parent", "School"],
      required: true,
    },
    description: { type: String, default: "" },
    placeholders: [{ type: String, trim: true }],
    orientation: { type: String, enum: ["portrait", "landscape"], default: "portrait" },
    paperSize: { type: String, enum: ["A4", "Letter", "ID-1"], default: "A4" },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const CertificateTemplate: Model<ICertificateTemplate> =
  mongoose.models.CertificateTemplate ||
  mongoose.model<ICertificateTemplate>("CertificateTemplate", CertificateTemplateSchema);

export default CertificateTemplate;
