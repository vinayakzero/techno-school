"use server";

import connectDB from "@/lib/mongodb";
import Setting from "@/models/Setting";
import { revalidatePath } from "next/cache";

export async function getSettingsAction() {
  try {
    await connectDB();
    const setting = await Setting.findOne().lean();
    if (!setting) {
      // Create a default one if it doesn't exist
      const newSetting = await Setting.create({ schoolName: "My School" });
      return { success: true, setting: JSON.parse(JSON.stringify(newSetting)) };
    }
    return { success: true, setting: JSON.parse(JSON.stringify(setting)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateSettingsAction(formData: FormData) {
  try {
    await connectDB();

    const data = {
      schoolName: formData.get("schoolName")?.toString() || "My School",
      schoolAddress: formData.get("schoolAddress")?.toString() || "",
      contactEmail: formData.get("contactEmail")?.toString() || "",
      contactPhone: formData.get("contactPhone")?.toString() || "",
      academicYear: formData.get("academicYear")?.toString() || "2024-2025",
      currencySymbol: formData.get("currencySymbol")?.toString() || "$",
      timezone: formData.get("timezone")?.toString() || "UTC",
    };

    let setting = await Setting.findOne();
    if (setting) {
      // Update existing
      Object.assign(setting, data);
      await setting.save();
    } else {
      // Create new
      setting = await Setting.create(data);
    }

    revalidatePath("/admin/settings");
    revalidatePath("/admin"); // Revalidate layout which might use settings later

    return { success: true, setting: JSON.parse(JSON.stringify(setting)) };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
