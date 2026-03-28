import connectDB from "@/lib/mongodb";
import Student from "@/models/Student";
import Attendance from "@/models/Attendance";
import ClassModel from "@/models/Class";
import Event from "@/models/Event";
import AttendanceForm from "./AttendanceForm";
import Link from "next/link";
import { BarChart3, Calendar, Filter, History, Flag, Sparkles, ChevronLeft, ChevronRight, LayoutList, CalendarDays, Printer } from "lucide-react";

export const dynamic = 'force-dynamic';

export default async function AttendancePage({ searchParams }: { searchParams: { [key: string]: string | undefined } }) {
  const dateParam = searchParams.date || new Date().toISOString().split('T')[0];
  const gradeParam = searchParams.grade || "";
  const sectionParam = searchParams.section || "";
  const viewParam = searchParams.view || "list";
  const selectedDate = new Date(dateParam);
  const prevDate = new Date(selectedDate);
  prevDate.setDate(selectedDate.getDate() - 1);
  const nextDate = new Date(selectedDate);
  nextDate.setDate(selectedDate.getDate() + 1);
  const prevDateString = prevDate.toISOString().split("T")[0];
  const nextDateString = nextDate.toISOString().split("T")[0];
  const monthStart = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
  const monthEnd = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);

  const buildHref = (overrides: Record<string, string>) => {
    const params = new URLSearchParams();
    params.set("date", overrides.date || dateParam);
    if (overrides.grade || gradeParam) params.set("grade", overrides.grade || gradeParam);
    if (overrides.section || sectionParam) params.set("section", overrides.section || sectionParam);
    params.set("view", overrides.view || viewParam);
    return `/admin/attendance?${params.toString()}`;
  };

  await connectDB();
  const classes = await ClassModel.find().lean();
  const grades = Array.from(new Set(classes.map(c => c.grade))).sort();
  const sections = Array.from(new Set(classes.map(c => c.section))).sort();

  let students: any[] = [];
  let existingRecords: any[] = [];
  let holidayEvent: any = null;
  let dayEvents: any[] = [];
  let monthAttendanceDocs: any[] = [];
  let monthEvents: any[] = [];

  if (gradeParam && sectionParam) {
    students = await Student.find({ grade: gradeParam, section: sectionParam })
      .sort({ name: 1 })
      .lean();

    const rawDate = new Date(dateParam);
    const date = new Date(Date.UTC(rawDate.getUTCFullYear(), rawDate.getUTCMonth(), rawDate.getUTCDate()));

    const attendanceDoc = await Attendance.findOne({ date, grade: gradeParam, section: sectionParam }).lean();
    if (attendanceDoc) {
      existingRecords = attendanceDoc.records;
    }

    dayEvents = await Event.find({
      startDate: { $lte: date },
      endDate: { $gte: date },
      $or: [{ grade: "" }, { grade: gradeParam }],
    })
      .sort({ isHoliday: -1, startDate: 1 })
      .lean();

    holidayEvent = dayEvents.find((event: any) => event.isHoliday) || null;

    monthAttendanceDocs = await Attendance.find({
      grade: gradeParam,
      section: sectionParam,
      date: { $gte: monthStart, $lte: monthEnd },
    }).lean();

    monthEvents = await Event.find({
      startDate: { $lte: monthEnd },
      endDate: { $gte: monthStart },
      $or: [{ grade: "" }, { grade: gradeParam }],
    }).lean();
  }

  const monthTitle = monthStart.toLocaleDateString("en-US", { month: "long", year: "numeric" });
  const daysInMonth = monthEnd.getDate();
  const startWeekday = monthStart.getDay();
  const attendanceByDate = new Map(
    monthAttendanceDocs.map((doc: any) => [new Date(doc.date).toISOString().split("T")[0], doc])
  );
  const holidayByDate = new Map<string, any>();
  monthEvents.forEach((event: any) => {
    let cursor = new Date(event.startDate);
    const end = new Date(event.endDate);
    while (cursor <= end) {
      const key = cursor.toISOString().split("T")[0];
      if (!holidayByDate.has(key) && event.isHoliday) {
        holidayByDate.set(key, event);
      }
      cursor.setDate(cursor.getDate() + 1);
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-zinc-100">Attendance</h1>
          <p className="text-gray-500 dark:text-zinc-400">Record and monitor daily student attendance by class.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            href={`/admin/attendance/register?grade=${encodeURIComponent(gradeParam || "")}&section=${encodeURIComponent(sectionParam || "")}&month=${dateParam.slice(0, 7)}`}
            className="inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 border border-gray-200 dark:border-zinc-800 h-10 px-4 shadow-sm hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
          >
            <Printer size={18} />
            Print Register
          </Link>
          <Link
            href="/admin/attendance/history"
            className="inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 border border-gray-200 dark:border-zinc-800 h-10 px-4 shadow-sm hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors"
          >
            <History size={18} />
            View History
          </Link>
          <Link
            href="/admin/attendance/reports"
            className="inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold bg-gray-900 dark:bg-zinc-100 text-white dark:text-zinc-900 h-10 px-4 shadow-sm hover:bg-gray-800 dark:hover:bg-zinc-200 transition-colors"
          >
            <BarChart3 size={18} />
            View Reports
          </Link>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm">
        <form method="GET" className="grid grid-cols-1 lg:grid-cols-[1.1fr_1.1fr_1.1fr_auto] gap-4 items-end">
          <input type="hidden" name="view" value={viewParam} />
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Grade</label>
            <select 
              name="grade"
              defaultValue={gradeParam}
              required
              className="w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-zinc-300"
            >
              <option value="" disabled>Select Grade...</option>
              {grades.map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Section</label>
            <select 
              name="section"
              defaultValue={sectionParam}
              required
              className="w-full h-10 px-3 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-zinc-300"
            >
              <option value="" disabled>Select Section...</option>
              {sections.map(s => (
                <option key={s} value={s}>Section {s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-zinc-300 mb-1">Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input 
                type="date" 
                name="date"
                defaultValue={dateParam}
                required
                className="w-full h-10 pl-10 pr-4 rounded-lg border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 dark:text-zinc-300"
              />
            </div>
          </div>
          <div>
            <button type="submit" className="w-full inline-flex items-center justify-center gap-2 rounded-lg text-sm font-semibold bg-gray-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:bg-gray-800 dark:hover:bg-zinc-200 h-10 px-4 transition-colors">
              <Filter size={16} />
              Load Roster
            </button>
          </div>
        </form>
        <div className="mt-4 flex flex-col gap-3 border-t border-gray-100 pt-4 dark:border-zinc-800 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Link href={buildHref({ date: prevDateString })} className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">
              <ChevronLeft size={16} />
              Previous
            </Link>
            <span className="rounded-lg bg-blue-50 px-3 py-2 text-sm font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
              Showing {selectedDate.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}
            </span>
            <Link href={buildHref({ date: nextDateString })} className="inline-flex items-center gap-1 rounded-lg border border-gray-200 px-3 py-2 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800">
              Next
              <ChevronRight size={16} />
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Link href={buildHref({ view: "list" })} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${viewParam === "list" ? "bg-gray-900 text-white dark:bg-zinc-100 dark:text-zinc-900" : "border border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"}`}>
              <LayoutList size={16} />
              List View
            </Link>
            <Link href={buildHref({ view: "calendar" })} className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold ${viewParam === "calendar" ? "bg-gray-900 text-white dark:bg-zinc-100 dark:text-zinc-900" : "border border-gray-200 text-gray-700 hover:bg-gray-50 dark:border-zinc-700 dark:text-zinc-300 dark:hover:bg-zinc-800"}`}>
              <CalendarDays size={16} />
              Calendar View
            </Link>
          </div>
        </div>
      </div>

      {gradeParam && sectionParam ? (
        <div className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 shadow-sm overflow-hidden">
          <div className="p-4 sm:px-6 border-b border-gray-200 dark:border-zinc-800 flex justify-between items-center bg-gray-50/50 dark:bg-zinc-900/50">
            <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100">
              {gradeParam} - Section {sectionParam}
            </h2>
            <span className="text-sm font-medium px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400 border border-blue-200 dark:border-blue-800/50">
              {new Date(dateParam).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC'})}
            </span>
          </div>
          
          {dayEvents.length > 0 && (
            <div className="px-4 sm:px-6 pt-4">
              <div className={`rounded-2xl border px-4 py-4 ${
                holidayEvent
                  ? "border-red-200 bg-red-50 dark:border-red-500/20 dark:bg-red-500/10"
                  : "border-blue-200 bg-blue-50 dark:border-blue-500/20 dark:bg-blue-500/10"
              }`}>
                <div className="flex items-start gap-3">
                  <div className={`mt-0.5 rounded-lg p-2 ${
                    holidayEvent
                      ? "bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400"
                      : "bg-blue-100 text-blue-600 dark:bg-blue-500/20 dark:text-blue-400"
                  }`}>
                    {holidayEvent ? <Flag size={16} /> : <Sparkles size={16} />}
                  </div>
                  <div className="space-y-2">
                    <p className={`text-sm font-semibold ${
                      holidayEvent ? "text-red-700 dark:text-red-300" : "text-blue-700 dark:text-blue-300"
                    }`}>
                      {holidayEvent
                        ? `Attendance is blocked because ${holidayEvent.title} is marked as a holiday.`
                        : "Calendar events found for this date."}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {dayEvents.map((event: any) => (
                        <span
                          key={event._id.toString()}
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                            event.isHoliday
                              ? "bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-300"
                              : "bg-white text-gray-700 border border-gray-200 dark:bg-zinc-900 dark:border-zinc-700 dark:text-zinc-300"
                          }`}
                        >
                          {event.title}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {viewParam === "calendar" ? (
            <div className="p-4 sm:p-6">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 dark:text-zinc-100">{monthTitle}</h3>
                  <p className="text-sm text-gray-500 dark:text-zinc-400">Monthly attendance overview for {gradeParam} Section {sectionParam}</p>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-2 text-center text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-zinc-500">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="py-2">{day}</div>
                ))}
              </div>
              <div className="mt-2 grid grid-cols-7 gap-2">
                {Array.from({ length: startWeekday }).map((_, index) => (
                  <div key={`empty-${index}`} className="min-h-[110px] rounded-2xl border border-dashed border-gray-200 bg-gray-50/70 dark:border-zinc-800 dark:bg-zinc-950/40" />
                ))}
                {Array.from({ length: daysInMonth }).map((_, index) => {
                  const dayNumber = index + 1;
                  const dayDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), dayNumber);
                  const dayKey = dayDate.toISOString().split("T")[0];
                  const attendanceDoc = attendanceByDate.get(dayKey);
                  const holiday = holidayByDate.get(dayKey);
                  const dayHref = buildHref({ date: dayKey, view: "list" });

                  return (
                    <Link
                      key={dayKey}
                      href={dayHref}
                      className={`min-h-[110px] rounded-2xl border p-3 transition-colors ${
                        dayKey === dateParam
                          ? "border-blue-300 bg-blue-50 dark:border-blue-500/40 dark:bg-blue-500/10"
                          : holiday
                            ? "border-red-200 bg-red-50 dark:border-red-500/20 dark:bg-red-500/10"
                            : attendanceDoc
                              ? "border-emerald-200 bg-emerald-50 dark:border-emerald-500/20 dark:bg-emerald-500/10"
                              : "border-gray-200 bg-white hover:bg-gray-50 dark:border-zinc-800 dark:bg-zinc-900 dark:hover:bg-zinc-800/60"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="text-sm font-bold text-gray-900 dark:text-zinc-100">{dayNumber}</span>
                        {holiday && <Flag size={14} className="text-red-500" />}
                      </div>
                      <div className="mt-3 space-y-1 text-left">
                        {holiday ? (
                          <p className="text-xs font-semibold text-red-700 dark:text-red-300">{holiday.title}</p>
                        ) : attendanceDoc ? (
                          <>
                            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-300">Attendance recorded</p>
                            <p className="text-xs text-emerald-700/80 dark:text-emerald-300/80">{attendanceDoc.records?.length || 0} students</p>
                          </>
                        ) : (
                          <p className="text-xs text-gray-500 dark:text-zinc-400">No attendance recorded</p>
                        )}
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          ) : students.length > 0 ? (
            <AttendanceForm 
              students={JSON.parse(JSON.stringify(students))} 
              existingRecords={JSON.parse(JSON.stringify(existingRecords))}
              dateString={dateParam}
              grade={gradeParam}
              section={sectionParam}
              holidayEvent={JSON.parse(JSON.stringify(holidayEvent))}
            />
          ) : (
            <div className="p-12 text-center text-gray-500 dark:text-zinc-400">
              No students found for this class. 
              <Link href="/admin/students" className="block mt-2 text-blue-600 dark:text-blue-400 hover:underline">Add students to get started.</Link>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-gray-50 dark:bg-zinc-900/50 border border-dashed border-gray-300 dark:border-zinc-700 rounded-xl p-12 text-center">
          <Calendar className="mx-auto h-12 w-12 text-gray-400 dark:text-zinc-600 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-zinc-100">No Class Selected</h3>
          <p className="mt-1 text-gray-500 dark:text-zinc-400 max-w-sm mx-auto">Use the filters above to select a date, grade, and section to begin recording attendance.</p>
        </div>
      )}
    </div>
  );
}
