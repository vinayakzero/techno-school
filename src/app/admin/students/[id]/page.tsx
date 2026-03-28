import connectDB from "@/lib/mongodb";
import Student from "@/models/Student";
import Attendance from "@/models/Attendance";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, Phone, MapPin, Calendar, User, BookOpen, Users, Wallet } from "lucide-react";
import StudentProfileActions from "./StudentProfileActions";
import mongoose from "mongoose";
import Payment from "@/models/Payment";
import Setting from "@/models/Setting";
import Result from "@/models/Result";
import Exam from "@/models/Exam";
import Subject from "@/models/Subject";
import ClassModel from "@/models/Class";
import Course from "@/models/Course";
import Teacher from "@/models/Teacher";

export const dynamic = 'force-dynamic';

type AttendanceStatus = "Present" | "Absent" | "Late" | "Excused";

type MonthlyAttendanceSummary = {
  monthKey: string;
  label: string;
  present: number;
  absent: number;
  late: number;
  excused: number;
  totalDays: number;
  attendanceRate: number;
};

export default async function StudentProfilePage({ params }: { params: { id: string } }) {
  const { id } = params;
  
  if (!mongoose.Types.ObjectId.isValid(id)) {
    notFound();
  }

  await connectDB();

  const [student, paymentHistory, setting] = await Promise.all([
    Student.findById(id).lean(),
    Payment.find({ studentId: id }).sort({ date: -1, createdAt: -1 }).limit(5).lean(),
    Setting.findOne().lean(),
  ]);
  if (!student) notFound();
  const currencySymbol = setting?.currencySymbol || "$";

  const [resultDocs, classDoc, courseDoc] = await Promise.all([
    Result.find({ student: id })
      .populate({
        path: "exam",
        populate: { path: "subject", select: "name code" },
      })
      .sort({ createdAt: -1 })
      .lean(),
    ClassModel.findOne({ grade: student.grade, section: student.section }).populate("classTeacher", "name").lean(),
    Course.findOne({ grade: student.grade, isActive: true }).lean(),
  ]);

  const allAttendance = await Attendance.find({
    grade: student.grade,
    section: student.section,
    "records.studentId": student._id,
  }).lean();

  let present = 0, absent = 0, late = 0, excused = 0;
  const monthFormatter = new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  const monthlyAttendanceMap = new Map<string, MonthlyAttendanceSummary>();

  allAttendance.forEach((doc: any) => {
    const record = doc.records?.find(
      (r: any) => r.studentId?.toString() === id
    );

    if (!record) return;

    const status = record.status as AttendanceStatus;
    if (status === "Present") present++;
    else if (status === "Absent") absent++;
    else if (status === "Late") late++;
    else if (status === "Excused") excused++;

    const attendanceDate = new Date(doc.date);
    const monthKey = `${attendanceDate.getUTCFullYear()}-${String(attendanceDate.getUTCMonth() + 1).padStart(2, "0")}`;

    if (!monthlyAttendanceMap.has(monthKey)) {
      const monthStart = new Date(Date.UTC(attendanceDate.getUTCFullYear(), attendanceDate.getUTCMonth(), 1));
      monthlyAttendanceMap.set(monthKey, {
        monthKey,
        label: monthFormatter.format(monthStart),
        present: 0,
        absent: 0,
        late: 0,
        excused: 0,
        totalDays: 0,
        attendanceRate: 0,
      });
    }

    const summary = monthlyAttendanceMap.get(monthKey)!;
    summary.totalDays += 1;

    if (status === "Present") summary.present += 1;
    else if (status === "Absent") summary.absent += 1;
    else if (status === "Late") summary.late += 1;
    else if (status === "Excused") summary.excused += 1;
  });

  const totalDays = present + absent + late + excused;
  const attendancePct = totalDays > 0 ? Math.round(((present + late) / totalDays) * 100) : null;
  const monthlyAttendance = Array.from(monthlyAttendanceMap.values())
    .map((summary) => ({
      ...summary,
      attendanceRate: summary.totalDays > 0
        ? Math.round(((summary.present + summary.late) / summary.totalDays) * 100)
        : 0,
    }))
    .sort((a, b) => b.monthKey.localeCompare(a.monthKey));

  const s = JSON.parse(JSON.stringify(student));
  const academicResults = resultDocs
    .filter((result: any) => result.exam)
    .map((result: any) => {
      const totalMarks = result.exam?.totalMarks || 0;
      const percentage = totalMarks > 0 ? Math.round((result.marksObtained / totalMarks) * 100) : 0;
      return {
        ...result,
        percentage,
        subjectName: result.exam?.subject?.name || "Unknown Subject",
      };
    });

  const averageScore = academicResults.length > 0
    ? Math.round(academicResults.reduce((sum: number, result: any) => sum + result.percentage, 0) / academicResults.length)
    : null;

  const bestResult = academicResults.reduce((best: any, current: any) => {
    if (!best || current.percentage > best.percentage) return current;
    return best;
  }, null);

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Link href="/admin/students" className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
        <ArrowLeft size={16} />
        Back to Students
      </Link>
      <Link
        href={`/admin/students/${id}/documents`}
        className="mt-3 inline-flex items-center gap-2 rounded-xl border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition-colors hover:bg-blue-100 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300 dark:hover:bg-blue-500/20"
      >
        Open Documents
      </Link>

      {/* Hero Card */}
      <div className="bg-white dark:bg-zinc-900 rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-blue-500 to-indigo-600" />
        <div className="px-6 pb-6">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-12">
            <div className="h-24 w-24 rounded-2xl bg-white dark:bg-zinc-800 border-4 border-white dark:border-zinc-900 shadow-lg flex items-center justify-center text-blue-600 dark:text-blue-400 font-black text-3xl shrink-0">
              {s.name ? s.name.split(" ").slice(0, 2).map((n: string) => n[0]).join("") : "ST"}
            </div>
            <div className="flex-1 pb-1">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-100">{s.name || "Unknown Student"}</h1>
              <p className="text-gray-500 dark:text-zinc-400">{s.grade} · Section {s.section} · {s.gender}</p>
            </div>
            <div className="flex items-center gap-3 mt-2 sm:mt-0">
              <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold border ${
                s.status === "Active" ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20"
                : s.status === "Pending" ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20"
                : "bg-gray-100 text-gray-700 border-gray-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700"
              }`}>
                {s.status}
              </span>
              <StudentProfileActions student={s} />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatBox label="Days Present" value={present} color="emerald" />
        <StatBox label="Days Absent" value={absent} color="red" />
        <StatBox label="Days Late" value={late} color="amber" />
        <StatBox
          label="Attendance Rate"
          value={attendancePct !== null ? `${attendancePct}%` : "N/A"}
          color="blue"
          subtitle={totalDays > 0 ? `Out of ${totalDays} recorded days` : "No records yet"}
        />
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 mb-6">
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-zinc-100">Monthly Attendance Summary</h2>
            <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
              A month-by-month breakdown of recorded attendance for {s.name}.
            </p>
          </div>
          <div className="rounded-xl bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 px-4 py-3 min-w-[180px]">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700 dark:text-blue-300">Overall Attendance</p>
            <p className="text-2xl font-black text-blue-700 dark:text-blue-300 mt-1">
              {attendancePct !== null ? `${attendancePct}%` : "N/A"}
            </p>
            <p className="text-xs text-blue-700/80 dark:text-blue-300/80 mt-1">
              Based on {totalDays} recorded day{totalDays === 1 ? "" : "s"}
            </p>
          </div>
        </div>

        {monthlyAttendance.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {monthlyAttendance.map((summary) => (
              <div
                key={summary.monthKey}
                className="rounded-2xl border border-gray-200 dark:border-zinc-800 bg-gray-50/70 dark:bg-zinc-950/60 p-5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-500 dark:text-zinc-400">{summary.label}</p>
                    <p className="text-2xl font-black text-gray-900 dark:text-zinc-100 mt-2">{summary.attendanceRate}%</p>
                    <p className="text-xs text-gray-500 dark:text-zinc-500 mt-1">
                      {summary.totalDays} recorded day{summary.totalDays === 1 ? "" : "s"}
                    </p>
                  </div>
                  <span className="inline-flex items-center rounded-full border border-blue-200 dark:border-blue-500/20 bg-blue-50 dark:bg-blue-500/10 px-3 py-1 text-xs font-semibold text-blue-700 dark:text-blue-300">
                    Attendance
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 mt-5">
                  <MonthlyMetric label="Present" value={summary.present} tone="emerald" />
                  <MonthlyMetric label="Absent" value={summary.absent} tone="red" />
                  <MonthlyMetric label="Late" value={summary.late} tone="amber" />
                  <MonthlyMetric label="Excused" value={summary.excused} tone="slate" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="rounded-2xl border border-dashed border-gray-300 dark:border-zinc-700 bg-gray-50/70 dark:bg-zinc-950/40 px-6 py-10 text-center">
            <p className="text-sm font-semibold text-gray-900 dark:text-zinc-100">No attendance records yet</p>
            <p className="text-sm text-gray-500 dark:text-zinc-400 mt-2">
              Start recording daily attendance to generate monthly reports for this student.
            </p>
          </div>
        )}
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Details */}
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm p-6">
          <h2 className="text-base font-bold text-gray-900 dark:text-zinc-100 mb-4">Personal Information</h2>
          <div className="space-y-3">
            <InfoRow icon={<Mail size={16} />} label="Email" value={s.email} />
            <InfoRow icon={<Phone size={16} />} label="Phone" value={s.phone} />
            <InfoRow icon={<Calendar size={16} />} label="Date of Birth"
              value={s.dateOfBirth ? new Date(s.dateOfBirth).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "—"} />
            <InfoRow icon={<MapPin size={16} />} label="Address" value={s.address || "—"} />
            <InfoRow icon={<User size={16} />} label="Gender" value={s.gender} />
            <InfoRow icon={<Calendar size={16} />} label="Enrollment Date"
              value={s.enrollmentDate ? new Date(s.enrollmentDate).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "—"} />
          </div>
        </div>

        {/* Parent & Academic Details */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm p-6">
            <h2 className="text-base font-bold text-gray-900 dark:text-zinc-100 mb-4">Parent / Guardian</h2>
            <div className="space-y-3">
              <InfoRow icon={<Users size={16} />} label="Name" value={s.parentName} />
              <InfoRow icon={<Phone size={16} />} label="Phone" value={s.parentPhone} />
            </div>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm p-6">
            <h2 className="text-base font-bold text-gray-900 dark:text-zinc-100 mb-4">Academic Details</h2>
            <div className="space-y-3">
              <InfoRow icon={<BookOpen size={16} />} label="Grade" value={s.grade} />
              <InfoRow icon={<BookOpen size={16} />} label="Section" value={`Section ${s.section}`} />
              <InfoRow icon={<BookOpen size={16} />} label="Course" value={courseDoc?.name || "Not assigned"} />
              <InfoRow icon={<Users size={16} />} label="Class Teacher" value={(classDoc as any)?.classTeacher?.name || "Not assigned"} />
              <InfoRow icon={<Calendar size={16} />} label="Subjects" value={`${courseDoc?.coreSubjects?.length || 0} active subjects`} />
              <InfoRow icon={<Calendar size={16} />} label="Exams Attempted" value={`${academicResults.length}`} />
              <InfoRow icon={<Calendar size={16} />} label="Average Score" value={averageScore !== null ? `${averageScore}%` : "No results yet"} />
              <InfoRow icon={<Calendar size={16} />} label="Best Subject" value={bestResult ? `${bestResult.subjectName} (${bestResult.percentage}%)` : "No results yet"} />
              <InfoRow icon={<Calendar size={16} />} label="Fees (Total)" value={`${currencySymbol}${(s.fees?.total || 0).toLocaleString()}`} />
              <InfoRow icon={<Calendar size={16} />} label="Fees (Paid)" value={`${currencySymbol}${(s.fees?.paid || 0).toLocaleString()}`} />
              <InfoRow
                icon={<Calendar size={16} />}
                label="Fees (Pending)"
                value={`${currencySymbol}${(s.fees?.pending || 0).toLocaleString()}`}
                valueClass="text-red-600 dark:text-red-400 font-semibold"
              />
            </div>
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm p-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 className="text-base font-bold text-gray-900 dark:text-zinc-100">Recent Payments</h2>
              <Link href="/admin/fees" className="text-sm font-medium text-blue-600 hover:underline">
                Open Fees
              </Link>
            </div>
            {paymentHistory.length > 0 ? (
              <div className="space-y-3">
                {paymentHistory.map((payment: any) => (
                  <div key={payment._id.toString()} className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/70 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950/60">
                    <div className="flex items-start gap-3">
                      <span className="rounded-lg bg-emerald-50 p-2 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400">
                        <Wallet size={16} />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-zinc-100">{currencySymbol}{payment.amount.toLocaleString()}</p>
                        <p className="text-xs text-gray-500 dark:text-zinc-500">
                          {payment.mode} • {new Date(payment.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </p>
                      </div>
                    </div>
                    <Link href={`/admin/fees/receipts/${payment._id.toString()}`} className="text-xs font-semibold text-blue-600 hover:underline">
                      {payment.receiptNo}
                    </Link>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-gray-300 dark:border-zinc-700 bg-gray-50/70 dark:bg-zinc-950/40 px-6 py-8 text-center">
                <p className="text-sm font-semibold text-gray-900 dark:text-zinc-100">No payments recorded</p>
                <p className="text-sm text-gray-500 dark:text-zinc-400 mt-2">
                  Record a payment from the fees module to show transaction history here.
                </p>
              </div>
            )}
          </div>
          <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm p-6">
            <div className="flex items-center justify-between gap-3 mb-4">
              <h2 className="text-base font-bold text-gray-900 dark:text-zinc-100">Academic Performance Snapshot</h2>
              <Link href={`/admin/students/${id}/results`} className="text-sm font-medium text-blue-600 hover:underline">
                Open Report Card
              </Link>
            </div>
            {academicResults.length > 0 ? (
              <div className="space-y-3">
                {academicResults.slice(0, 5).map((result: any) => (
                  <div key={result._id.toString()} className="flex items-center justify-between rounded-xl border border-gray-100 bg-gray-50/70 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950/60">
                    <div>
                      <p className="text-sm font-semibold text-gray-900 dark:text-zinc-100">{result.subjectName}</p>
                      <p className="text-xs text-gray-500 dark:text-zinc-500">{result.exam?.name || "Exam"} • {result.marksObtained}/{result.exam?.totalMarks || 0}</p>
                    </div>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      result.percentage >= 80
                        ? "bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-400"
                        : result.percentage >= 60
                          ? "bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400"
                          : "bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400"
                    }`}>
                      {result.percentage}%
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-2xl border border-dashed border-gray-300 dark:border-zinc-700 bg-gray-50/70 dark:bg-zinc-950/40 px-6 py-8 text-center">
                <p className="text-sm font-semibold text-gray-900 dark:text-zinc-100">No academic results yet</p>
                <p className="text-sm text-gray-500 dark:text-zinc-400 mt-2">
                  Enter marks from the exams module to show a performance snapshot here.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatBox({ label, value, color, subtitle }: any) {
  const colors: any = {
    emerald: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    red: "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400",
    amber: "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400",
    blue: "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-400",
  };
  return (
    <div className={`rounded-xl p-5 ${colors[color]} border border-current/10`}>
      <p className="text-3xl font-black mb-1">{value}</p>
      <p className="text-sm font-semibold opacity-80">{label}</p>
      {subtitle && <p className="text-xs opacity-60 mt-0.5">{subtitle}</p>}
    </div>
  );
}

function MonthlyMetric({ label, value, tone }: { label: string; value: number; tone: "emerald" | "red" | "amber" | "slate" }) {
  const tones = {
    emerald: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    red: "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400",
    amber: "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400",
    slate: "bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300",
  };

  return (
    <div className={`rounded-xl px-4 py-3 ${tones[tone]}`}>
      <p className="text-2xl font-black">{value}</p>
      <p className="text-xs font-semibold uppercase tracking-wide opacity-80 mt-1">{label}</p>
    </div>
  );
}

function InfoRow({ icon, label, value, valueClass }: any) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-gray-400 dark:text-zinc-500 mt-0.5 shrink-0">{icon}</span>
      <span className="text-sm text-gray-500 dark:text-zinc-400 w-32 shrink-0">{label}</span>
      <span className={`text-sm font-medium text-gray-900 dark:text-zinc-100 ${valueClass || ""}`}>{value}</span>
    </div>
  );
}
