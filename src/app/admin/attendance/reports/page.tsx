import Link from "next/link";
import { ArrowLeft, BarChart3, Calendar, School, TrendingUp, Users } from "lucide-react";
import type { ReactNode } from "react";
import connectDB from "@/lib/mongodb";
import Attendance from "@/models/Attendance";
import ClassModel from "@/models/Class";
import Student from "@/models/Student";

export const dynamic = "force-dynamic";

type ClassReportRow = {
  id: string;
  name: string;
  present: number;
  absent: number;
  late: number;
  excused: number;
  totalDays: number;
  attendanceRate: number | null;
};

export default async function AttendanceReportsPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | undefined };
}) {
  const now = new Date();
  const defaultEndDate = toDateInputValue(now);
  const defaultStartDate = toDateInputValue(
    new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1))
  );

  const gradeParam = searchParams.grade || "";
  const sectionParam = searchParams.section || "";
  const startDateParam = searchParams.startDate || defaultStartDate;
  const endDateParam = searchParams.endDate || defaultEndDate;

  await connectDB();

  const classes = await ClassModel.find().sort({ grade: 1, section: 1 }).lean();
  const grades = Array.from(new Set(classes.map((item: any) => item.grade))).sort();
  const sections = Array.from(
    new Set(
      classes
        .filter((item: any) => !gradeParam || item.grade === gradeParam)
        .map((item: any) => item.section)
    )
  ).sort();

  const dateQuery = {
    date: {
      $gte: new Date(startDateParam),
      $lte: new Date(endDateParam),
    },
  };

  const schoolWideAttendanceDocs = await Attendance.find(dateQuery)
    .sort({ date: -1, grade: 1, section: 1 })
    .lean();

  let classReportRows: ClassReportRow[] = [];

  if (gradeParam && sectionParam) {
    const [students, classAttendanceDocs] = await Promise.all([
      Student.find({ grade: gradeParam, section: sectionParam }).sort({ name: 1 }).lean(),
      Attendance.find({
        ...dateQuery,
        grade: gradeParam,
        section: sectionParam,
      })
        .sort({ date: -1 })
        .lean(),
    ]);

    const reportMap = new Map<string, ClassReportRow>();

    students.forEach((student: any) => {
      reportMap.set(student._id.toString(), {
        id: student._id.toString(),
        name: student.name,
        present: 0,
        absent: 0,
        late: 0,
        excused: 0,
        totalDays: 0,
        attendanceRate: null,
      });
    });

    classAttendanceDocs.forEach((doc: any) => {
      doc.records?.forEach((record: any) => {
        const row = reportMap.get(record.studentId?.toString());
        if (!row) return;

        row.totalDays += 1;

        if (record.status === "Present") row.present += 1;
        else if (record.status === "Absent") row.absent += 1;
        else if (record.status === "Late") row.late += 1;
        else if (record.status === "Excused") row.excused += 1;
      });
    });

    classReportRows = Array.from(reportMap.values()).map((row) => ({
      ...row,
      attendanceRate:
        row.totalDays > 0 ? Math.round(((row.present + row.late) / row.totalDays) * 100) : null,
    }));
  }

  const classStudentsWithRecords = classReportRows.filter((row) => row.totalDays > 0).length;
  const classTotalAbsences = classReportRows.reduce((sum, row) => sum + row.absent, 0);
  const classAverageAttendance =
    classStudentsWithRecords > 0
      ? Math.round(
          classReportRows
            .filter((row) => row.attendanceRate !== null)
            .reduce((sum, row) => sum + (row.attendanceRate || 0), 0) / classStudentsWithRecords
        )
      : null;

  const dayFormatter = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  });

  const schoolWideSummaryMap = new Map<
    string,
    {
      dateKey: string;
      label: string;
      absent: number;
      late: number;
      excused: number;
      present: number;
      studentsMarked: number;
      classesRecorded: Set<string>;
    }
  >();

  schoolWideAttendanceDocs.forEach((doc: any) => {
    const attendanceDate = new Date(doc.date);
    const dateKey = toDateInputValue(attendanceDate);

    if (!schoolWideSummaryMap.has(dateKey)) {
      schoolWideSummaryMap.set(dateKey, {
        dateKey,
        label: dayFormatter.format(attendanceDate),
        absent: 0,
        late: 0,
        excused: 0,
        present: 0,
        studentsMarked: 0,
        classesRecorded: new Set<string>(),
      });
    }

    const summary = schoolWideSummaryMap.get(dateKey)!;
    summary.classesRecorded.add(`${doc.grade}-${doc.section}`);

    doc.records?.forEach((record: any) => {
      summary.studentsMarked += 1;

      if (record.status === "Present") summary.present += 1;
      else if (record.status === "Absent") summary.absent += 1;
      else if (record.status === "Late") summary.late += 1;
      else if (record.status === "Excused") summary.excused += 1;
    });
  });

  const schoolWideSummary = Array.from(schoolWideSummaryMap.values())
    .map((summary) => ({
      ...summary,
      classesRecordedCount: summary.classesRecorded.size,
    }))
    .sort((a, b) => b.dateKey.localeCompare(a.dateKey));

  const totalSchoolAbsences = schoolWideSummary.reduce((sum, day) => sum + day.absent, 0);
  const averageDailyAbsences =
    schoolWideSummary.length > 0 ? Math.round(totalSchoolAbsences / schoolWideSummary.length) : 0;
  const peakAbsenceDay =
    schoolWideSummary.length > 0
      ? schoolWideSummary.reduce((highest, current) =>
          current.absent > highest.absent ? current : highest
        )
      : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <Link
            href="/admin/attendance"
            className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-zinc-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors mb-2"
          >
            <ArrowLeft size={16} />
            Back to Attendance
          </Link>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-zinc-100">
            Attendance Reports
          </h1>
          <p className="text-gray-500 dark:text-zinc-400">
            Review class-wise attendance percentages and school-wide daily absentee trends.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
        <form method="GET" className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-5 gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
              Start Date
            </label>
            <input
              type="date"
              name="startDate"
              defaultValue={startDateParam}
              required
              className="w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-zinc-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
              End Date
            </label>
            <input
              type="date"
              name="endDate"
              defaultValue={endDateParam}
              required
              className="w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-zinc-300"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
              Grade
            </label>
            <select
              name="grade"
              defaultValue={gradeParam}
              className="w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-zinc-300"
            >
              <option value="">All Grades</option>
              {grades.map((grade) => (
                <option key={grade} value={grade}>
                  {grade}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">
              Section
            </label>
            <select
              name="section"
              defaultValue={sectionParam}
              className="w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-zinc-300"
            >
              <option value="">All Sections</option>
              {sections.map((section) => (
                <option key={section} value={section}>
                  Section {section}
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            className="inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold bg-gray-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-gray-800 dark:hover:bg-zinc-200 h-10 px-4 transition-colors"
          >
            <Calendar size={16} />
            Run Report
          </button>
        </form>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <SummaryCard
          icon={<Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
          title="Students With Records"
          value={classStudentsWithRecords.toString()}
          subtitle={
            gradeParam && sectionParam
              ? `${gradeParam} Section ${sectionParam}`
              : "Select a class to populate the class report"
          }
        />
        <SummaryCard
          icon={<TrendingUp className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />}
          title="Average Class Attendance"
          value={classAverageAttendance !== null ? `${classAverageAttendance}%` : "N/A"}
          subtitle="Present + late divided by recorded days"
        />
        <SummaryCard
          icon={<School className="h-5 w-5 text-red-600 dark:text-red-400" />}
          title="School Absences In Range"
          value={totalSchoolAbsences.toString()}
          subtitle={`${schoolWideSummary.length} recorded day${schoolWideSummary.length === 1 ? "" : "s"}`}
        />
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100">
                Class Attendance Report
              </h2>
              <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
                Per-student attendance percentages for the selected class and date range.
              </p>
            </div>
            {gradeParam && sectionParam ? (
              <span className="inline-flex items-center rounded-full border border-blue-200 dark:border-blue-500/20 bg-blue-50 dark:bg-blue-500/10 px-3 py-1 text-sm font-semibold text-blue-700 dark:text-blue-300">
                {gradeParam} Section {sectionParam}
              </span>
            ) : null}
          </div>
        </div>

        {gradeParam && sectionParam ? (
          classReportRows.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-6 pt-6">
                <MetricTile label="Students listed" value={classReportRows.length.toString()} tone="slate" />
                <MetricTile label="Total absences" value={classTotalAbsences.toString()} tone="red" />
                <MetricTile
                  label="Average attendance"
                  value={classAverageAttendance !== null ? `${classAverageAttendance}%` : "N/A"}
                  tone="emerald"
                />
              </div>

              <div className="overflow-x-auto p-6">
                <table className="w-full text-left text-sm">
                  <thead>
                    <tr className="text-gray-500 dark:text-zinc-400 border-b border-gray-200 dark:border-zinc-800">
                      <th className="pb-4 font-medium">Student</th>
                      <th className="pb-4 font-medium">Present</th>
                      <th className="pb-4 font-medium">Absent</th>
                      <th className="pb-4 font-medium">Late</th>
                      <th className="pb-4 font-medium">Excused</th>
                      <th className="pb-4 font-medium">Recorded Days</th>
                      <th className="pb-4 font-medium text-right">Attendance Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                    {classReportRows.map((row) => (
                      <tr key={row.id} className="hover:bg-gray-50 dark:hover:bg-zinc-800/40 transition-colors">
                        <td className="py-4 font-semibold text-gray-900 dark:text-zinc-100">{row.name}</td>
                        <td className="py-4 text-emerald-600 dark:text-emerald-400">{row.present}</td>
                        <td className="py-4 text-red-600 dark:text-red-400">{row.absent}</td>
                        <td className="py-4 text-amber-600 dark:text-amber-400">{row.late}</td>
                        <td className="py-4 text-gray-600 dark:text-zinc-300">{row.excused}</td>
                        <td className="py-4 text-gray-600 dark:text-zinc-400">{row.totalDays}</td>
                        <td className="py-4 text-right">
                          <span className="inline-flex items-center rounded-full border border-gray-200 dark:border-zinc-700 px-3 py-1 text-xs font-semibold text-gray-700 dark:text-zinc-200">
                            {row.attendanceRate !== null ? `${row.attendanceRate}%` : "N/A"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <EmptyState
              title="No student attendance found"
              description="This class has no recorded attendance in the selected date range yet."
            />
          )
        ) : (
          <EmptyState
            title="Choose a class to generate the report"
            description="Select both a grade and section above to unlock the class-level attendance table."
          />
        )}
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-900/50">
          <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100">
            School-wide Daily Absentee Summary
          </h2>
          <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">
            Daily totals across all recorded classes for the selected date range.
          </p>
        </div>

        {schoolWideSummary.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-6 pt-6">
              <MetricTile label="Total absences" value={totalSchoolAbsences.toString()} tone="red" />
              <MetricTile label="Average daily absences" value={averageDailyAbsences.toString()} tone="amber" />
              <MetricTile
                label="Peak absence day"
                value={peakAbsenceDay ? `${peakAbsenceDay.absent} students` : "N/A"}
                tone="slate"
                helper={peakAbsenceDay ? peakAbsenceDay.label : undefined}
              />
            </div>

            <div className="overflow-x-auto p-6">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="text-gray-500 dark:text-zinc-400 border-b border-gray-200 dark:border-zinc-800">
                    <th className="pb-4 font-medium">Date</th>
                    <th className="pb-4 font-medium">Absent</th>
                    <th className="pb-4 font-medium">Late</th>
                    <th className="pb-4 font-medium">Excused</th>
                    <th className="pb-4 font-medium">Present</th>
                    <th className="pb-4 font-medium">Classes Recorded</th>
                    <th className="pb-4 font-medium text-right">Students Marked</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-zinc-800">
                  {schoolWideSummary.map((day) => (
                    <tr key={day.dateKey} className="hover:bg-gray-50 dark:hover:bg-zinc-800/40 transition-colors">
                      <td className="py-4 font-semibold text-gray-900 dark:text-zinc-100">{day.label}</td>
                      <td className="py-4">
                        <StatusPill tone="red" value={day.absent} />
                      </td>
                      <td className="py-4">
                        <StatusPill tone="amber" value={day.late} />
                      </td>
                      <td className="py-4">
                        <StatusPill tone="slate" value={day.excused} />
                      </td>
                      <td className="py-4 text-emerald-600 dark:text-emerald-400 font-medium">{day.present}</td>
                      <td className="py-4 text-gray-600 dark:text-zinc-400">{day.classesRecordedCount}</td>
                      <td className="py-4 text-right text-gray-900 dark:text-zinc-100 font-medium">{day.studentsMarked}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <EmptyState
            title="No attendance history in this range"
            description="Adjust the date filters above after more attendance has been recorded."
          />
        )}
      </div>
    </div>
  );
}

function SummaryCard({
  icon,
  title,
  value,
  subtitle,
}: {
  icon: ReactNode;
  title: string;
  value: string;
  subtitle: string;
}) {
  return (
    <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="h-10 w-10 rounded-xl bg-gray-50 dark:bg-zinc-800 flex items-center justify-center">
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500 dark:text-zinc-400">{title}</p>
          <p className="text-2xl font-black text-gray-900 dark:text-zinc-100 mt-1">{value}</p>
        </div>
      </div>
      <p className="text-sm text-gray-500 dark:text-zinc-400">{subtitle}</p>
    </div>
  );
}

function MetricTile({
  label,
  value,
  tone,
  helper,
}: {
  label: string;
  value: string;
  tone: "emerald" | "red" | "amber" | "slate";
  helper?: string;
}) {
  const tones = {
    emerald: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
    red: "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400",
    amber: "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400",
    slate: "bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300",
  };

  return (
    <div className={`rounded-xl px-4 py-4 ${tones[tone]}`}>
      <p className="text-xs font-semibold uppercase tracking-wide opacity-80">{label}</p>
      <p className="text-2xl font-black mt-2">{value}</p>
      {helper ? <p className="text-xs opacity-80 mt-1">{helper}</p> : null}
    </div>
  );
}

function StatusPill({ tone, value }: { tone: "red" | "amber" | "slate"; value: number }) {
  const tones = {
    red: "bg-red-50 dark:bg-red-500/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-500/20",
    amber: "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-500/20",
    slate: "bg-gray-100 dark:bg-zinc-800 text-gray-700 dark:text-zinc-300 border-gray-200 dark:border-zinc-700",
  };

  return (
    <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold ${tones[tone]}`}>
      {value}
    </span>
  );
}

function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="px-6 py-12 text-center">
      <div className="mx-auto h-12 w-12 rounded-2xl bg-gray-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
        <BarChart3 className="h-6 w-6 text-gray-400 dark:text-zinc-500" />
      </div>
      <p className="text-base font-semibold text-gray-900 dark:text-zinc-100">{title}</p>
      <p className="text-sm text-gray-500 dark:text-zinc-400 mt-2 max-w-md mx-auto">{description}</p>
    </div>
  );
}

function toDateInputValue(date: Date) {
  return date.toISOString().split("T")[0];
}
