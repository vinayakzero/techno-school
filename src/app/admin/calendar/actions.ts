"use server";

import { revalidatePath } from "next/cache";
import connectDB from "@/lib/mongodb";
import Event from "@/models/Event";

export async function createEventAction(formData: FormData) {
  try {
    await connectDB();

    const type = formData.get("type")?.toString() || "Activity";
    const meetingDetails = type === "Meeting"
      ? {
          hostTeacher: formData.get("hostTeacher")?.toString() || null,
          venue: formData.get("venue")?.toString() || "",
          slotLabel: formData.get("slotLabel")?.toString() || "",
          meetingMode: formData.get("meetingMode")?.toString() || "In Person",
          parentInstructions: formData.get("parentInstructions")?.toString() || "",
        }
      : {
          hostTeacher: null,
          venue: "",
          slotLabel: "",
          meetingMode: "In Person",
          parentInstructions: "",
        };

    await Event.create({
      title: formData.get("title")?.toString() || "",
      type,
      startDate: new Date(formData.get("startDate")?.toString() || new Date().toISOString()),
      endDate: new Date(formData.get("endDate")?.toString() || new Date().toISOString()),
      audience: formData.get("audience")?.toString() || "School",
      grade: formData.get("grade")?.toString() || "",
      description: formData.get("description")?.toString() || "",
      isHoliday: formData.get("isHoliday")?.toString() === "true",
      meetingDetails,
    });

    revalidatePath("/admin/calendar");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function updateEventAction(id: string, formData: FormData) {
  try {
    await connectDB();

    const type = formData.get("type")?.toString() || "Activity";
    const meetingDetails = type === "Meeting"
      ? {
          hostTeacher: formData.get("hostTeacher")?.toString() || null,
          venue: formData.get("venue")?.toString() || "",
          slotLabel: formData.get("slotLabel")?.toString() || "",
          meetingMode: formData.get("meetingMode")?.toString() || "In Person",
          parentInstructions: formData.get("parentInstructions")?.toString() || "",
        }
      : {
          hostTeacher: null,
          venue: "",
          slotLabel: "",
          meetingMode: "In Person",
          parentInstructions: "",
        };

    await Event.findByIdAndUpdate(
      id,
      {
        $set: {
          title: formData.get("title")?.toString() || "",
          type,
          startDate: new Date(formData.get("startDate")?.toString() || new Date().toISOString()),
          endDate: new Date(formData.get("endDate")?.toString() || new Date().toISOString()),
          audience: formData.get("audience")?.toString() || "School",
          grade: formData.get("grade")?.toString() || "",
          description: formData.get("description")?.toString() || "",
          isHoliday: formData.get("isHoliday")?.toString() === "true",
          meetingDetails,
        },
      },
      { runValidators: true }
    );

    revalidatePath("/admin/calendar");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteEventAction(id: string) {
  try {
    await connectDB();
    await Event.findByIdAndDelete(id);
    revalidatePath("/admin/calendar");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
