"use server";

import connectDB from "@/lib/mongodb";
import ClassModel from "@/models/Class";
import { revalidatePath } from "next/cache";

export async function createClassAction(formData: FormData) {
  try {
    await connectDB();
    const tcId = formData.get("classTeacher")?.toString();

    const data = {
      grade: formData.get("grade") as string,
      section: formData.get("section") as string,
      capacity: Number(formData.get("capacity")) || 40,
      classTeacher: tcId ? tcId : null,
    };
    await ClassModel.create(data);
    revalidatePath("/admin/classes");
    return { success: true };
  } catch (error: any) {
    if (error.code === 11000) return { success: false, error: "This Grade and Section combination already exists." };
    return { success: false, error: error.message };
  }
}

export async function updateClassAction(id: string, formData: FormData) {
  try {
    await connectDB();
    const tcId = formData.get("classTeacher")?.toString();

    const data = {
      grade: formData.get("grade") as string,
      section: formData.get("section") as string,
      capacity: Number(formData.get("capacity")) || 40,
      classTeacher: tcId ? tcId : null,
    };
    await ClassModel.findByIdAndUpdate(id, data, { new: true });
    revalidatePath("/admin/classes");
    return { success: true };
  } catch (error: any) {
    if (error.code === 11000) return { success: false, error: "This Grade and Section combination already exists." };
    return { success: false, error: error.message };
  }
}

export async function deleteClassAction(id: string) {
  try {
    await connectDB();
    await ClassModel.findByIdAndDelete(id);
    revalidatePath("/admin/classes");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
