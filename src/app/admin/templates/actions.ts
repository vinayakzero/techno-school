"use server";

import { revalidatePath } from "next/cache";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import CertificateTemplate from "@/models/CertificateTemplate";

function parsePlaceholders(rawValue: string) {
  return rawValue
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
}

function buildSlug(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function buildPayload(formData: FormData) {
  const name = formData.get("name")?.toString().trim() || "";
  const providedSlug = formData.get("slug")?.toString().trim() || "";

  return {
    name,
    slug: buildSlug(providedSlug || name),
    category: formData.get("category")?.toString() || "Certificate",
    audience: formData.get("audience")?.toString() || "Student",
    description: formData.get("description")?.toString().trim() || "",
    placeholders: parsePlaceholders(formData.get("placeholders")?.toString() || ""),
    orientation: formData.get("orientation")?.toString() || "portrait",
    paperSize: formData.get("paperSize")?.toString() || "A4",
    isActive: formData.get("isActive")?.toString() === "true",
  };
}

export async function createTemplateAction(formData: FormData) {
  try {
    await connectDB();
    const payload = buildPayload(formData);

    if (!payload.name) {
      return { success: false, error: "Template name is required." };
    }

    await CertificateTemplate.create(payload);
    revalidatePath("/admin/templates");
    return { success: true };
  } catch (error: any) {
    if (error?.code === 11000) {
      return { success: false, error: "A template with this slug already exists." };
    }
    return { success: false, error: error.message || "Unable to create template." };
  }
}

export async function updateTemplateAction(id: string, formData: FormData) {
  try {
    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return { success: false, error: "Invalid template id." };
    }

    const payload = buildPayload(formData);

    await CertificateTemplate.findByIdAndUpdate(
      id,
      { $set: payload },
      { runValidators: true }
    );

    revalidatePath("/admin/templates");
    revalidatePath(`/admin/templates/${id}`);
    revalidatePath(`/admin/templates/${id}/preview`);
    return { success: true };
  } catch (error: any) {
    if (error?.code === 11000) {
      return { success: false, error: "A template with this slug already exists." };
    }
    return { success: false, error: error.message || "Unable to update template." };
  }
}

export async function deleteTemplateAction(id: string) {
  try {
    await connectDB();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return { success: false, error: "Invalid template id." };
    }

    await CertificateTemplate.findByIdAndDelete(id);
    revalidatePath("/admin/templates");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Unable to delete template." };
  }
}
