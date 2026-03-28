import Link from "next/link";
import { ArrowLeft, Printer } from "lucide-react";
import connectDB from "@/lib/mongodb";
import Attendance from "@/models/Attendance";
import Student from "@/models/Student";
import ClassModel from "@/models/Class";
import Setting from "@/models/Setting";

export const dynamic = "force-dynamic";

type SearchParams = {
  grade?: string;
  section?: string;
  month?: string;
};

function statusToCode(status?: string) {
  if (status === "Absent") return "A";
  if (status === "Late") return "L";
  if (status === "Excused") return "E";
  return "P";
}

export default async function AttendanceRegisterPrintPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const monthParam = searchParams.month || new Date().toISOString().slice(0, 7);
  const gradeParam = searchParams.grade || "";
  const sectionParam = searchParams.section || "";
  const [year, month] = monthParam.split("-").map(Number);
  const monthStart = new Date(year, month - 1, 1);
  const monthEnd = new Date(year, month, 0);

  await connectDB();

  const [classes, setting] = await Promise.all([
    ClassModel.find().lean(),
    Setting.findOne().lean(),
  ]);

  const grades = Array.from(new Set(classes.map((item: any) => item.grade))).sort();
  const sections = Array.from(new Set(classes.map((item: any) => item.section))).sort();
  const activeGrade = gradeParam || grades[0] || "";
  const activeSection = sectionParam || sections[0] || "";

  const [students, attendanceDocs] = await Promise.all([
    Student.find({ grade: activeGrade, section: activeSection }).sort({ name: 1 }).lean(),
    Attendance.find({
      grade: activeGrade,
      section: activeSection,
      date: { $gte: monthStart, $lte: monthEnd },
    }).lean(),
  ]);

  const recordMap = new Map<string, any>();
  attendanceDocs.forEach((doc: any) => {
    recordMap.set(new Date(doc.date).toISOString().split("T")[0], doc);
  });

  const days = Array.from({ length: monthEnd.getDate() }, (_, index) => {
    const date = new Date(year, month - 1, index + 1);
    return {
      number: index + 1,
      key: date.toISOString().split("T")[0],
    };
  });

  const schoolName = setting?.schoolName || "My School";
  const monthLabel = monthStart.toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Link
          href={`/admin/attendance?grade=${encodeURIComponent(activeGrade)}&section=${encodeURIComponent(activeSection)}&date=${monthParam}-01`}
          className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400"
        >
          <ArrowLeft size={16} />
          Back to Attendance
        </Link>
        <p className="inline-flex items-center gap-2 text-sm text-gray-500 dark:text-zinc-400">
          <Printer size={15} />
          Open browser print to print this register.
        </p>
      </div>

      <div className="rounded-3xl border border-gray-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
        <div className="border-b border-gray-200 bg-gradient-to-r from-slate-900 via-blue-900 to-sky-700 px-8 py-8 text-white dark:border-zinc-800">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-white/70">Attendance Register</p>
          <h1 className="mt-3 text-3xl font-black">{schoolName}</h1>
          <p className="mt-2 text-sm text-white/80">{activeGrade} - Section {activeSection}</p>
          <p className="mt-1 text-sm text-white/70">{monthLabel}</p>
        </div>

        <div className="space-y-6 px-8 py-8">
          <form method="GET" className="grid gap-4 rounded-2xl border border-gray-200 bg-gray-50/70 p-4 dark:border-zinc-800 dark:bg-zinc-950/60 md:grid-cols-[1fr_1fr_1fr_auto]">
            <select name="grade" defaultValue={activeGrade} className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100">
              {grades.map((grade) => (
                <option key={grade} value={grade}>{grade}</option>
              ))}
            </select>
            <select name="section" defaultValue={activeSection} className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100">
              {sections.map((section) => (
                <option key={section} value={section}>Section {section}</option>
              ))}
            </select>
            <input
              type="month"
              name="month"
              defaultValue={monthParam}
              className="rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100"
            />
            <button type="submit" className="rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700">
              Load Register
            </button>
          </form>

          <div className="overflow-x-auto rounded-2xl border border-gray-200 dark:border-zinc-800">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 dark:bg-zinc-800/50">
                <tr className="text-gray-500 dark:text-zinc-400">
                  <th className="sticky left-0 bg-gray-50 px-4 py-3 font-semibold dark:bg-zinc-800/50">Student</th>
                  {days.map((day) => (
                    <th key={day.key} className="px-3 py-3 text-center font-semibold">{day.number}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                {students.map((student: any) => (
                  <tr key={student._id}>
                    <td className="sticky left-0 whitespace-nowrap bg-white px-4 py-3 font-semibold text-gray-900 dark:bg-zinc-900 dark:text-zinc-100">
                      {student.name}
                    </td>
                    {days.map((day) => {
                      const doc = recordMap.get(day.key);
                      const record = doc?.records?.find((item: any) => item.studentId?.toString() === student._id.toString());
                      return (
                        <td key={day.key} className="px-3 py-3 text-center text-gray-600 dark:text-zinc-300">
                          {statusToCode(record?.status)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-zinc-400">
            <span>P = Present</span>
            <span>A = Absent</span>
            <span>L = Late</span>
            <span>E = Excused</span>
          </div>
        </div>
      </div>
    </div>
  );
}
