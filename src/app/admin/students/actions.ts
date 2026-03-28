"use server";

import connectDB from "@/lib/mongodb";
import Student from "@/models/Student";
import Payment from "@/models/Payment";
import { revalidatePath } from "next/cache";
import { syncStudentFeeSummary } from "@/lib/fees";

export async function createStudentAction(formData: FormData) {
  try {
    await connectDB();
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      grade: formData.get("grade") as string,
      section: formData.get("section") as string,
      status: formData.get("status") as string,
      parentName: formData.get("parentName") as string,
      parentPhone: formData.get("parentPhone") as string,
      address: formData.get("address") as string,
      dateOfBirth: new Date(formData.get("dateOfBirth") as string),
      gender: formData.get("gender") as string,
    };
    const student = await Student.create(data);
    await syncStudentFeeSummary(student._id.toString());
    revalidatePath("/admin/students");
    revalidatePath("/admin/fees");
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateStudentAction(id: string, formData: FormData) {
  try {
    await connectDB();
    const data = {
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      phone: formData.get("phone") as string,
      grade: formData.get("grade") as string,
      section: formData.get("section") as string,
      status: formData.get("status") as string,
      parentName: formData.get("parentName") as string,
      parentPhone: formData.get("parentPhone") as string,
      address: formData.get("address") as string,
      dateOfBirth: new Date(formData.get("dateOfBirth") as string),
      gender: formData.get("gender") as string,
    };
    await Student.findByIdAndUpdate(id, data, { new: true });
    await syncStudentFeeSummary(id);
    revalidatePath("/admin/students");
    revalidatePath(`/admin/students/${id}`);
    revalidatePath("/admin/fees");
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteStudentAction(id: string) {
  try {
    await connectDB();
    await Payment.deleteMany({ studentId: id });
    await Student.findByIdAndDelete(id);
    revalidatePath("/admin/students");
    revalidatePath("/admin/fees");
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
