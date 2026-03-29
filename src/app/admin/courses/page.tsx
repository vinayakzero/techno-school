import connectDB from "@/lib/mongodb";
import Course from "@/models/Course";
import Setting from "@/models/Setting";

export const dynamic = "force-dynamic";

export default async function CoursesPage() {
  await connectDB();

  const [courses, setting] = await Promise.all([
    Course.find().sort({ grade: 1, name: 1 }).lean(),
    Setting.findOne().lean(),
  ]);

  const activeCourses = courses.filter((course: any) => course.isActive).length;
  const totalSubjects = courses.reduce((sum: number, course: any) => sum + (course.coreSubjects?.length || 0), 0);

  return (
    <div className="min-h-screen bg-gray-50/50 p-4 dark:bg-black sm:p-6 lg:p-8">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-zinc-100">Courses</h1>
          <p className="text-gray-500 dark:text-zinc-400">
            Review course structures and grade-level academic programs for {setting?.academicYear || "the active session"}.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <SummaryCard label="Total Courses" value={courses.length.toString()} />
          <SummaryCard label="Active Courses" value={activeCourses.toString()} />
          <SummaryCard label="Core Subjects" value={totalSubjects.toString()} />
        </div>

        <div className="grid gap-4 xl:grid-cols-2">
          {courses.map((course: any) => (
            <article key={course._id} className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-lg font-bold text-gray-900 dark:text-zinc-100">{course.name}</h2>
                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
                  {course.grade}
                </span>
                <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${course.isActive ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300" : "bg-gray-100 text-gray-600 dark:bg-zinc-800 dark:text-zinc-400"}`}>
                  {course.isActive ? "Active" : "Inactive"}
                </span>
              </div>
              <p className="mt-2 text-sm text-gray-500 dark:text-zinc-400">{course.code}</p>
              <p className="mt-3 text-sm text-gray-600 dark:text-zinc-300">
                {course.description || "No course description is available yet."}
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {(course.coreSubjects || []).map((subject: string) => (
                  <span key={subject} className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600 dark:bg-zinc-800 dark:text-zinc-300">
                    {subject}
                  </span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

function SummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-zinc-800 dark:bg-zinc-900">
      <p className="text-sm font-medium text-gray-500 dark:text-zinc-400">{label}</p>
      <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-zinc-100">{value}</p>
    </div>
  );
}
