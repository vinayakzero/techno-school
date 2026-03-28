"use server";

import connectDB from "@/lib/mongodb";
import Teacher from "@/models/Teacher";
import { revalidatePath } from "next/cache";

export async function createTeacherAction(formData: FormData) {
  try {
    await connectDB();
    const classesRaw = formData.get("classes") as string;
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      subject: formData.get("subject") as string,
      qualification: formData.get("qualification") as string,
      experience: Number(formData.get("experience")),
      salary: Number(formData.get("salary")),
      status: formData.get("status") as string,
      gender: formData.get("gender") as string,
      address: formData.get("address") as string,
      joinDate: new Date(formData.get("joinDate") as string),
      classes: classesRaw ? classesRaw.split(",").map((c) => c.trim()).filter(Boolean) : [],
    };
    await Teacher.create(data);
    revalidatePath("/admin/teachers");
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateTeacherAction(id: string, formData: FormData) {
  try {
    await connectDB();
    const classesRaw = formData.get("classes") as string;
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      subject: formData.get("subject") as string,
      qualification: formData.get("qualification") as string,
      experience: Number(formData.get("experience")),
      salary: Number(formData.get("salary")),
      status: formData.get("status") as string,
      gender: formData.get("gender") as string,
      address: formData.get("address") as string,
      classes: classesRaw ? classesRaw.split(",").map((c) => c.trim()).filter(Boolean) : [],
    };
    await Teacher.findByIdAndUpdate(id, data, { new: true });
    revalidatePath("/admin/teachers");
    revalidatePath(`/admin/teachers/${id}`);
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteTeacherAction(id: string) {
  try {
    await connectDB();
    await Teacher.findByIdAndDelete(id);
    revalidatePath("/admin/teachers");
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
