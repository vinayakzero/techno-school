"use server";

import connectDB from "@/lib/mongodb";
import Attendance from "@/models/Attendance";
import Event from "@/models/Event";
import { revalidatePath } from "next/cache";

export async function saveAttendanceAction(
  dateString: string,
  grade: string,
  section: string,
  records: any[]
) {
  try {
    await connectDB();
    
    // Normalize date to midnight UTC to prevent tz mismatches determining attendance documents
    const rawDate = new Date(dateString);
    const date = new Date(Date.UTC(rawDate.getUTCFullYear(), rawDate.getUTCMonth(), rawDate.getUTCDate()));

    const holidayEvent = await Event.findOne({
      isHoliday: true,
      startDate: { $lte: date },
      endDate: { $gte: date },
      $or: [{ grade: "" }, { grade }],
    }).lean();

    if (holidayEvent) {
      return {
        success: false,
        error: `Attendance is blocked because "${holidayEvent.title}" is marked as a holiday on this date.`,
      };
    }

    const filter = { date, grade, section };
    const update = { records };

    await Attendance.findOneAndUpdate(filter, update, {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    });

    revalidatePath("/admin/attendance");
    return { success: true };
  } catch (error: any) {
    console.error("Error saving attendance:", error);
    return { success: false, error: error.message };
  }
}
