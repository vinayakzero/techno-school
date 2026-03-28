"use server";

import connectDB from "@/lib/mongodb";
import Subject from "@/models/Subject";
import { revalidatePath } from "next/cache";

export async function addSubjectAction(formData: FormData) {
  try {
    await connectDB();
    
    const assignedTeacher = formData.get("assignedTeacher")?.toString() || null;

    const data = {
      name: formData.get("name")?.toString(),
      code: formData.get("code")?.toString(),
      grade: formData.get("grade")?.toString(),
      assignedTeacher: assignedTeacher ? assignedTeacher : undefined,
    };

    const newSubject = await Subject.create(data);
    
    revalidatePath("/admin/subjects");
    return { success: true, subject: JSON.parse(JSON.stringify(newSubject)) };
  } catch (error: any) {
    if (error.code === 11000) {
      return { success: false, error: "A Subject with this code already exists." };
    }
    return { success: false, error: error.message };
  }
}

export async function updateSubjectAction(id: string, formData: FormData) {
  try {
    await connectDB();
    
    const assignedTeacher = formData.get("assignedTeacher")?.toString() || null;

    const data = {
      name: formData.get("name")?.toString(),
      code: formData.get("code")?.toString(),
      grade: formData.get("grade")?.toString(),
      assignedTeacher: assignedTeacher ? assignedTeacher : null,
    };

    // If assignedTeacher is null in Mongoose, it might use the existing value, or explicitly unset it.
    // In Mongoose, you have to be careful with optional ObjectId updates. Setting it to undefined or null.
    // If it's a string 'null', we unset it:
    
    const subject = await Subject.findByIdAndUpdate(
      id,
      { $set: data },
      { new: true, runValidators: true }
    );
    
    if (!subject) throw new Error("Subject not found");

    revalidatePath("/admin/subjects");
    return { success: true, subject: JSON.parse(JSON.stringify(subject)) };
  } catch (error: any) {
    if (error.code === 11000) {
      return { success: false, error: "A Subject with this code already exists." };
    }
    return { success: false, error: error.message };
  }
}

export async function deleteSubjectAction(id: string) {
  try {
    await connectDB();
    await Subject.findByIdAndDelete(id);
    
    revalidatePath("/admin/subjects");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
