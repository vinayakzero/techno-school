"use server";

import connectDB from "@/lib/mongodb";
import Attendance from "@/models/Attendance";

export async function getAttendanceHistoryAction(filters: {
  grade?: string;
  section?: string;
  startDate?: string;
  endDate?: string;
}) {
  try {
    await connectDB();
    const query: any = {};

    if (filters.grade) query.grade = filters.grade;
    if (filters.section) query.section = filters.section;
    
    if (filters.startDate || filters.endDate) {
      query.date = {};
      if (filters.startDate) query.date.$gte = new Date(filters.startDate);
      if (filters.endDate) query.date.$lte = new Date(filters.endDate);
    }

    const records = await Attendance.find(query)
      .sort({ date: -1 })
      .lean();

    return { 
      success: true, 
      data: JSON.parse(JSON.stringify(records)) 
    };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
