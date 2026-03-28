import connectDB from "@/lib/mongodb";
import Attendance from "@/models/Attendance";
import ClassModel from "@/models/Class";
import HistoryClient from "./HistoryClient";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function AttendanceHistoryPage() {
  await connectDB();

  // Fetch initial records (last 30)
  const initialRecords = await Attendance.find()
    .sort({ date: -1 })
    .limit(30)
    .lean();

  // Fetch classes for filtering
  const classes = await ClassModel.find().lean();
  const grades = Array.from(new Set(classes.map(c => c.grade))).sort();
  const sections = Array.from(new Set(classes.map(c => c.section))).sort();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <Link href="/admin/attendance" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-2">
            <ArrowLeft size={16} />
            Back to Recorder
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-zinc-100">Attendance History</h1>
          <p className="text-gray-500 dark:text-zinc-400">View and analyze past attendance records across all classes.</p>
        </div>
      </div>

      <HistoryClient 
        initialRecords={JSON.parse(JSON.stringify(initialRecords))} 
        grades={grades} 
        sections={sections} 
      />
    </div>
  );
}
